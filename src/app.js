import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cleanupOrphanMedia,
  commitImportBatch,
  createAction,
  createArticleComment,
  createDatabase,
  createContentEntry,
  createImportBatch,
  createKnowledge,
  deleteArticleComment,
  deleteContentEntry,
  deleteKnowledge,
  getAction,
  getArticleRelationships,
  getContentEntry,
  getImport,
  getKnowledge,
  getKnowledgeStats,
  getProduct,
  getStore,
  incrementKnowledgeViews,
  listActions,
  listActivities,
  listAdTerms,
  listAfterSales,
  listArchive,
  listAllComments,
  listArticleComments,
  listContentEntries,
  listDailyMetrics,
  listImports,
  listInventory,
  listKnowledge,
  listMedia,
  listProducts,
  listStores,
  registerMedia,
  replaceImportRows,
  refreshOperationalActions,
  updateAction,
  updateArticleCommentStatus,
  updateContentEntry,
  updateImportStatus,
  updateKnowledge
} from './store.js';
import {
  actionsForStore,
  buildOverview,
  deriveAdTerm,
  deriveAfterSale,
  deriveInventory,
  deriveProduct,
  deriveStoreHealth
} from './metrics.js';
import { renderMarkdown } from './markdown.js';
import { CONTENT_TYPES as CONTENT_ENTRY_TYPES } from './content-store.js';
import { autoMapHeaders, parseImportFile, validateMappedRows } from './imports.js';
import { generateOperationsReport } from './reports.js';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(MODULE_DIR, '..', 'public');
const WEB_DIST_DIR = resolve(MODULE_DIR, '..', 'web', 'dist');
const MAX_BODY_BYTES = 16 * 1024 * 1024;
const VERSION = '3.0.0';
const CONTENT_TYPES = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8'
};
const ACTION_STATUSES = ['open', 'in_progress', 'deferred', 'done', 'closed', 'ignored'];
const ACTION_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function createApp({ dbPath } = {}) {
  const db = createDatabase(dbPath);
  const dataDirectory = dirname(dbPath || resolve('data/crosspilot.db'));
  const uploadsDirectory = resolve(dataDirectory, 'uploads');
  mkdirSync(uploadsDirectory, { recursive: true });
  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Content-Security-Policy', contentSecurityPolicy());
    if (process.env.NODE_ENV === 'production') {
      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      if (WRITE_METHODS.has(request.method || 'GET')) assertSameOriginWrite(request, requestUrl);
      if (requestUrl.pathname.startsWith('/api/')) await handleApi({ db, request, response, requestUrl, uploadsDirectory });
      else if (requestUrl.pathname.startsWith('/uploads/')) await serveUpload({ request, response, pathname: requestUrl.pathname, uploadsDirectory });
      else await serveWebOrStatic({ request, response, pathname: requestUrl.pathname });
    } catch (error) {
      const status = error.statusCode || 500;
      if (status >= 500) console.error(error);
      if (!response.headersSent) sendJson(response, status, { error: error.publicMessage || '服务器内部错误' });
      else response.end();
    }
  });
  return { server, db, dataDirectory };
}

