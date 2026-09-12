import ExcelJS from 'exceljs';
import { buildOverview, deriveAdTerm, deriveAfterSale, deriveInventory, deriveProduct, deriveStoreHealth } from './metrics.js';
import {
  getStore,
  listActions,
  listAdTerms,
  listAfterSales,
  listDailyMetrics,
  listInventory,
  listProducts
} from './store.js';

const FORMATS = new Set(['html', 'md', 'csv', 'xlsx']);
const SENSITIVE_KEY = /password|passwd|secret|token|api.?key|authorization|credential/i;

export async function generateOperationsReport(db, storeId, format = 'html') {
  const normalizedFormat = String(format || 'html').toLowerCase();
  if (!FORMATS.has(normalizedFormat)) throw reportError('报告格式仅支持 html、md、csv 或 xlsx');
  const data = loadOperationsData(db, storeId);
  const generatedAt = new Date().toISOString();
  const title = `${data.store.name} · 运营复盘报告`;
  const base = {
    title,
    filename: `crosspilot-${safeFilename(data.store.code)}-${generatedAt.slice(0, 10)}.${normalizedFormat}`,
    generatedAt
  };
  if (normalizedFormat === 'xlsx') {
    return {
      ...base,
      content: await renderXlsx(data, generatedAt),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
  const content = normalizedFormat === 'csv'
    ? renderCsv(data)
    : normalizedFormat === 'md'
      ? renderMarkdown(data, generatedAt)
      : renderHtml(data, generatedAt);
  return {
    ...base,
    content,
    contentType: {
      html: 'text/html; charset=utf-8',
      md: 'text/markdown; charset=utf-8',
      csv: 'text/csv; charset=utf-8'
    }[normalizedFormat]
  };
}

function loadOperationsData(db, storeId) {
  const store = getStore(db, storeId);
  if (!store) throw reportError('店铺不存在', 404);
  const products = listProducts(db, storeId).map((item) => deriveProduct(item, store));
  const ads = listAdTerms(db, storeId).map((item) => deriveAdTerm(item, store));
  const inventory = listInventory(db, storeId).map((item) => deriveInventory(item, store));
  const afterSales = listAfterSales(db, storeId).map(deriveAfterSale);
  const actions = listActions(db, storeId).map(scrubSensitive);
  const daily = listDailyMetrics(db, storeId, 30);
  const health = deriveStoreHealth(store);
  const overview = buildOverview(health, products, ads, inventory, afterSales, actions, daily);
  return scrubSensitive({
    store: health,
    overview,
    products,
    ads,
    inventory,
    afterSales,
    actions,
    daily
  });
}

function renderHtml(data, generatedAt) {
  const k = data.overview.kpis;
  const products = data.products.map((item) => `
    <tr>
      <td>${escapeHtml(item.sku)}</td>
      <td>${escapeHtml(item.title)}</td>
      <td>${money(item.net_sales_30d, data.store.currency)}</td>
      <td class="${item.net_profit_30d < 0 ? 'danger' : ''}">${money(item.net_profit_30d, data.store.currency)}</td>
      <td>${percentText(item.margin_percent)}</td>
      <td>${percentText(item.acos_percent)}</td>
      <td>${item.listing_score}/100</td>
      <td>${percentText(item.return_rate_percent)}</td>
    </tr>`).join('');
  const actions = data.actions.filter((item) => !['done', 'closed'].includes(item.status)).map((item) => `
    <tr>
      <td>${escapeHtml(item.category)}</td>
      <td>${escapeHtml(item.title)}</td>
      <td>${escapeHtml(priorityLabel(item.priority))}</td>
      <td>${escapeHtml(statusLabel(item.status))}</td>
      <td>${escapeHtml(item.owner || '待分配')}</td>
      <td>${escapeHtml(item.due_date || '-')}</td>
    </tr>`).join('');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(`${data.store.name} · 运营复盘`)}</title>
<style>
:root{--ink:#16212f;--muted:#66768a;--line:#dbe3ec;--brand:#0f766e;--soft:#f4f7f9;--danger:#b42318}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:#fff;font:14px/1.65 "Microsoft YaHei","PingFang SC",sans-serif}
main{max-width:1120px;margin:0 auto;padding:40px 34px 70px}header{padding-bottom:20px;border-bottom:3px solid var(--brand)}
h1{margin:0;font-size:28px}h2{margin:28px 0 12px;font-size:18px}p{margin:5px 0}.meta{color:var(--muted)}
.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.summary-item{padding:12px 14px;background:var(--soft);border:1px solid var(--line);border-radius:8px}
.summary-item span{display:block;color:var(--muted);font-size:11px}.summary-item strong{display:block;margin-top:4px;font-size:16px}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{padding:9px 10px;border:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--soft);font-size:12px}
tr{break-inside:avoid}.danger{color:var(--danger);font-weight:700}.notice{margin-top:18px;padding:12px 14px;border-left:3px solid #d38a13;background:#fff8e8;color:#6f4b0a}
footer{margin-top:36px;padding-top:15px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}
@media(max-width:760px){main{padding:24px 16px}.summary-grid{grid-template-columns:repeat(2,1fr)}table{font-size:12px}}
@media print{main{max-width:none;padding:0}}
</style>
</head>
<body><main>
<header><h1>${escapeHtml(data.store.name)} · 运营复盘报告</h1><p class="meta">${escapeHtml(data.store.platform)} · ${escapeHtml(data.store.market)} · ${escapeHtml(data.store.currency)} · 生成时间 ${formatDateTime(generatedAt)}</p></header>
<section><h2>核心指标</h2><div class="summary-grid">
${summaryItem('净销售额', money(k.netSales, data.store.currency))}
${summaryItem('净利润', money(k.profit, data.store.currency))}
${summaryItem('净利润率', percentText(k.margin))}
${summaryItem('ACOS / TACOS', `${percentText(k.acos)} / ${percentText(k.tacos)}`)}
${summaryItem('ROAS', `${k.roas}x`)}
${summaryItem('退货率', percentText(k.returnRate))}
${summaryItem('库存风险 SKU', `${k.inventoryRiskCount} 个`)}
${summaryItem('待执行动作', `${k.openActions} 项`)}
</div></section>
<section><h2>SKU 经营明细</h2><table><thead><tr><th>SKU</th><th>商品</th><th>净销售</th><th>净利润</th><th>净利率</th><th>ACOS</th><th>Listing</th><th>退货率</th></tr></thead><tbody>${products}</tbody></table></section>
<section><h2>未关闭运营动作</h2><table><thead><tr><th>模块</th><th>动作</th><th>优先级</th><th>状态</th><th>负责人</th><th>截止日期</th></tr></thead><tbody>${actions || '<tr><td colspan="6">当前没有未关闭动作</td></tr>'}</tbody></table></section>
<div class="notice">数据说明：本报告基于模拟或已脱敏的运营数据生成。买家姓名、地址、邮箱、电话及账号密钥不会写入导出文件。</div>
<footer>CrossPilot 跨境电商运营决策中台 · 指标口径：净利润 = 不含税净销售 − 采购成本 − 平台佣金 − FBA/履约费 − 退款损失 − 广告费</footer>
</main></body></html>`;
}

function renderMarkdown(data, generatedAt) {
  const k = data.overview.kpis;
  const lines = [
    `# ${data.store.name} · 运营复盘`,
    '',
    `> ${data.store.platform} · ${data.store.market} · ${data.store.currency} · ${formatDateTime(generatedAt)}`,
    '',
    '## 核心指标',
    '',
    `- 净销售额：${money(k.netSales, data.store.currency)}`,
    `- 净利润：${money(k.profit, data.store.currency)}`,
    `- 净利润率：${percentText(k.margin)}`,
    `- ACOS：${percentText(k.acos)}；TACOS：${percentText(k.tacos)}；ROAS：${k.roas}x`,
    `- 退货率：${percentText(k.returnRate)}`,
    `- 库存风险：${k.inventoryRiskCount} 个 SKU；待执行动作：${k.openActions} 项`,
    '',
    '## SKU 经营明细',
    '',
    '| SKU | 商品 | 净销售 | 净利润 | 净利率 | ACOS | Listing | 退货率 |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |'
  ];
  for (const item of data.products) {
    lines.push(`| ${md(item.sku)} | ${md(item.title)} | ${money(item.net_sales_30d, data.store.currency)} | ${money(item.net_profit_30d, data.store.currency)} | ${percentText(item.margin_percent)} | ${percentText(item.acos_percent)} | ${item.listing_score}/100 | ${percentText(item.return_rate_percent)} |`);
  }
  lines.push('', '## 未关闭运营动作', '', '| 模块 | 动作 | 优先级 | 状态 | 负责人 | 截止日期 |', '| --- | --- | --- | --- | --- | --- |');
  const openActions = data.actions.filter((item) => !['done', 'closed'].includes(item.status));
  if (!openActions.length) lines.push('| - | 当前没有未关闭动作 | - | - | - | - |');
  for (const item of openActions) {
    lines.push(`| ${md(item.category)} | ${md(item.title)} | ${md(priorityLabel(item.priority))} | ${md(statusLabel(item.status))} | ${md(item.owner || '待分配')} | ${md(item.due_date)} |`);
  }
  lines.push('', '## 广告搜索词', '', '| 搜索词 | 活动 | 点击 | 花费 | 广告销售 | ACOS | 建议 |', '| --- | --- | ---: | ---: | ---: | ---: | --- |');
  for (const item of data.ads.slice(0, 20)) lines.push(`| ${md(item.search_term)} | ${md(item.campaign)} | ${item.clicks} | ${money(item.spend, data.store.currency)} | ${money(item.ad_sales, data.store.currency)} | ${percentText(item.acos_percent)} | ${md(item.action_label)} |`);
  lines.push('', '## 库存与履约', '', '| SKU | 可售 | 在途 | 覆盖天数 | 风险 | 建议补货 |', '| --- | ---: | ---: | ---: | --- | ---: |');
  for (const item of data.inventory) lines.push(`| ${md(item.sku)} | ${item.available} | ${item.inbound} | ${item.coverage_days} | ${md(item.risk_label)} | ${item.reorder_units} |`);
  lines.push('', '## 售后与账号健康', '', `- 店铺评分：${data.store.health_rating}；订单缺陷率：${percentText(data.store.order_defect_rate)}；迟发率：${percentText(data.store.late_shipment_rate)}；取消率：${percentText(data.store.cancellation_rate)}`);
  for (const item of data.afterSales.slice(0, 20)) lines.push(`- ${item.case_no} · ${item.type} · ${item.subject} · ${statusLabel(item.status)} · ${item.sla_label}`);
  lines.push('', '> 模拟或脱敏数据；不包含 PII、密码、Token 或 API Key。');
  return `${lines.join('\n')}\n`;
}

function renderCsv(data) {
  const rows = [];
  const k = data.overview.kpis;
  rows.push({ 模块: 'Summary', 项目: '店铺', 值: data.store.name, 额外信息: `${data.store.platform}/${data.store.market}` });
  rows.push({ 模块: 'Summary', 项目: '净销售额', 值: k.netSales, 额外信息: data.store.currency });
  rows.push({ 模块: 'Summary', 项目: '净利润', 值: k.profit, 额外信息: data.store.currency });
  rows.push({ 模块: 'Summary', 项目: '净利润率', 值: `${k.margin}%`, 额外信息: '' });
  rows.push({ 模块: 'Summary', 项目: 'ACOS', 值: `${k.acos}%`, 额外信息: '' });
  rows.push({ 模块: 'Summary', 项目: 'TACOS', 值: `${k.tacos}%`, 额外信息: '' });
  rows.push({ 模块: 'Summary', 项目: '退货率', 值: `${k.returnRate}%`, 额外信息: '' });
  for (const item of data.products) rows.push({ 模块: 'SKU', 项目: item.sku, 值: item.net_profit_30d, 额外信息: `净销售 ${item.net_sales_30d}; 净利率 ${item.margin_percent}%; ACOS ${item.acos_percent}%; Listing ${item.listing_score}; 退货率 ${item.return_rate_percent}%` });
  for (const item of data.ads) rows.push({ 模块: '广告', 项目: item.search_term, 值: item.spend, 额外信息: `销售 ${item.ad_sales}; ACOS ${item.acos_percent}%; 建议 ${item.action_label}` });
  for (const item of data.inventory) rows.push({ 模块: '库存', 项目: item.sku, 值: item.coverage_days, 额外信息: `可售 ${item.available}; 在途 ${item.inbound}; ${item.risk_label}; 建议补货 ${item.reorder_units}` });
  for (const item of data.afterSales) rows.push({ 模块: '售后', 项目: item.case_no, 值: item.status, 额外信息: `${item.type}; ${item.subject}; ${item.sla_label}` });
  return csvFromRows(rows);
}

async function renderXlsx(data, generatedAt) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CrossPilot';
  workbook.created = new Date(generatedAt);
  addSummarySheet(workbook, data, generatedAt);
  addProductSheet(workbook, data);
  addAdsSheet(workbook, data);
  addInventorySheet(workbook, data);
  addAfterSalesSheet(workbook, data);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function addSummarySheet(workbook, data, generatedAt) {
  const sheet = workbook.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
  const k = data.overview.kpis;
  sheet.columns = [
    { header: '指标', key: 'label', width: 28 },
    { header: '数值', key: 'value', width: 22 },
    { header: '说明', key: 'note', width: 48 }
  ];
  [
    ['店铺', data.store.name, `${data.store.platform} · ${data.store.market}`],
    ['报告生成时间', formatDateTime(generatedAt), '模拟/脱敏数据'],
    ['净销售额', k.netSales, data.store.currency],
    ['净利润', k.profit, data.store.currency],
    ['净利润率', k.margin / 100, '净利润 ÷ 净销售额'],
    ['ACOS', k.acos / 100, '广告花费 ÷ 广告销售'],
    ['TACOS', k.tacos / 100, '广告花费 ÷ 总销售'],
    ['ROAS', k.roas, '广告销售 ÷ 广告花费'],
    ['退货率', k.returnRate / 100, '退货件数 ÷ 销量'],
    ['库存风险 SKU', k.inventoryRiskCount, '缺货或 90 天以上滞销'],
    ['待执行动作', k.openActions, '未关闭运营动作']
  ].forEach(([label, value, note]) => sheet.addRow({ label, value, note }));
  styleWorkbookSheet(sheet, [22]);
  sheet.getColumn(2).numFmt = '0.00';
  for (const rowNumber of [5, 7, 8, 9, 10]) sheet.getCell(`B${rowNumber}`).numFmt = '0.00%';
}

function addProductSheet(workbook, data) {
  const sheet = workbook.addWorksheet('SKU', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    ['SKU', 'sku', 16], ['商品', 'title', 46], ['售价', 'price', 12], ['销量', 'units_30d', 12],
    ['净销售', 'net_sales_30d', 14], ['采购成本', 'cogs_30d', 14], ['平台佣金', 'referral_fee_30d', 14],
    ['履约费', 'fulfillment_fee_30d', 14], ['广告费', 'ad_spend_30d', 14], ['净利润', 'net_profit_30d', 14],
    ['净利率', 'margin_percent', 12], ['ACOS', 'acos_percent', 12], ['TACOS', 'tacos_percent', 12],
    ['Listing', 'listing_score', 11], ['退货率', 'return_rate_percent', 12], ['建议售价', 'suggested_price', 14]
  ].map(([header, key, width]) => ({ header, key, width }));
  data.products.forEach((item) => sheet.addRow(item));
  styleWorkbookSheet(sheet, [11, 12, 13, 14, 15]);
}

function addAdsSheet(workbook, data) {
  const sheet = workbook.addWorksheet('Ads', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    ['SKU', 'sku', 16], ['活动', 'campaign', 26], ['广告组', 'ad_group', 18], ['搜索词', 'search_term', 40],
    ['匹配类型', 'match_type', 12], ['点击', 'clicks', 10], ['曝光', 'impressions', 12], ['花费', 'spend', 12],
    ['广告销售', 'ad_sales', 14], ['订单', 'ad_orders', 10], ['ACOS', 'acos_percent', 12], ['CVR', 'cvr_percent', 12],
    ['建议', 'action_label', 18]
  ].map(([header, key, width]) => ({ header, key, width }));
  data.ads.forEach((item) => sheet.addRow(item));
  styleWorkbookSheet(sheet, [11, 12]);
}

function addInventorySheet(workbook, data) {
  const sheet = workbook.addWorksheet('Inventory', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    ['SKU', 'sku', 16], ['商品', 'product_title', 42], ['可售', 'available', 11], ['在途', 'inbound', 11],
    ['预留', 'reserved', 11], ['残次', 'defective', 11], ['日均销量', 'avg_daily_sales', 13],
    ['覆盖天数', 'coverage_days', 13], ['安全天数', 'safety_days', 12], ['风险', 'risk_label', 14],
    ['建议补货', 'reorder_units', 13], ['建议日期', 'recommended_order_date', 14]
  ].map(([header, key, width]) => ({ header, key, width }));
  data.inventory.forEach((item) => sheet.addRow(item));
  styleWorkbookSheet(sheet);
}

function addAfterSalesSheet(workbook, data) {
  const sheet = workbook.addWorksheet('After-sales', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    ['售后编号', 'case_no', 16], ['SKU', 'sku', 16], ['类型', 'type', 12], ['主题', 'subject', 38],
    ['原因', 'reason', 28], ['状态', 'status', 12], ['优先级', 'priority', 11], ['负责人', 'owner', 14],
    ['截止日期', 'due_date', 14], ['SLA', 'sla_label', 13]
  ].map(([header, key, width]) => ({ header, key, width }));
  data.afterSales.forEach((item) => sheet.addRow(item));
  styleWorkbookSheet(sheet);
}

function styleWorkbookSheet(sheet, percentColumns = []) {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
  header.alignment = { vertical: 'middle', horizontal: 'left' };
  header.height = 24;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: `${columnLetter(sheet.columnCount)}1` };
  for (let column = 1; column <= sheet.columnCount; column += 1) {
    if (percentColumns.includes(column)) sheet.getColumn(column).numFmt = '0.00"%"';
  }
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      if (typeof cell.value === 'string' && /^[=+\-@]/.test(cell.value)) cell.value = `'${cell.value}`;
    });
  });
}

