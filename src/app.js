import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  commitImportBatch,
  createAction,
  createDatabase,
  createImportBatch,
  createKnowledge,
  getAction,
  getImport,
  getKnowledge,
  getProduct,
  getStore,
  listActions,
  listActivities,
  listAdTerms,
  listAfterSales,
  listDailyMetrics,
  listImports,
  listInventory,
  listKnowledge,
  listProducts,
  listStores,
  replaceImportRows,
  refreshOperationalActions,
  updateAction,
  updateImportStatus
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
import { autoMapHeaders, parseImportFile, validateMappedRows } from './imports.js';
import { generateOperationsReport } from './reports.js';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(MODULE_DIR, '..', 'public');
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
  '.svg': 'image/svg+xml; charset=utf-8'
};
const ACTION_STATUSES = ['open', 'in_progress', 'deferred', 'done', 'closed', 'ignored'];
const ACTION_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export function createApp({ dbPath } = {}) {
  const db = createDatabase(dbPath);
  const dataDirectory = dirname(dbPath || resolve('data/crosspilot.db'));
  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      if (requestUrl.pathname.startsWith('/api/')) await handleApi({ db, request, response, requestUrl });
      else await serveStatic({ request, response, pathname: requestUrl.pathname });
    } catch (error) {
      const status = error.statusCode || 500;
      if (status >= 500) console.error(error);
      if (!response.headersSent) sendJson(response, status, { error: error.publicMessage || '服务器内部错误' });
      else response.end();
    }
  });
  return { server, db, dataDirectory };
}

async function handleApi({ db, request, response, requestUrl }) {
  const { pathname } = requestUrl;
  const method = request.method || 'GET';

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

  if (method === 'GET' && pathname === '/api/knowledge') {
    const query = String(requestUrl.searchParams.get('q') || '').trim();
    return sendJson(response, 200, { items: listKnowledge(db, query), query });
  }

  if (method === 'GET' && pathname === '/api/knowledge/field-map') {
    return sendJson(response, 200, {
      products: autoMapHeaders(['SKU', '商品标题', '售价', '采购成本', '销量', '销售额', '广告费', '广告销售', '退货数量', '评分', '评论数'], 'products'),
      ads: autoMapHeaders(['SKU', '广告活动', '广告组', '搜索词', '匹配类型', '点击量', '曝光量', '花费', '广告销售', '广告订单'], 'ads'),
      inventory: autoMapHeaders(['SKU', '快照日期', '可售库存', '在途库存', '预留库存', '残次品', '日均销量'], 'inventory'),
      after_sales: autoMapHeaders(['SKU', '售后编号', '类型', '主题', '原因', '详情', '状态', '优先级'], 'after_sales')
    });
  }

  const knowledgeMatch = pathname.match(/^\/api\/knowledge\/(\d+)$/);
  if (method === 'GET' && knowledgeMatch) {
    const item = getKnowledge(db, Number(knowledgeMatch[1]));
    return item ? sendJson(response, 200, item) : sendJson(response, 404, { error: '知识文章不存在' });
  }

  if (method === 'POST' && pathname === '/api/knowledge') {
    const body = await readJsonBody(request);
    return sendJson(response, 201, createKnowledge(db, {
      title: requireText(body.title, '标题', 160),
      category: optionalText(body.category, 50) || '运营复盘',
      symptom: optionalText(body.symptom, 1200),
      solution: requireText(body.solution, '解决方案', 8000),
      tags: optionalText(body.tags, 300)
    }));
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

async function serveStatic({ request, response, pathname }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: '方法不支持' });
  const relativePath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const filePath = normalize(resolve(PUBLIC_DIR, relativePath));
  if (!filePath.startsWith(PUBLIC_DIR) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return sendJson(response, 404, { error: '页面不存在' });
  }
  const content = await readFile(filePath);
  response.statusCode = 200;
  response.setHeader('Content-Type', CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream');
  response.setHeader('Cache-Control', extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600');
  if (request.method === 'HEAD') return response.end();
  return response.end(content);
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