async function handleApi({ db, request, response, requestUrl, uploadsDirectory }) {
  const { pathname } = requestUrl;
  const method = request.method || 'GET';
  const articlePath = pathname.startsWith('/api/articles')
    ? pathname.replace(/^\/api\/articles/, '/api/knowledge')
    : pathname;

  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(response, 200, {
      status: 'ok',
      service: 'crosspilot',
      version: VERSION,
      dataMode: 'simulated',
      timestamp: new Date().toISOString()
    });
  }

  if (method === 'GET' && pathname === '/api/stores') {
    return sendJson(response, 200, { items: listStores(db).map(deriveStoreHealth) });
  }

  if (method === 'GET' && pathname === '/api/overview') {
    const store = requireStore(db, requestUrl.searchParams.get('storeId'));
    return sendJson(response, 200, buildStoreOverview(db, store.id));
  }

  if (method === 'GET' && pathname === '/api/products') {
    const store = requireStore(db, requestUrl.searchParams.get('storeId'));
    const items = listProducts(db, store.id).map((item) => deriveProduct(item, store));
    return sendJson(response, 200, { store, items });
  }

  const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
  if (method === 'GET' && productMatch) {
    const product = getProduct(db, Number(productMatch[1]));
    if (!product) return sendJson(response, 404, { error: '商品不存在' });
    const store = getStore(db, product.store_id);
    return sendJson(response, 200, deriveProduct(product, store));
  }

  const listingPackageMatch = pathname.match(/^\/api\/products\/(\d+)\/listing-package$/);
  if (method === 'GET' && listingPackageMatch) {
    const product = getProduct(db, Number(listingPackageMatch[1]));
    if (!product) return sendJson(response, 404, { error: '商品不存在' });
    return sendJson(response, 200, buildListingPackage(deriveProduct(product, getStore(db, product.store_id))));
  }

  if (method === 'GET' && pathname === '/api/ads') {
    const store = requireStore(db, requestUrl.searchParams.get('storeId'));
    const items = listAdTerms(db, store.id).map((item) => deriveAdTerm(item, store));
    return sendJson(response, 200, {
      store,
      items,
      summary: {
        totalSpend: round(items.reduce((sum, item) => sum + item.spend, 0)),
        totalSales: round(items.reduce((sum, item) => sum + item.ad_sales, 0)),
        acos: percent(items.reduce((sum, item) => sum + item.spend, 0), items.reduce((sum, item) => sum + item.ad_sales, 0)),
        negativeCandidates: items.filter((item) => item.recommendation === 'negative_exact').length,
        reductionCandidates: items.filter((item) => ['reduce', 'pause'].includes(item.recommendation)).length,
        scaleCandidates: items.filter((item) => item.recommendation === 'scale').length
      }
    });
  }

  if (method === 'GET' && pathname === '/api/inventory') {
    const store = requireStore(db, requestUrl.searchParams.get('storeId'));
    const items = listInventory(db, store.id).map((item) => deriveInventory(item, store));
    return sendJson(response, 200, {
      store,
      items,
      summary: {
        stockout: items.filter((item) => item.risk === 'stockout').length,
        overstock: items.filter((item) => item.risk === 'overstock').length,
        healthy: items.filter((item) => item.risk === 'healthy').length,
        reorderUnits: items.reduce((sum, item) => sum + item.reorder_units, 0)
      }
    });
  }

  if (method === 'GET' && pathname === '/api/after-sales') {
    const store = requireStore(db, requestUrl.searchParams.get('storeId'));
    const items = listAfterSales(db, store.id).map(deriveAfterSale);
    return sendJson(response, 200, {
      store: deriveStoreHealth(store),
      items,
      summary: {
        open: items.filter((item) => !['resolved', 'closed'].includes(item.status)).length,
        overdue: items.filter((item) => item.sla === 'overdue').length,
        critical: items.filter((item) => item.priority === 'critical').length,
        returns: items.filter((item) => item.type.includes('退货')).length
      }
    });
  }

  if (method === 'GET' && pathname === '/api/actions') {
    const store = requireStore(db, requestUrl.searchParams.get('storeId'));
    return sendJson(response, 200, { items: listActions(db, store.id, requestUrl.searchParams.get('status') || 'all') });
  }

  if (method === 'POST' && pathname === '/api/actions') {
    const body = await readJsonBody(request);
    const store = requireStore(db, body.storeId);
    const item = createAction(db, store.id, {
      productId: optionalPositiveInteger(body.productId),
      sourceType: optionalText(body.sourceType, 40) || 'manual',
      sourceId: optionalPositiveInteger(body.sourceId),
      category: requireText(body.category || '运营', '模块', 40),
      title: requireText(body.title, '动作标题', 160),
      description: optionalText(body.description, 2000),
      priority: enumValue(body.priority, ACTION_PRIORITIES, 'medium'),
      recommendation: optionalText(body.recommendation, 60) || 'manual',
      status: enumValue(body.status, ACTION_STATUSES, 'open'),
      owner: optionalText(body.owner, 50),
      dueDate: optionalDate(body.dueDate)
    });
    return sendJson(response, 201, item);
  }

  const actionMatch = pathname.match(/^\/api\/actions\/(\d+)$/);
  if (actionMatch && method === 'GET') {
    const item = getAction(db, Number(actionMatch[1]));
    return item ? sendJson(response, 200, item) : sendJson(response, 404, { error: '运营动作不存在' });
  }
  if (actionMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const item = updateAction(db, Number(actionMatch[1]), {
      ...(body.status !== undefined ? { status: enumValue(body.status, ACTION_STATUSES) } : {}),
      ...(body.priority !== undefined ? { priority: enumValue(body.priority, ACTION_PRIORITIES) } : {}),
      ...(body.owner !== undefined ? { owner: optionalText(body.owner, 50) } : {}),
      ...(body.dueDate !== undefined ? { dueDate: optionalDate(body.dueDate) } : {}),
      ...(body.evidence !== undefined ? { evidence: optionalText(body.evidence, 2000) } : {}),
      ...(body.result !== undefined ? { result: optionalText(body.result, 2000) } : {}),
      ...(body.description !== undefined ? { description: optionalText(body.description, 2000) } : {}),
      ...(body.eventTitle !== undefined ? { eventTitle: optionalText(body.eventTitle, 100) } : {}),
      ...(body.eventDetail !== undefined ? { eventDetail: optionalText(body.eventDetail, 2000) } : {})
    });
    return item ? sendJson(response, 200, item) : sendJson(response, 404, { error: '运营动作不存在' });
  }

  if (method === 'POST' && pathname === '/api/actions/refresh') {
    const body = await readJsonBody(request);
    const store = requireStore(db, body.storeId);
    const items = refreshOperationalActions(db, store.id);
    return sendJson(response, 200, { items, refreshedAt: new Date().toISOString() });
  }

  if (method === 'GET' && pathname === '/api/imports') {
    const store = requireStore(db, requestUrl.searchParams.get('storeId'));
    return sendJson(response, 200, { items: listImports(db, store.id) });
  }

  if (method === 'POST' && pathname === '/api/imports/preview') {
    const body = await readJsonBody(request);
    const store = requireStore(db, body.storeId);
    let buffer;
    try {
      buffer = Buffer.from(String(body.contentBase64 || ''), 'base64');
    } catch {
      throw clientError('文件内容解析失败');
    }
    const analysis = await parseImportFile(buffer, requireText(body.filename, '文件名', 180), body.reportType || 'auto');
    const batch = createImportBatch(db, store.id, {
      ...analysis,
      filename: analysis.filename,
      reportType: analysis.reportType,
      totalRows: analysis.totalRows,
      rows: analysis.rows
    });
    return sendJson(response, 201, batch);
  }

  const importMatch = pathname.match(/^\/api\/imports\/(\d+)$/);
  if (importMatch && method === 'GET') {
    const batch = getImport(db, Number(importMatch[1]));
    return batch ? sendJson(response, 200, batch) : sendJson(response, 404, { error: '导入批次不存在' });
  }

  const importMappingMatch = pathname.match(/^\/api\/imports\/(\d+)\/mapping$/);
  if (importMappingMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const batch = getImport(db, Number(importMappingMatch[1]));
    if (!batch) return sendJson(response, 404, { error: '导入批次不存在' });
    const mapping = body.mapping && typeof body.mapping === 'object' ? body.mapping : {};
    const headers = [...new Set(batch.rows.flatMap((row) => Object.keys(row.raw || {})))];
    const rows = batch.rows.map((row) => row.raw || {});
    const result = validateMappedRows(rows, headers, mapping, batch.report_type);
    const updated = replaceImportRows(db, batch.id, result);
    return sendJson(response, 200, updated);
  }

  const importCommitMatch = pathname.match(/^\/api\/imports\/(\d+)\/commit$/);
  if (importCommitMatch && method === 'POST') {
    const batch = commitImportBatch(db, Number(importCommitMatch[1]));
    refreshOperationalActions(db, batch.store_id);
    return sendJson(response, 200, getImport(db, batch.id));
  }

  const importCancelMatch = pathname.match(/^\/api\/imports\/(\d+)\/cancel$/);
  if (importCancelMatch && method === 'POST') {
    const batch = updateImportStatus(db, Number(importCancelMatch[1]), 'cancelled');
    return batch ? sendJson(response, 200, batch) : sendJson(response, 404, { error: '导入批次不存在' });
  }

  if (method === 'POST' && pathname === '/api/uploads') {
    const body = await readJsonBody(request);
    const articleId = optionalPositiveInteger(body.articleId);
    if (articleId && !getKnowledge(db, articleId)) {
      return sendJson(response, 404, { error: '关联文章不存在' });
    }
    const uploaded = await saveUpload(uploadsDirectory, body);
    registerMedia(db, { ...uploaded, articleId });
    return sendJson(response, 201, uploaded);
  }

  if (method === 'GET' && pathname === '/api/media') {
    return sendJson(response, 200, { items: listMedia(db, requestUrl.searchParams.get('limit')) });
  }

  if (method === 'POST' && pathname === '/api/media/cleanup') {
    return sendJson(response, 200, { removed: cleanupOrphanMedia(db, uploadsDirectory) });
  }

  if (method === 'GET' && pathname === '/api/comments') {
    return sendJson(response, 200, {
      items: listAllComments(db, {
        status: requestUrl.searchParams.get('status') || 'all',
        limit: requestUrl.searchParams.get('limit') || 100
      })
    });
  }

  if (method === 'GET' && pathname === '/api/content') {
    const type = optionalText(requestUrl.searchParams.get('type'), 30);
    if (type && !CONTENT_ENTRY_TYPES.includes(type)) throw clientError('内容类型无效');
    return sendJson(response, 200, {
      items: listContentEntries(db, {
        type,
        status: requestUrl.searchParams.get('status') || 'published',
        query: requestUrl.searchParams.get('q') || '',
        limit: requestUrl.searchParams.get('limit') || 50
      })
    });
  }

  if (method === 'POST' && pathname === '/api/content') {
    const body = await readJsonBody(request);
    return sendJson(response, 201, createContentEntry(db, normalizeContentInput(body, true)));
  }

  const contentMatch = pathname.match(/^\/api\/content\/([^/]+)\/([^/]+)$/);
  if (contentMatch) {
    const type = decodeURIComponent(contentMatch[1]);
    const slugOrId = decodeURIComponent(contentMatch[2]);
    if (!CONTENT_ENTRY_TYPES.includes(type)) throw clientError('内容类型无效', 404);
    if (method === 'GET') {
      const item = getContentEntry(db, type, slugOrId);
      return item
        ? sendJson(response, 200, { ...item, html: renderMarkdown(item.content_md) })
        : sendJson(response, 404, { error: '内容不存在' });
    }
    if (method === 'PATCH') {
      const existing = getContentEntry(db, type, slugOrId);
      if (!existing) return sendJson(response, 404, { error: '内容不存在' });
      const body = await readJsonBody(request);
      return sendJson(response, 200, updateContentEntry(db, type, existing.id, normalizeContentInput(body, false)));
    }
    if (method === 'DELETE') {
      const existing = getContentEntry(db, type, slugOrId);
      if (!existing) return sendJson(response, 404, { error: '内容不存在' });
      deleteContentEntry(db, type, existing.id);
      return sendJson(response, 200, { ok: true, id: existing.id });
    }
  }

  if (method === 'GET' && pathname === '/api/knowledge/field-map') {
    return sendJson(response, 200, {
      products: autoMapHeaders(['SKU', '商品标题', '售价', '采购成本', '销量', '销售额', '广告费', '广告销售', '退货数量', '评分', '评论数'], 'products'),
      ads: autoMapHeaders(['SKU', '广告活动', '广告组', '搜索词', '匹配类型', '点击量', '曝光量', '花费', '广告销售', '广告订单'], 'ads'),
      inventory: autoMapHeaders(['SKU', '快照日期', '可售库存', '在途库存', '预留库存', '残次品', '日均销量'], 'inventory'),
      after_sales: autoMapHeaders(['SKU', '售后编号', '类型', '主题', '原因', '详情', '状态', '优先级'], 'after_sales')
    });
  }

  if (method === 'GET' && articlePath === '/api/knowledge/stats') {
    return sendJson(response, 200, getKnowledgeStats(db));
  }

  if (method === 'GET' && articlePath === '/api/knowledge/archive') {
    return sendJson(response, 200, { items: listArchive(db) });
  }

  if (method === 'GET' && articlePath === '/api/knowledge/categories') {
    return sendJson(response, 200, { items: getKnowledgeStats(db).categories });
  }

  if (method === 'GET' && articlePath === '/api/knowledge/tags') {
    return sendJson(response, 200, { items: getKnowledgeStats(db).tags });
  }

  if (method === 'GET' && articlePath === '/api/knowledge/series') {
    return sendJson(response, 200, { items: getKnowledgeStats(db).series });
  }

  if (method === 'GET' && articlePath === '/api/knowledge') {
    const status = String(requestUrl.searchParams.get('status') || 'published');
    const options = {
      query: String(requestUrl.searchParams.get('q') || '').trim(),
      category: String(requestUrl.searchParams.get('category') || '').trim(),
      tag: String(requestUrl.searchParams.get('tag') || '').trim(),
      series: String(requestUrl.searchParams.get('series') || '').trim(),
      month: String(requestUrl.searchParams.get('month') || '').trim(),
      status: status === 'all' || status === 'draft' ? status : 'published',
      limit: Number(requestUrl.searchParams.get('limit') || 50),
      offset: Number(requestUrl.searchParams.get('offset') || 0)
    };
    return sendJson(response, 200, { items: listKnowledge(db, options), query: options.query, stats: getKnowledgeStats(db) });
  }

  if (method === 'POST' && articlePath === '/api/knowledge/preview') {
    const body = await readJsonBody(request);
    return sendJson(response, 200, { html: renderMarkdown(optionalText(body.markdown, 60000)) });
  }

  const commentsMatch = articlePath.match(/^\/api\/knowledge\/(\d+)\/comments$/);
  if (commentsMatch) {
    const article = getKnowledge(db, Number(commentsMatch[1]));
    if (!article) return sendJson(response, 404, { error: '文章不存在' });
    if (method === 'GET') {
      return sendJson(response, 200, { items: listArticleComments(db, article.id, { status: 'approved' }) });
    }
    if (method === 'POST') {
      const body = await readJsonBody(request);
      const comment = createArticleComment(db, article.id, {
        parentId: optionalPositiveInteger(body.parentId),
        nickname: requireText(body.nickname || '匿名访客', '昵称', 40),
        content: requireText(body.content, '留言内容', 2000),
        status: 'pending'
      });
      return sendJson(response, 201, comment);
    }
  }

  const commentMatch = pathname.match(/^\/api\/comments\/(\d+)$/);
  if (commentMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const item = updateArticleCommentStatus(
      db,
      Number(commentMatch[1]),
      enumValue(body.status, ['pending', 'approved', 'rejected'])
    );
    return item ? sendJson(response, 200, item) : sendJson(response, 404, { error: '评论不存在' });
  }
  if (commentMatch && method === 'DELETE') {
    return deleteArticleComment(db, Number(commentMatch[1]))
      ? sendJson(response, 200, { ok: true })
      : sendJson(response, 404, { error: '评论不存在' });
  }

  const knowledgeMatch = articlePath.match(/^\/api\/knowledge\/([^/]+)$/);
  if (method === 'GET' && knowledgeMatch) {
    const item = getKnowledge(db, decodeURIComponent(knowledgeMatch[1]));
    if (!item) return sendJson(response, 404, { error: '文章不存在' });
    if (
      !requestUrl.searchParams.has('preview')
      && (item.status !== 'published' || (item.publish_at && new Date(item.publish_at).getTime() > Date.now()))
    ) {
      return sendJson(response, 404, { error: '文章不存在' });
    }
    if (!requestUrl.searchParams.has('preview')) incrementKnowledgeViews(db, item.id);
    const approvedComments = listArticleComments(db, item.id, { status: 'approved' });
    const commentCount = countComments(approvedComments);
    return sendJson(response, 200, {
      ...item,
      html: renderMarkdown(item.content_md),
      comment_count: commentCount,
      relationships: getArticleRelationships(db, item.id)
    });
  }

  if (method === 'POST' && articlePath === '/api/knowledge') {
    const body = await readJsonBody(request);
    const contentMd = optionalText(body.contentMd || body.content_markdown, 60000);
    const legacySolution = optionalText(body.solution, 60000);
    if (!contentMd && !legacySolution) throw clientError('文章正文不能为空');
    return sendJson(response, 201, createKnowledge(db, {
      title: requireText(body.title, '标题', 160),
      slug: optionalText(body.slug, 80),
      category: optionalText(body.category, 50) || '运营复盘',
      symptom: optionalText(body.symptom, 4000),
      solution: legacySolution,
      contentMd,
      excerpt: optionalText(body.excerpt, 320),
      coverImage: validImagePath(body.coverImage),
      tags: optionalText(body.tags, 300),
      status: enumValue(body.status, ['draft', 'published'], 'published'),
      featured: Boolean(body.featured),
      publishAt: optionalText(body.publishAt, 40)
    }));
  }

  if (knowledgeMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const existing = getKnowledge(db, decodeURIComponent(knowledgeMatch[1]));
    if (!existing) return sendJson(response, 404, { error: '文章不存在' });
    const contentMd = body.contentMd === undefined && body.content_markdown === undefined
      ? undefined
      : optionalText(body.contentMd || body.content_markdown, 60000);
    if (contentMd !== undefined && !contentMd) throw clientError('文章正文不能为空');
    const item = updateKnowledge(db, existing.id, {
      ...(body.title !== undefined ? { title: requireText(body.title, '标题', 160) } : {}),
      ...(body.slug !== undefined ? { slug: optionalText(body.slug, 80) } : {}),
      ...(body.category !== undefined ? { category: optionalText(body.category, 50) || '运营复盘' } : {}),
      ...(body.excerpt !== undefined ? { excerpt: optionalText(body.excerpt, 320) } : {}),
      ...(contentMd !== undefined ? { contentMd } : {}),
      ...(body.coverImage !== undefined ? { coverImage: validImagePath(body.coverImage) } : {}),
      ...(body.tags !== undefined ? { tags: optionalText(body.tags, 300) } : {}),
      ...(body.status !== undefined ? { status: enumValue(body.status, ['draft', 'published']) } : {}),
      ...(body.featured !== undefined ? { featured: Boolean(body.featured) } : {}),
      ...(body.publishAt !== undefined ? { publishAt: optionalText(body.publishAt, 40) } : {})
    });
    return sendJson(response, 200, item);
  }

  if (knowledgeMatch && method === 'DELETE') {
    const existing = getKnowledge(db, decodeURIComponent(knowledgeMatch[1]));
    if (!existing) return sendJson(response, 404, { error: '文章不存在' });
    deleteKnowledge(db, existing.id);
    return sendJson(response, 200, { ok: true, id: existing.id });
  }

  const reportMatch = pathname.match(/^\/api\/reports\/operations\/(\d+)$/);
  if (method === 'GET' && reportMatch) {
    const format = String(requestUrl.searchParams.get('format') || 'html').toLowerCase();
    const report = await generateOperationsReport(db, Number(reportMatch[1]), format);
    response.statusCode = 200;
    response.setHeader('Content-Type', report.contentType);
    response.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    response.setHeader('Cache-Control', 'no-store');
    return response.end(report.content);
  }

  return sendJson(response, 404, { error: '接口不存在' });
}