function csvFromRows(rows) {
  if (!rows.length) return '';
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return `\uFEFF${headers.map(csvCell).join(',')}\n${rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')).join('\n')}\n`;
}

function csvCell(value) {
  let text = value === undefined || value === null ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function scrubSensitive(value, seen = new WeakSet()) {
  if (Array.isArray(value)) return value.map((item) => scrubSensitive(item, seen));
  if (!value || typeof value !== 'object') return value;
  if (!(seen instanceof WeakSet)) seen = new WeakSet();
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : scrubSensitive(item, seen);
  }
  return output;
}

function summaryItem(label, value) {
  return `<div class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function reportError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function money(value, currency) {
  return `${currency || ''} ${Number(value || 0).toFixed(2)}`.trim();
}

function percentText(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function priorityLabel(priority) {
  return { critical: 'P0 紧急', high: 'P1 高', medium: 'P2 中', low: 'P3 低' }[priority] || priority;
}

function statusLabel(status) {
  return { open: '待处理', in_progress: '处理中', deferred: '已延期', done: '已完成', closed: '已关闭', resolved: '已解决', waiting: '待外部反馈', ignored: '已忽略' }[status] || status;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Hong_Kong' }).format(date);
}

function safeFilename(value) {
  return String(value || 'report').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function md(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function columnLetter(number) {
  let result = '';
  let current = number;
  while (current > 0) {
    current -= 1;
    result = String.fromCharCode(65 + (current % 26)) + result;
    current = Math.floor(current / 26);
  }
  return result;
}
