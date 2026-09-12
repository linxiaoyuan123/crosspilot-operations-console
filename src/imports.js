import ExcelJS from 'exceljs';
import { Readable } from 'node:stream';

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 20000;

const REPORT_SPECS = {
  products: {
    label: '商品表现',
    required: ['sku', 'title'],
    fields: {
      sku: ['sku', 'msku', 'seller sku', '商品sku', '商品编码', '货号', 'asin'],
      title: ['title', 'product title', 'product name', '商品标题', '产品名称', '标题'],
      price: ['price', '售价', '销售价', '单价'],
      unit_cost: ['unit cost', 'cost', '采购成本', '成本', '落地成本'],
      units_30d: ['units', 'units sold', 'quantity', '销量', '订单量', '销售数量'],
      sales_30d: ['sales', 'gross sales', 'ordered product sales', '销售额', '销售金额'],
      ad_spend_30d: ['ad spend', 'spend', '广告花费', '广告费'],
      ad_sales_30d: ['ad sales', 'advertising sales', '广告销售额', '广告销售'],
      returns_30d: ['returns', 'returned units', '退货数量', '退货'],
      rating: ['rating', 'star rating', '评分', '星级'],
      review_count: ['reviews', 'review count', '评论数', '评价数量']
    }
  },
  ads: {
    label: '搜索词',
    required: ['sku', 'search_term'],
    fields: {
      sku: ['sku', 'msku', 'advertised sku', '商品sku', '广告sku', '货号'],
      campaign: ['campaign', 'campaign name', '广告活动', '活动名称'],
      ad_group: ['ad group', 'ad group name', '广告组', '广告分组'],
      search_term: ['search term', 'customer search term', 'keyword', '搜索词', '关键词'],
      match_type: ['match type', '匹配类型', '匹配方式'],
      clicks: ['clicks', '点击量', '点击次数'],
      impressions: ['impressions', '曝光量', '展示量'],
      spend: ['spend', 'cost', '花费', '广告花费'],
      ad_sales: ['ad sales', 'sales', '广告销售额', '广告销售'],
      ad_orders: ['orders', 'ad orders', '广告订单', '订单量']
    }
  },
  inventory: {
    label: '库存',
    required: ['sku'],
    fields: {
      sku: ['sku', 'msku', 'seller sku', '商品sku', '货号'],
      snapshot_date: ['date', 'snapshot date', '报告日期', '快照日期'],
      available: ['available', 'fulfillable', 'fba available', '可售库存', '可用库存'],
      inbound: ['inbound', 'in transit', '在途库存', '在途'],
      reserved: ['reserved', '预留库存', '锁定库存'],
      defective: ['defective', 'unfulfillable', '残次品', '不可售'],
      avg_daily_sales: ['avg daily sales', 'daily sales', '日均销量', '平均日销量'],
      last_restock_date: ['last restock date', 'last replenishment', '最近补货日期'],
      note: ['note', 'remark', '备注', '说明']
    }
  },
  after_sales: {
    label: '退货与评论',
    required: ['sku', 'subject'],
    fields: {
      sku: ['sku', 'msku', 'seller sku', '商品sku', '货号'],
      case_no: ['case no', 'ticket no', 'case number', '售后编号', '工单号'],
      type: ['type', 'case type', '类型', '问题类型'],
      subject: ['subject', 'issue', 'title', '主题', '问题', '标题'],
      reason: ['reason', 'return reason', '原因', '退货原因'],
      detail: ['detail', 'description', 'content', '详情', '描述', '内容'],
      status: ['status', '状态'],
      priority: ['priority', '优先级'],
      owner: ['owner', 'assignee', '负责人'],
      due_date: ['due date', 'deadline', '截止日期', '处理期限'],
      evidence: ['evidence', '处理证据', '证据']
    }
  }
};

const PII_PATTERNS = [
  /buyer/,
  /customer.?name/,
  /recipient/,
  /consignee/,
  /address/,
  /street/,
  /postal/,
  /zip/,
  /email/,
  /e-mail/,
  /phone/,
  /mobile/,
  /telephone/,
  /contact/,
  /买家/,
  /客户姓名/,
  /收件人/,
  /地址/,
  /邮箱/,
  /电话/,
  /手机号/
];