export function buildStoreOverview(db, storeId) {
  const store = deriveStoreHealth(requireStore(db, storeId));
  const products = listProducts(db, store.id).map((item) => deriveProduct(item, store));
  const ads = listAdTerms(db, store.id).map((item) => deriveAdTerm(item, store));
  const inventory = listInventory(db, store.id).map((item) => deriveInventory(item, store));
  const afterSales = listAfterSales(db, store.id).map(deriveAfterSale);
  const actions = listActions(db, store.id);
  const daily = listDailyMetrics(db, store.id, 30);
  const overview = buildOverview(store, products, ads, inventory, afterSales, actions, daily);
  return {
    ...overview,
    health: store.health_metrics,
    actionBreakdown: {
      critical: actions.filter((item) => item.priority === 'critical' && !isActionClosed(item.status)).length,
      high: actions.filter((item) => item.priority === 'high' && !isActionClosed(item.status)).length,
      done: actions.filter((item) => ['done', 'closed'].includes(item.status)).length
    },
    actionsPreview: actions.filter((item) => !isActionClosed(item.status)).slice(0, 8),
    activities: listActivities(db, store.id, 12),
    dataMode: store.data_mode || 'simulated'
  };
}

function buildListingPackage(product) {
  const dimensions = [
    { key: 'titleScore', label: '标题', weight: 20, score: product.titleScore, suggestion: '前置核心词、材质、尺寸、容量和核心场景，避免堆砌同义关键词。' },
    { key: 'bulletScore', label: '五点描述', weight: 20, score: product.bulletScore, suggestion: '每条只解决一个决策问题：尺寸适配、安装方式、承重、清洁、售后边界。' },
    { key: 'imageScore', label: '图片', weight: 20, score: product.imageScore, suggestion: '补齐 1:1 白底图、家庭场景图、尺寸标注图、容量对比图、安装步骤图和细节图。' },
    { key: 'attributeScore', label: '属性', weight: 15, score: product.attributeScore, suggestion: '补齐材质、颜色、尺寸、承重、适用空间、包装数量和安装方式。' },
    { key: 'keywordScore', label: '关键词覆盖', weight: 15, score: product.keywordScore, suggestion: '覆盖核心词、长尾词、场景词和德语本地化拼写，不重复堆叠。' },
    { key: 'complianceScore', label: '合规性', weight: 10, score: product.complianceScore, suggestion: '核对欧盟责任信息、材料标识、包装警示和图片文字合规。' }
  ];
  const weakest = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 3);
  return {
    product,
    score: product.listing_score,
    dimensions,
    titleSuggestion: `${product.title} | ${product.category} | ${product.units_30d > 200 ? 'Best Seller Style' : 'Space Saving Solution'}`,
    bullets: [
      `适配真实空间：围绕 ${product.category} 的核心痛点明确尺寸和适用场景。`,
      '安装与维护：用一步图示说明安装方式，并说明可清洁、可折叠或免打孔等特性。',
      '容量与承重：给出具体容量、承重和适配物品范围，减少尺寸误购。',
      '材质与耐用性：列出材质、工艺、边角处理和长期使用注意事项。',
      '包装与保障：说明包装数量、欧洲站售后边界和缺件处理方式。'
    ],
    imageRequirements: [
      '主图：纯白背景，商品占画面 85%，无促销文字。',
      '尺寸图：厘米与英寸双单位，标注最大展开尺寸。',
      '场景图：展示 3 种典型家庭使用场景，不出现夸张效果。',
      '对比图：与同类收纳容量做同尺度对比。',
      '步骤图：3 步以内完成安装或折叠。',
      '细节图：材质纹理、承重结构、边角处理。'
    ],
    keywordClusters: [
      { cluster: '核心词', terms: [product.category, `best ${product.category}`, `${product.category} storage`] },
      { cluster: '场景词', terms: ['small apartment storage', 'kitchen organisation', 'bedroom storage'] },
      { cluster: '长尾词', terms: ['space saving organiser', 'no drill storage solution', 'foldable home storage'] },
      { cluster: '合规词', terms: ['EU responsible person', 'material information', 'package quantity'] }
    ],
    priorityActions: weakest.map((item) => `${item.label}：${item.suggestion}`),
    generatedAt: new Date().toISOString(),
    dataMode: 'simulated'
  };
}

