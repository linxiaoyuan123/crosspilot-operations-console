import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import ExcelJS from 'exceljs';
import { createApp } from '../src/app.js';

let server;
let db;
let baseUrl;
let tempDirectory;

before(async () => {
  tempDirectory = join(tmpdir(), `crosspilot-${randomUUID()}`);
  const app = createApp({ dbPath: join(tempDirectory, 'crosspilot-test.db') });
  server = app.server;
  db = app.db;
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(tempDirectory, { recursive: true, force: true });
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json', ...options.headers }
      : options.headers
  });
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('json')) return { response, body: await response.json() };
  if (contentType.includes('spreadsheet')) return { response, buffer: Buffer.from(await response.arrayBuffer()) };
  return { response, body: await response.text() };
}

async function jsonRequest(path, method, body = {}) {
  return request(path, { method, body: JSON.stringify(body) });
}

function csvBase64(rows) {
  const lines = rows.map((row) => row.map(csvCell).join(','));
  return Buffer.from(`\uFEFF${lines.join('\r\n')}`, 'utf8').toString('base64');
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

test('knowledge articles support Markdown, publishing state and image uploads', async () => {
  const seeded = await request('/api/knowledge/crosspilot-usage-guide?preview=1');
  assert.equal(seeded.response.status, 200);
  assert.equal(seeded.body.status, 'published');
  assert.equal(seeded.body.featured, true);
  assert.match(seeded.body.html, /CrossPilot 运营工具使用指南/);
  assert.match(seeded.body.html, /\/assets\/articles\/crosspilot-home\.png/);

  const preview = await jsonRequest('/api/knowledge/preview', 'POST', {
    markdown: '## 标题\n\n**正文** <script>alert(1)</script>\n\n![图](javascript:alert(1))'
  });
  assert.equal(preview.response.status, 200);
  assert.match(preview.body.html, /<strong>正文<\/strong>/);
  assert.doesNotMatch(preview.body.html, /<script|javascript:/i);

  const created = await jsonRequest('/api/knowledge', 'POST', {
    title: '测试 Markdown 草稿',
    slug: 'test-markdown-draft',
    category: '测试分类',
    contentMd: '## 第一阶段\n\n- 检查数据\n- 执行动作',
    tags: '测试,Markdown',
    status: 'draft'
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.status, 'draft');
  assert.equal(created.body.slug, 'test-markdown-draft');

  const publicList = await request('/api/knowledge');
  assert.equal(publicList.response.status, 200);
  assert.equal(publicList.body.items.some((item) => item.id === created.body.id), false);
  const draftList = await request('/api/knowledge?status=draft&q=Markdown');
  assert.equal(draftList.body.items.some((item) => item.id === created.body.id), true);

  const updated = await jsonRequest(`/api/knowledge/${created.body.id}`, 'PATCH', {
    title: '测试 Markdown 已发布',
    status: 'published',
    featured: true,
    contentMd: '## 已发布\n\n正文保留 **Markdown**。'
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.status, 'published');
  assert.equal(updated.body.featured, true);
  const detail = await request(`/api/knowledge/${updated.body.slug}?preview=1`);
  assert.match(detail.body.html, /<strong>Markdown<\/strong>/);

  const invalidUpload = await jsonRequest('/api/uploads', 'POST', {
    mimeType: 'image/png',
    contentBase64: Buffer.from('not an image').toString('base64')
  });
  assert.equal(invalidUpload.response.status, 400);
  const upload = await jsonRequest('/api/uploads', 'POST', {
    mimeType: 'image/png',
    contentBase64: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64')
  });
  assert.equal(upload.response.status, 201);
  assert.match(upload.body.url, /^\/uploads\//);
  const uploadResponse = await request(upload.body.url);
  assert.equal(uploadResponse.response.status, 200);

  db.prepare("UPDATE media_library SET created_at = datetime('now', '-2 days') WHERE filename = ?").run(upload.body.filename);
  const cleanup = await jsonRequest('/api/media/cleanup', 'POST');
  assert.equal(cleanup.response.status, 200);
  assert.equal(cleanup.body.removed, 1);
  assert.equal((await request(upload.body.url)).response.status, 404);

  const articleList = await request('/api/articles?status=published&limit=10');
  const otherArticle = articleList.body.items.find((item) => item.slug !== 'crosspilot-usage-guide');
  const otherComment = await jsonRequest(`/api/articles/${otherArticle.id}/comments`, 'POST', {
    nickname: '测试访客',
    content: '用于验证回复归属。'
  });
  assert.equal(otherComment.response.status, 201);
  const mismatchedReply = await jsonRequest(`/api/articles/${seeded.body.id}/comments`, 'POST', {
    parentId: otherComment.body.id,
    nickname: '测试访客',
    content: '不应写入。'
  });
  assert.equal(mismatchedReply.response.status, 400);

  const forgedApproval = await jsonRequest(`/api/articles/${seeded.body.id}/comments`, 'POST', {
    nickname: '测试访客',
    content: '这条留言不能由客户端直接审核通过。',
    admin: true
  });
  assert.equal(forgedApproval.response.status, 201);
  assert.equal(forgedApproval.body.status, 'pending');
  const publicPending = await request(`/api/articles/${seeded.body.id}/comments?status=pending`);
  assert.equal(publicPending.response.status, 200);
  assert.equal(publicPending.body.items.some((item) => item.id === forgedApproval.body.id), false);

  const invalidArticleUpload = await jsonRequest('/api/uploads', 'POST', {
    articleId: 999999,
    mimeType: 'image/png',
    contentBase64: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64')
  });
  assert.equal(invalidArticleUpload.response.status, 404);

  const removed = await request(`/api/knowledge/${created.body.id}`, { method: 'DELETE' });
  assert.equal(removed.response.status, 200);
  assert.equal(removed.body.ok, true);
});

test('structured content modules support create, edit, publish and delete', async () => {
  const created = await jsonRequest('/api/content', 'POST', {
    type: 'dynamic',
    slug: 'api-structured-test',
    title: '结构化内容测试',
    summary: '验证内容模块完整闭环。',
    contentMd: '## 测试正文\n\n内容模块支持 Markdown。',
    metadata: { location: '测试环境' },
    status: 'published',
    featured: true
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.slug, 'api-structured-test');
  assert.equal(created.body.featured, true);

  const updated = await jsonRequest('/api/content/dynamic/api-structured-test', 'PATCH', {
    slug: 'api-structured-test-updated',
    summary: '已更新的摘要。',
    status: 'draft'
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.slug, 'api-structured-test-updated');
  assert.equal(updated.body.status, 'draft');

  const detail = await request('/api/content/dynamic/api-structured-test-updated');
  assert.equal(detail.response.status, 200);
  assert.match(detail.body.html, /测试正文/);
  assert.equal(detail.body.metadata.location, '测试环境');

  const removed = await request('/api/content/dynamic/api-structured-test-updated', { method: 'DELETE' });
  assert.equal(removed.response.status, 200);
  assert.equal((await request('/api/content/dynamic/api-structured-test-updated')).response.status, 404);
});

test('health and stores expose the CrossPilot Amazon-first model', async () => {
  const health = await request('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.service, 'crosspilot');
  assert.equal(health.body.version, '3.0.0');
  assert.match(health.response.headers.get('content-security-policy') || '', /default-src 'self'/);
  const traversal = await request('/uploads/%2e%2e/crosspilot-test.db');
  assert.notEqual(traversal.response.status, 200);

  const stores = await request('/api/stores');
  assert.equal(stores.response.status, 200);
  assert.equal(stores.body.items.length, 3);
  assert.equal(stores.body.items[0].code, 'EU-HOME-01');
  assert.equal(stores.body.items[0].platform, 'Amazon');
  assert.equal(stores.body.items[0].data_mode, 'simulated');
  assert.deepEqual(stores.body.items.map((store) => store.platform), ['Amazon', 'TikTok Shop', 'Shopee']);
});

test('seed products, profit calculations and listing scores are internally consistent', async () => {
  const response = await request('/api/products?storeId=1');
  assert.equal(response.response.status, 200);
  assert.equal(response.body.items.length, 8);
  const product = response.body.items.find((item) => item.sku === 'AH-BAM-002');
  assert.ok(product);
  assert.equal(product.net_sales_30d, 11735.48);
  assert.equal(product.net_profit_30d, 3571.56);
  assert.equal(product.acos_percent, 22.38);
  assert.equal(product.tacos_percent, 12.48);
  assert.equal(product.roas, 4.47);
  assert.ok(product.listing_score >= 80 && product.listing_score <= 100);
  assert.ok(product.suggested_price > product.break_even_price);
});

test('overview links KPIs to anomalies and the unified action queue', async () => {
  const overview = await request('/api/overview?storeId=1');
  assert.equal(overview.response.status, 200);
  assert.equal(overview.body.store.code, 'EU-HOME-01');
  assert.equal(overview.body.kpis.inventoryRiskCount, 3);
  assert.ok(overview.body.kpis.openActions > 5);
  assert.ok(overview.body.trend.length >= 14);
  assert.ok(overview.body.actionsPreview.every((item) => !['done', 'closed'].includes(item.status)));
  assert.equal(overview.body.dataMode, 'simulated');
});

test('ad and inventory rules produce explainable recommendations', async () => {
  const ads = await request('/api/ads?storeId=1');
  assert.equal(ads.response.status, 200);
  assert.equal(ads.body.items.find((item) => item.search_term === 'under bed storage').recommendation, 'negative_exact');
  assert.equal(ads.body.items.find((item) => item.search_term === 'laundry hamper large').recommendation, 'reduce');
  assert.equal(ads.body.items.find((item) => item.search_term === 'bamboo drawer organizer').recommendation, 'scale');

  const inventory = await request('/api/inventory?storeId=1');
  assert.equal(inventory.response.status, 200);
  assert.equal(inventory.body.items.find((item) => item.sku === 'AH-VAC-001').risk, 'stockout');
  assert.equal(inventory.body.items.find((item) => item.sku === 'AH-SHOE-003').risk, 'overstock');
  assert.ok(inventory.body.items.find((item) => item.sku === 'AH-VAC-001').reorder_units > 0);
});

test('after-sales and account health thresholds are exposed with SLA state', async () => {
  const response = await request('/api/after-sales?storeId=1');
  assert.equal(response.response.status, 200);
  assert.ok(response.body.items.length >= 7);
  assert.ok(response.body.items.some((item) => item.sla === 'overdue'));
  assert.equal(response.body.store.health_status, 'warning');
  assert.ok(response.body.store.health_metrics.some((item) => item.key === 'late' && item.status === 'warning'));
});

test('action lifecycle writes timeline events and report evidence', async () => {
  const created = await jsonRequest('/api/actions', 'POST', {
    storeId: 1,
    category: '广告',
    title: '测试动作：暂停无转化搜索词',
    description: '测试证据回写',
    priority: 'high',
    recommendation: 'manual_test',
    dueDate: '2026-09-30'
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.status, 'open');
  assert.equal(created.body.events.length, 1);

  const updated = await jsonRequest(`/api/actions/${created.body.id}`, 'PATCH', {
    status: 'done',
    owner: '测试运营',
    result: '已暂停并观察 7 天',
    evidence: '广告后台截图 AD-001'
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.status, 'done');
  assert.equal(updated.body.owner, '测试运营');
  assert.match(updated.body.evidence, /AD-001/);
  assert.ok(updated.body.events.some((item) => item.title === '完成动作'));

  const refreshed = await jsonRequest('/api/actions/refresh', 'POST', { storeId: 1 });
  assert.equal(refreshed.response.status, 200);
  assert.ok(refreshed.body.items.some((item) => item.recommendation === 'negative_exact'));
});

test('CSV import preview maps multilingual headers and skips PII', async () => {
  const csv = csvBase64([
    ['SKU', '商品标题', '售价', '采购成本', '销量', '销售额', '广告费', '广告销售', '退货数量', '评分', '评论数', '买家姓名', '邮箱'],
    ['AH-TEST-009', 'Test Storage Organizer', '19.99', '5.20', '120', '2398.80', '180.20', '980.00', '6', '4.51', '88', 'Alice Buyer', 'alice@example.com'],
    ['AH-TEST-010', '', '29.99', '8.00', '80', '2399.20', '100.00', '700.00', '2', '4.30', '26', 'Bob Buyer', 'bob@example.com']
  ]);
  const preview = await jsonRequest('/api/imports/preview', 'POST', {
    storeId: 1,
    filename: 'amazon-products.csv',
    reportType: 'auto',
    contentBase64: csv
  });
  assert.equal(preview.response.status, 201);
  assert.equal(preview.body.report_type, 'products');
  assert.equal(preview.body.valid_rows, 1);
  assert.equal(preview.body.error_rows, 1);
  assert.ok(preview.body.pii_columns.includes('买家姓名'));
  assert.ok(preview.body.pii_columns.includes('邮箱'));
  assert.equal(preview.body.rows[0].raw['买家姓名'], undefined);
  assert.equal(JSON.stringify(preview.body).includes('alice@example.com'), false);
  assert.equal(preview.body.mapping['商品标题'], 'title');

  const committed = await request(`/api/imports/${preview.body.id}/commit`, { method: 'POST', body: JSON.stringify({}) });
  assert.equal(committed.response.status, 200);
  assert.equal(committed.body.status, 'committed');

  const products = await request('/api/products?storeId=1');
  const imported = products.body.items.find((item) => item.sku === 'AH-TEST-009');
  assert.ok(imported);
  assert.equal(imported.units_30d, 120);
  assert.equal(imported.rating, 4.51);
});

test('XLSX import preview accepts Excel workbooks', async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Search Terms');
  sheet.addRow(['SKU', '广告活动', '搜索词', '点击量', '花费', '广告销售', '广告订单']);
  sheet.addRow(['AH-VAC-001', 'SP - Test', 'vacuum storage test', 19, 55.5, 0, 0]);
  const contentBase64 = Buffer.from(await workbook.xlsx.writeBuffer()).toString('base64');
  const preview = await jsonRequest('/api/imports/preview', 'POST', {
    storeId: 1,
    filename: 'search-terms.xlsx',
    reportType: 'auto',
    contentBase64
  });
  assert.equal(preview.response.status, 201);
  assert.equal(preview.body.report_type, 'ads');
  assert.equal(preview.body.valid_rows, 1);
  assert.equal(preview.body.preview[0].values.search_term, 'vacuum storage test');
});

test('operations reports export HTML, Markdown, CSV and a five-sheet XLSX', async () => {
  const html = await request('/api/reports/operations/1?format=html');
  assert.equal(html.response.status, 200);
  assert.match(html.body, /AuroraHome Europe/);
  assert.match(html.body, /净利润/);
  assert.doesNotMatch(html.body, /password|secret|api.?key/i);

  const markdown = await request('/api/reports/operations/1?format=md');
  assert.equal(markdown.response.status, 200);
  assert.match(markdown.body, /广告搜索词/);
  assert.match(markdown.body, /库存与履约/);

  const csv = await request('/api/reports/operations/1?format=csv');
  assert.equal(csv.response.status, 200);
  assert.match(csv.body, /Summary/);
  assert.match(csv.body, /AH-BAM-002/);

  const xlsx = await request('/api/reports/operations/1?format=xlsx');
  assert.equal(xlsx.response.status, 200);
  const reportBook = new ExcelJS.Workbook();
  await reportBook.xlsx.load(xlsx.buffer);
  assert.deepEqual(reportBook.worksheets.map((sheet) => sheet.name), ['Summary', 'SKU', 'Ads', 'Inventory', 'After-sales']);
});

test('Astro content routes and legacy operations fallback preserve their contracts', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /CrossPilot · 跨境电商运营决策中台/);
  assert.match(html, /运营工作区/);
  assert.match(html, /从经营状态到方法沉淀/);
  assert.match(html, /跨境运营，从数据到动作/);
  assert.match(html, /\/pig\.png/);
  assert.match(html, /astro-island/);
  assert.match(html, /StorePicker/);

  const articlePage = await request('/articles/');
  assert.equal(articlePage.response.status, 200);
  assert.match(articlePage.body, /全部文章/);
  const detailPage = await request('/articles/crosspilot-usage-guide');
  assert.equal(detailPage.response.status, 200);
  assert.match(detailPage.body, /ArticleDetail/);

  const legacyResponse = await fetch(`${baseUrl}/overview`);
  const legacyHtml = await legacyResponse.text();
  assert.equal(legacyResponse.status, 200);
  assert.match(legacyHtml, /data-wallpaper-mode="fullscreen" data-fullscreen-layout="classic"/);
  assert.match(legacyHtml, /Listing与商品/);
  assert.match(legacyHtml, /nav-tools-trigger/);
  assert.match(legacyHtml, /articles-menu/);
  assert.match(legacyHtml, /cp-store-picker-trigger/);
  assert.match(legacyHtml, /page-frame/);
  assert.match(legacyHtml, /cp-global-search-input/);
  assert.match(legacyHtml, /cp-theme-panel/);
  assert.doesNotMatch(legacyHtml, /cp-theme-reset-all/);
  assert.match(legacyHtml, /cp-overlay-blur/);
  assert.match(legacyHtml, /cp-card-opacity/);

  const shellCss = await request('/final-shell.css');
  assert.match(shellCss.body, /hero-crosspilot\.avif/);
  const navCss = await request('/nav-shell.css');
  assert.match(navCss.body, /\.nav-tools-menu/);
  assert.match(navCss.body, /filter:\s*blur/);
  const contentCss = await request('/content-shell.css');
  assert.match(contentCss.body, /\.cp-store-picker/);
  assert.match(contentCss.body, /\.cp-article-grid/);
  assert.match(contentCss.body, /\.markdown-workbench/);
  const themeCss = await request('/theme-controls.css');
  assert.match(themeCss.body, /--cp-fullscreen-blur/);
  assert.match(themeCss.body, /cp-card-opacity-custom/);
  const enhancementCss = await request('/enhancements.css');
  assert.match(enhancementCss.body, /html\[data-theme="light"\] \.cp-global-search/);
  assert.doesNotMatch(legacyHtml, /cp-theme-reset-footer/);

  const enhancementScript = await request('/enhancements.js');
  assert.match(enhancementScript.body, /initSearch/);
  assert.match(enhancementScript.body, /settings\.overlayBlur = DEFAULT_SETTINGS\.overlayBlur/);
  assert.match(enhancementScript.body, /settings\.cardOpacity = DEFAULT_SETTINGS\.cardOpacity/);
  assert.match(enhancementScript.body, /initMusicPlayer/);
  assert.match(enhancementScript.body, /initThemeCustomizer/);
});