export async function parseImportFile(buffer, filename, requestedType = 'auto') {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw importError('文件内容为空');
  if (buffer.length > MAX_IMPORT_BYTES) throw importError('文件不能超过 10 MB');
  const extension = String(filename || '').toLowerCase().split('.').pop();
  let table;
  if (extension === 'csv' || extension === 'txt') table = parseCsv(buffer.toString('utf8').replace(/^\uFEFF/, ''));
  else if (extension === 'xlsx' || extension === 'xls') table = await parseXlsx(buffer);
  else throw importError('仅支持 CSV、XLSX 文件');

  if (!table.headers.length) throw importError('没有识别到表头');
  if (table.rows.length > MAX_IMPORT_ROWS) throw importError('单次最多导入 20,000 行');

  const reportType = requestedType && requestedType !== 'auto'
    ? requireReportType(requestedType)
    : inferReportType(table.headers);
  const result = validateMappedRows(table.rows, table.headers, autoMapHeaders(table.headers, reportType), reportType);
  return {
    filename,
    ...result,
    totalRows: table.rows.length,
    fileSize: buffer.length,
    sampleHeaders: table.headers
  };
}

export function autoMapHeaders(headers, reportType) {
  const spec = requireReportType(reportType);
  const normalized = headers.map((header) => ({ source: header, key: normalizeHeader(header) }));
  const mapping = {};
  for (const [field, aliases] of Object.entries(spec.fields)) {
    const aliasSet = new Set([field, ...aliases].map(normalizeHeader));
    const match = normalized.find((item) => aliasSet.has(item.key));
    if (match) mapping[match.source] = field;
  }
  return mapping;
}

export function validateMappedRows(rows, headers, mapping, reportType) {
  const spec = requireReportType(reportType);
  const piiColumns = headers.filter(isPiiHeader);
  const nonPiiHeaders = headers.filter((header) => !isPiiHeader(header));
  const mappedTargets = new Set(Object.values(mapping));
  const missingRequired = spec.required.filter((field) => !mappedTargets.has(field));
  const normalizedRows = [];
  const seen = new Set();
  let validRows = 0;
  let errorRows = 0;

  rows.forEach((rawRow, index) => {
    const raw = {};
    for (const header of nonPiiHeaders) raw[header] = rawRow[header] ?? '';
    const normalized = {};
    for (const [source, target] of Object.entries(mapping)) {
      if (!target || isPiiHeader(source)) continue;
      const value = rawRow[source];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        normalized[target] = normalizeValue(target, value);
      }
    }
    const errors = [];
    for (const field of spec.required) {
      if (!hasValue(normalized[field])) errors.push(`缺少必填字段：${fieldLabel(field)}`);
    }
    for (const field of Object.keys(spec.fields)) {
      if (normalized[field] === undefined) continue;
      if (isNumericField(field) && !Number.isFinite(Number(normalized[field]))) errors.push(`${fieldLabel(field)} 必须是数字`);
      if (isDateField(field) && normalized[field] && !/^\d{4}-\d{2}-\d{2}$/.test(normalized[field])) errors.push(`${fieldLabel(field)} 日期格式应为 YYYY-MM-DD`);
    }
    const duplicateKey = reportType === 'products' ? normalized.sku : reportType === 'after_sales' ? normalized.case_no : '';
    if (duplicateKey && seen.has(duplicateKey)) errors.push(`重复数据：${duplicateKey}`);
    if (duplicateKey) seen.add(duplicateKey);
    if (errors.length) errorRows += 1;
    else validRows += 1;
    normalizedRows.push({ rowIndex: index + 2, raw, normalized, errors, status: errors.length ? 'error' : 'valid' });
  });

  const preview = normalizedRows.slice(0, 20).map((row) => ({
    rowIndex: row.rowIndex,
    values: row.normalized,
    errors: row.errors,
    status: row.status
  }));

  return {
    reportType,
    reportLabel: spec.label,
    mapping,
    missingRequired,
    piiColumns,
    ignoredColumns: headers.filter((header) => !mappedTargets.has(mapping[header]) || isPiiHeader(header)),
    mappedCount: Object.keys(mapping).length,
    validRows,
    errorRows,
    preview,
    rows: normalizedRows,
    invalidRequired: missingRequired.length > 0
  };
}