async function serveUpload({ request, response, pathname, uploadsDirectory }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: '方法不支持' });
  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname.replace(/^\/uploads\//, ''));
  } catch {
    return sendJson(response, 400, { error: '图片地址无效' });
  }
  const filePath = resolveWithin(uploadsDirectory, relativePath);
  if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return sendJson(response, 404, { error: '图片不存在' });
  }
  const content = await readFile(filePath);
  response.statusCode = 200;
  response.setHeader('Content-Type', CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream');
  response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  if (request.method === 'HEAD') return response.end();
  return response.end(content);
}

async function serveWebOrStatic({ request, response, pathname }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: '方法不支持' });
  const decodedPath = decodeURIComponent(pathname);
  const webRelative = mapWebRoute(decodedPath);
  if (webRelative && existsSync(WEB_DIST_DIR)) {
    const webFile = resolveWithin(WEB_DIST_DIR, webRelative);
    if (webFile && existsSync(webFile) && statSync(webFile).isFile()) {
      return serveFile({ request, response, filePath: webFile, cacheControl: 'public, max-age=300' });
    }
  }

  const legacyRelative = isLegacyRoute(decodedPath)
    ? 'index.html'
    : decodedPath === '/'
      ? 'index.html'
      : decodedPath.replace(/^\/+/, '');
  const legacyFile = resolveWithin(PUBLIC_DIR, legacyRelative);
  if (!legacyFile || !existsSync(legacyFile) || statSync(legacyFile).isDirectory()) {
    return sendJson(response, 404, { error: '页面不存在' });
  }
  return serveFile({
    request,
    response,
    filePath: legacyFile,
    cacheControl: 'no-store, no-cache, must-revalidate, proxy-revalidate'
  });
}

async function serveFile({ request, response, filePath, cacheControl }) {
  const content = await readFile(filePath);
  response.statusCode = 200;
  response.setHeader('Content-Type', CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream');
  response.setHeader('Cache-Control', cacheControl);
  if (cacheControl.startsWith('no-store')) {
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');
  }
  if (request.method === 'HEAD') return response.end();
  return response.end(content);
}

function mapWebRoute(pathname) {
  const value = pathname.replace(/\/+$/, '') || '/';
  const staticRoutes = {
    '/index.html': 'index.html',
    '/dynamic': 'dynamic/index.html',
    '/projects': 'projects/index.html',
    '/gallery': 'gallery/index.html',
    '/resources': 'resources/index.html',
    '/guestbook': 'guestbook/index.html',
    '/about': 'about/index.html',
  };
  if (staticRoutes[value]) return staticRoutes[value];
  const detailMatch = value.match(/^\/(projects|gallery|resources)\/[^/]+\/?$/);
  if (detailMatch) return `${detailMatch[1]}/detail/index.html`;
  if (value.startsWith('/_astro/')) return value.slice(1);
  if (value.startsWith('/assets/') || value === '/favicon.svg') return value.slice(1);
  return null;
}

function isLegacyRoute(pathname) {
  const value = pathname.replace(/\/+$/, '') || '/';
  return new Set([
    '/',
    '/articles',
    '/archive',
    '/categories',
    '/tags',
    '/series',
    '/search',
    '/overview',
    '/studio',
    '/imports',
    '/listings',
    '/ads',
    '/inventory',
    '/aftersales',
    '/reviews'
  ]).has(value) || /^\/articles\/[^/]+$/.test(value);
}

function resolveWithin(baseDirectory, relativePath) {
  const filePath = resolve(baseDirectory, relativePath);
  const pathFromBase = relative(baseDirectory, filePath);
  if (!pathFromBase || (!pathFromBase.startsWith('..') && !isAbsolute(pathFromBase))) return filePath;
  return null;
}

async function saveUpload(uploadsDirectory, body = {}) {
  const dataUrl = String(body.dataUrl || body.contentBase64 || '');
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif|avif));base64,(.+)$/i);
  const mimeType = String(body.mimeType || match?.[1] || '').toLowerCase();
  const base64 = match?.[2] || dataUrl.replace(/^data:[^;]+;base64,/, '');
  const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
  const extension = extensions[mimeType];
  if (!extension || !base64 || !/^[a-z0-9+/=\r\n]+$/i.test(base64)) {
    throw clientError('仅支持 PNG、JPG、WebP、GIF 或 AVIF 图片');
  }
  let buffer;
  try {
    buffer = Buffer.from(base64, 'base64');
  } catch {
    throw clientError('图片内容解析失败');
  }
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw clientError('图片不能超过 5 MB');
  const signatures = {
    'image/png': (value) => value.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    'image/jpeg': (value) => value[0] === 0xff && value[1] === 0xd8 && value[2] === 0xff,
    'image/gif': (value) => ['GIF87a', 'GIF89a'].includes(value.subarray(0, 6).toString('ascii')),
    'image/webp': (value) => value.subarray(0, 4).toString('ascii') === 'RIFF' && value.subarray(8, 12).toString('ascii') === 'WEBP',
    'image/avif': (value) => {
      if (value.length < 16 || value.subarray(4, 8).toString('ascii') !== 'ftyp') return false;
      const brands = value.subarray(8, Math.min(value.length, 64)).toString('ascii');
      return brands.includes('avif') || brands.includes('avis');
    }
  };
  if (!signatures[mimeType](buffer)) throw clientError('图片格式与文件内容不匹配');
  await mkdir(uploadsDirectory, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  await writeFile(resolve(uploadsDirectory, filename), buffer, { flag: 'wx' });
  return { url: `/uploads/${filename}`, filename, size: buffer.length, mimeType };
}