export function commitImport(db, batchId) {
  const batch = db.prepare('SELECT * FROM import_batches WHERE id = ?').get(Number(batchId));
  if (!batch) throw importError('导入批次不存在', 404);
  return batch;
}

export function importError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function requireReportType(reportType) {
  const spec = REPORT_SPECS[reportType];
  if (!spec) throw importError('报表类型仅支持 products、ads、inventory、after_sales');
  return spec;
}

function inferReportType(headers) {
  const normalized = headers.map(normalizeHeader);
  let best = { type: '', score: -1 };
  for (const [type, spec] of Object.entries(REPORT_SPECS)) {
    const aliases = Object.values(spec.fields).flat().map(normalizeHeader);
    const score = aliases.filter((alias) => normalized.includes(alias)).length;
    if (score > best.score) best = { type, score };
  }
  if (best.score <= 0) throw importError('无法识别报表类型，请选择商品表现、搜索词、库存或退货评论报表');
  return best.type;
}

async function parseXlsx(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };
  const values = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    values.push(row.values.slice(1).map((value) => {
      if (value && typeof value === 'object') {
        if (value.result !== undefined) return value.result;
        if (value.text !== undefined) return value.text;
        if (value.richText) return value.richText.map((part) => part.text).join('');
      }
      return value ?? '';
    }));
  });
  const headers = uniqueHeaders((values.shift() || []).map((header) => String(header || '').trim()));
  return { headers, rows: values.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))) };
}

function parseCsv(content) {
  const records = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const next = content[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== '')) records.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  row.push(cell.trim());
  if (row.some((value) => value !== '')) records.push(row);
  const headers = uniqueHeaders((records.shift() || []).map((header) => String(header || '').trim()));
  return {
    headers,
    rows: records.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])))
  };
}

function normalizeValue(field, value) {
  const stringValue = String(value).trim();
  if (isNumericField(field)) {
    const normalized = stringValue.replace(/[€$£,\s]/g, '').replace(/%$/, '');
    return Number.isFinite(Number(normalized)) ? Number(normalized) : stringValue;
  }
  if (isDateField(field)) {
    const date = new Date(stringValue);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return stringValue;
}

function isNumericField(field) {
  return /price|cost|spend|sales|units|returns|rating|review|clicks|impressions|orders|available|inbound|reserved|defective|avg_daily_sales/.test(field);
}

function isDateField(field) {
  return /date/.test(field);
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s_\-./()]+/g, '');
}

function isPiiHeader(value) {
  const normalized = String(value || '').toLowerCase();
  return PII_PATTERNS.some((pattern) => pattern.test(normalized));
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function fieldLabel(field) {
  return {
    sku: 'SKU',
    title: '商品标题',
    search_term: '搜索词',
    subject: '问题主题',
    price: '售价',
    unit_cost: '采购成本',
    sales_30d: '销售额',
    units_30d: '销量',
    ad_spend_30d: '广告费',
    ad_sales_30d: '广告销售',
    returns_30d: '退货数量',
    rating: '评分',
    review_count: '评论数',
    campaign: '广告活动',
    clicks: '点击量',
    impressions: '曝光量',
    spend: '花费',
    ad_sales: '广告销售',
    ad_orders: '广告订单',
    available: '可售库存',
    inbound: '在途库存',
    reserved: '预留库存',
    defective: '残次品',
    avg_daily_sales: '日均销量',
    snapshot_date: '快照日期',
    last_restock_date: '最近补货日期',
    case_no: '售后编号',
    type: '问题类型',
    reason: '原因',
    detail: '详情',
    status: '状态',
    priority: '优先级',
    owner: '负责人',
    due_date: '截止日期',
    evidence: '处理证据'
  }[field] || field;
}

function uniqueHeaders(headers) {
  const counts = new Map();
  return headers.map((header, index) => {
    const base = header || `列${index + 1}`;
    const count = (counts.get(base) || 0) + 1;
    counts.set(base, count);
    return count === 1 ? base : `${base}_${count}`;
  });
}