function validImagePath(value) {
  const path = optionalText(value, 600);
  if (!path) return '';
  if (/^(\/uploads\/|\/assets\/)/.test(path) || /^https:\/\//i.test(path)) return path;
  throw clientError('封面图片地址无效');
}

function normalizeContentInput(body, requireType) {
  const result = {};
  if (requireType || body.type !== undefined) {
    result.type = enumValue(body.type, CONTENT_ENTRY_TYPES);
  }
  if (requireType || body.title !== undefined) result.title = requireText(body.title, '标题', 160);
  if (requireType || body.slug !== undefined) result.slug = optionalText(body.slug, 80);
  if (requireType || body.summary !== undefined) result.summary = optionalText(body.summary, 500);
  if (requireType || body.contentMd !== undefined) result.contentMd = optionalText(body.contentMd, 60000);
  if (requireType || body.coverImage !== undefined) result.coverImage = validImagePath(body.coverImage);
  if (requireType || body.metadata !== undefined) {
    if (body.metadata !== undefined && (body.metadata === null || typeof body.metadata !== 'object' || Array.isArray(body.metadata))) {
      throw clientError('扩展数据必须是 JSON 对象');
    }
    result.metadata = body.metadata || {};
  }
  if (requireType || body.status !== undefined) {
    result.status = enumValue(body.status, ['draft', 'published'], requireType ? 'published' : undefined);
  }
  if (requireType || body.featured !== undefined) result.featured = Boolean(body.featured);
  if (requireType || body.publishedAt !== undefined) result.publishedAt = optionalText(body.publishedAt, 40);
  return result;
}

async function readJsonBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw clientError('请求内容过大，最大支持 16 MB');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw clientError('请求 JSON 格式不正确');
  }
}

function requireStore(db, value) {
  const store = getStore(db, Number(value));
  if (!store) throw clientError('店铺不存在，请选择有效店铺', 404);
  return store;
}

function requireText(value, label, maxLength = 500) {
  const text = String(value ?? '').trim();
  if (!text) throw clientError(`${label}不能为空`);
  if (text.length > maxLength) throw clientError(`${label}不能超过 ${maxLength} 个字符`);
  return text;
}

function optionalText(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  const text = String(value).trim();
  if (text.length > maxLength) throw clientError(`字段不能超过 ${maxLength} 个字符`);
  return text;
}

function optionalDate(value) {
  if (value === undefined || value === null || value === '') return '';
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(new Date(`${text}T00:00:00Z`).getTime())) throw clientError('日期格式应为 YYYY-MM-DD');
  return text;
}

function optionalPositiveInteger(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw clientError('ID 必须是正整数');
  return number;
}

function enumValue(value, allowed, fallback) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw clientError('缺少有效选项');
  }
  const normalized = String(value);
  if (!allowed.includes(normalized)) throw clientError(`选项必须是 ${allowed.join('、')}`);
  return normalized;
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function clientError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function assertSameOriginWrite(request, requestUrl) {
  const origin = request.headers.origin;
  if (!origin) return;
  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== requestUrl.host) throw new Error('origin mismatch');
  } catch {
    throw clientError('拒绝跨站写操作', 403);
  }
}

function contentSecurityPolicy() {
  const mediaOrigins = String(process.env.CSP_MEDIA_ORIGINS || 'https://bed.twoleaf.cn')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .join(' ');
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    `media-src 'self' blob: ${mediaOrigins}`,
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "worker-src 'self' blob:"
  ];
  if (process.env.NODE_ENV === 'production') directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

function countComments(items) {
  return items.reduce((sum, item) => sum + 1 + countComments(item.replies || []), 0);
}

function isActionClosed(status) {
  return ['done', 'closed', 'ignored'].includes(status);
}

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function percent(numerator, denominator) {
  if (!Number(denominator)) return 0;
  return round((Number(numerator) / Number(denominator)) * 100);
}
