const ICON_PATHS = {
  overview: '<path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-11h6V4h-6v5Z"/>',
  imports: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  listings: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5M8 17h3"/><path d="m15 16 2 2 3-4"/>',
  ads: '<path d="m3 11 18-5v12L3 13v-2Z"/><path d="M7 13v5a2 2 0 0 0 4 0v-4"/>',
  inventory: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7v10l8 4 8-4V7M12 11v10"/>',
  aftersales: '<path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 9h8M8 13h5"/>',
  reviews: '<path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/>',
  alert: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  search: '<circle cx="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/>',
  upload: '<path d="M12 15V3m0 0 4 4m-4-4L8 7"/><path d="M4 15v4h16v-4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4Z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6Z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M21 12h-3"/>',
  box: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7v10l8 4 8-4V7M12 11v10"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  chart: '<path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-7"/>',
  message: '<path d="M4 5h16v11H8l-4 4V5Z"/><path d="M8 9h8M8 12h5"/>',
  file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h4"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'
};

const VIEW_META = {
  overview: { title: '运营总览', eyebrow: '经营驾驶舱' },
  imports: { title: '数据导入', eyebrow: '报表清洗与字段映射' },
  listings: { title: 'Listing与商品', eyebrow: '商品与内容优化' },
  ads: { title: '广告与流量', eyebrow: '搜索词与投放决策' },
  inventory: { title: '库存与履约', eyebrow: '补货与风险控制' },
  aftersales: { title: '售后与账号', eyebrow: '问题闭环与健康预警' },
  reviews: { title: '运营复盘', eyebrow: '周期总结与报告导出' }
};

const HERO_PHRASES = [
  '识别利润、广告与库存问题，不让异常停留在表格里。',
  '把报表映射成统一字段，把指标变成可执行动作。',
  '从 Listing 优化到补货决策，每一步都有证据可回写。',
  '用日报、周报和月报，让跨境运营形成真正的闭环。'
];

const STATUS_LABELS = {
  open: '待处理',
  in_progress: '处理中',
  deferred: '已延期',
  done: '已完成',
  closed: '已关闭',
  ignored: '已忽略',
  resolved: '已解决',
  waiting: '待外部反馈',
  healthy: '健康',
  warning: '预警',
  stockout: '缺货风险',
  overstock: '滞销风险',
  cancelled: '已取消',
  preview: '待确认',
  committed: '已入库'
};

const PRIORITY_LABELS = { critical: 'P0 紧急', high: 'P1 高', medium: 'P2 中', low: 'P3 低' };
const IMPORT_TARGET_FIELDS = {
  products: [
    ['sku', 'SKU'], ['title', '商品标题'], ['price', '售价'], ['unit_cost', '采购成本'],
    ['units_30d', '销量'], ['sales_30d', '销售额'], ['ad_spend_30d', '广告费'],
    ['ad_sales_30d', '广告销售'], ['returns_30d', '退货数量'], ['rating', '评分'], ['review_count', '评论数']
  ],
  ads: [
    ['sku', 'SKU'], ['campaign', '广告活动'], ['ad_group', '广告组'], ['search_term', '搜索词'],
    ['match_type', '匹配类型'], ['clicks', '点击量'], ['impressions', '曝光量'], ['spend', '花费'],
    ['ad_sales', '广告销售'], ['ad_orders', '广告订单']
  ],
  inventory: [
    ['sku', 'SKU'], ['snapshot_date', '快照日期'], ['available', '可售库存'], ['inbound', '在途库存'],
    ['reserved', '预留库存'], ['defective', '残次品'], ['avg_daily_sales', '日均销量'],
    ['last_restock_date', '最近补货日期'], ['note', '备注']
  ],
  after_sales: [
    ['sku', 'SKU'], ['case_no', '售后编号'], ['type', '问题类型'], ['subject', '主题'],
    ['reason', '原因'], ['detail', '详情'], ['status', '状态'], ['priority', '优先级'],
    ['owner', '负责人'], ['due_date', '截止日期'], ['evidence', '处理证据']
  ]
};

const state = {
  view: 'overview',
  storeId: null,
  stores: [],
  overview: null,
  actions: [],
  imports: [],
  pendingImport: null,
  products: [],
  selectedProductId: null,
  ads: null,
  inventory: null,
  afterSales: null,
  knowledge: [],
  knowledgeQuery: '',
  productQuery: '',
  reviewTab: 'reports'
};

const app = document.querySelector('#app');
const pageTitle = document.querySelector('#page-title');
const pageEyebrow = document.querySelector('#page-eyebrow');
const storeSelect = document.querySelector('#global-store');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');
const fontToggle = document.querySelector('#font-toggle');
const appHeader = document.querySelector('.app-header');
const navProgress = document.querySelector('#nav-progress');
const heroTypewriter = document.querySelector('#hero-typewriter');
const shellLeft = document.querySelector('#shell-left');
const shellRight = document.querySelector('#shell-right');

init();

function init() {
  document.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icon(element.dataset.icon);
  });
  applyFontMode(readFontMode());
  initFontToggle();
  initSakura();
  initHeroTypewriter();
  initAppHeader();
  document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.nav)));
  document.querySelector('#refresh-button').addEventListener('click', () => loadCurrentView(true));
  storeSelect.addEventListener('change', async () => {
    state.storeId = Number(storeSelect.value) || null;
    state.selectedProductId = null;
    state.pendingImport = null;
    await loadCurrentView(true);
  });
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('change', handleChange);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
  const hashView = window.location.hash.replace('#', '');
  if (VIEW_META[hashView]) state.view = hashView;
  updateViewChrome();
  checkHealth();
  bootstrap();
}

async function bootstrap() {
  app.innerHTML = loadingTemplate('正在加载 CrossPilot 运营数据');
  try {
    const { items } = await api('/api/stores');
    state.stores = items;
    state.storeId = state.stores[0]?.id || null;
    renderStoreSwitcher();
    await loadCurrentView();
  } catch (error) {
    app.innerHTML = errorTemplate(error.message);
  }
}

async function loadCurrentView(force = false) {
  if (!state.stores.length || force) {
    const { items } = await api('/api/stores');
    state.stores = items;
    if (!state.stores.some((store) => store.id === state.storeId)) state.storeId = state.stores[0]?.id || null;
    renderStoreSwitcher();
  }
  if (!state.storeId) return renderEmptyPage('还没有店铺数据', '请先准备 CrossPilot 演示数据库。');
  app.innerHTML = loadingTemplate('正在整理运营数据');
  try {
    if (state.view === 'overview') await loadOverview();
    if (state.view === 'imports') await loadImports();
    if (state.view === 'listings') await loadListings();
    if (state.view === 'ads') await loadAds();
    if (state.view === 'inventory') await loadInventory();
    if (state.view === 'aftersales') await loadAfterSales();
    if (state.view === 'reviews') await loadReviews();
  } catch (error) {
    app.innerHTML = errorTemplate(error.message);
  }
  renderShellSidebars();
}

async function loadOverview() {
  const [overview, actions] = await Promise.all([
    api(`/api/overview?storeId=${state.storeId}`),
    api(`/api/actions?storeId=${state.storeId}&status=all`)
  ]);
  state.overview = overview;
  state.actions = actions.items;
  renderOverview();
}

async function loadImports() {
  const { items } = await api(`/api/imports?storeId=${state.storeId}`);
  state.imports = items;
  if (state.pendingImport && !items.some((item) => item.id === state.pendingImport.id && item.status === 'preview')) state.pendingImport = null;
  renderImports();
}

async function loadListings() {
  const { items } = await api(`/api/products?storeId=${state.storeId}`);
  state.products = items;
  if (!state.selectedProductId || !items.some((item) => item.id === state.selectedProductId)) state.selectedProductId = items[0]?.id || null;
  renderListings();
}

async function loadAds() {
  state.ads = await api(`/api/ads?storeId=${state.storeId}`);
  renderAds();
}

async function loadInventory() {
  state.inventory = await api(`/api/inventory?storeId=${state.storeId}`);
  renderInventory();
}

async function loadAfterSales() {
  state.afterSales = await api(`/api/after-sales?storeId=${state.storeId}`);
  renderAfterSales();
}

async function loadReviews() {
  const [knowledge, overview] = await Promise.all([
    api(`/api/knowledge${state.knowledgeQuery ? `?q=${encodeURIComponent(state.knowledgeQuery)}` : ''}`),
    api(`/api/overview?storeId=${state.storeId}`)
  ]);
  state.knowledge = knowledge.items;
  state.overview = overview;
  renderReviews();
}

function renderOverview() {
  const data = state.overview;
  const k = data.kpis;
  const openActions = state.actions.filter((item) => !isClosedAction(item.status));
  const critical = openActions.filter((item) => item.priority === 'critical').length;
  const high = openActions.filter((item) => item.priority === 'high').length;
  app.innerHTML = `
    ${viewHead('运营总览', `${data.store.name} 近 30 天经营结果。先看利润和风险，再进入对应模块处理。`, `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}重新计算动作</button>
      <button class="button primary" data-action="new-action">${icon('plus')}新增运营动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('chart', '净销售额', money(k.netSales, data.store.currency), `总销售 ${money(k.sales, data.store.currency)}`, 'listings', 'accent')}
      ${metricCard('target', '净利润率', `${k.margin}%`, `净利润 ${money(k.profit, data.store.currency)}`, 'listings', k.margin < 10 ? 'red' : 'green')}
      ${metricCard('ads', 'ACOS / TACOS', `${k.acos}% / ${k.tacos}%`, `ROAS ${k.roas}x`, 'ads', k.acos > Number(data.store.target_acos) ? 'amber' : 'green')}
      ${metricCard('inventory', '库存风险', `${k.inventoryRiskCount} 个 SKU`, `缺货与滞销合计`, 'inventory', k.inventoryRiskCount ? 'amber' : 'green')}
      ${metricCard('aftersales', '退货率', `${k.returnRate}%`, `${k.units} 件销量`, 'aftersales', k.returnRate > 8 ? 'red' : 'green')}
      ${metricCard('target', '评分健康', `${k.rating} / 5`, `${number(k.reviewCount)} 条评论`, 'aftersales', data.store.health_status === 'warning' ? 'amber' : 'green')}
      ${metricCard('check', '待执行动作', `${openActions.length} 项`, `P0 ${critical} · P1 ${high}`, null, openActions.length ? 'amber' : 'green')}
      ${metricCard('message', '待处理售后', `${k.pendingAfterSales} 项`, `低毛利 SKU ${k.lowMarginProducts} 个`, 'aftersales', k.pendingAfterSales ? 'amber' : 'green')}
    </div>
    <div class="focus-strip cp-focus-strip">
      <div class="focus-copy">
        <span class="focus-label">今日运营焦点</span>
        <strong>${h(openActions[0]?.title || '当前没有需要立即处理的异常')}</strong>
        <small>${h(openActions[0]?.description || '规则引擎会持续复核利润、广告、库存、Listing 与售后数据。')}</small>
      </div>
      <div class="focus-progress">
        <div class="progress-label"><span>动作关闭率</span><strong>${actionCloseRate(state.actions)}%</strong></div>
        <div class="progress-track large"><span style="width:${actionCloseRate(state.actions)}%"></span></div>
      </div>
    </div>
    <div class="cp-dashboard-grid">
      <section class="panel cp-chart-panel">
        <div class="panel-head"><div><span class="panel-kicker">30-day trend</span><h3>销售与利润走势</h3></div><span class="muted">${h(data.store.currency)} · 模拟数据</span></div>
        ${renderTrendChart(data.trend, data.store.currency)}
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">priority queue</span><h3>动作中心</h3></div><button class="text-button" data-action="refresh-actions">刷新 ${icon('arrow')}</button></div>
        <div class="cp-action-list">${openActions.slice(0, 6).map(actionCompact).join('') || emptyBlock('没有待执行动作', '规则引擎当前未发现新异常。')}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">account health</span><h3>账号健康阈值</h3></div><span class="badge status-${h(data.store.health_status)}">${h(STATUS_LABELS[data.store.health_status] || data.store.health_status)}</span></div>
        <div class="cp-health-list">${data.health.map((item) => healthRow(item)).join('')}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">sku watchlist</span><h3>SKU 异常榜</h3></div><button class="text-button" data-nav="listings">全部商品 ${icon('arrow')}</button></div>
        ${renderRiskProducts(data.riskProducts, data.store.currency)}
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">activity</span><h3>最近动态</h3></div><span class="muted">实时回写</span></div>
        <div class="cp-activity-list">${data.activities.slice(0, 6).map((item) => `<div class="cp-activity-row"><span class="activity-dot"></span><div><strong>${h(activityTitle(item.action))}</strong><p>${h(item.detail)}</p></div><time>${h(relativeTime(item.created_at))}</time></div>`).join('')}</div>
      </section>
    </div>`;
}

function renderImports() {
  const batch = state.pendingImport;
  app.innerHTML = `
    ${viewHead('数据导入', '拖入 Amazon、TikTok Shop、Shopee 或 Walmart 报表，自动识别字段并跳过买家隐私信息。', `
      <a class="button secondary" href="/api/knowledge/field-map" target="_blank">${icon('database')}字段映射说明</a>`)}
    <div class="cp-import-grid">
      <section class="panel cp-import-upload">
        <div class="panel-head"><div><span class="panel-kicker">step 1 · upload</span><h3>上传报表</h3></div><span class="safe-chip">上限 10 MB / 20,000 行</span></div>
        <div class="cp-drop-zone" data-drop-zone>
          ${icon('upload', 34)}
          <strong>拖拽 CSV 或 XLSX 到这里</strong>
          <p>支持商品表现、搜索词、库存、退货与评论四类报表</p>
          <label class="button primary">${icon('plus')}选择文件<input id="import-file" type="file" accept=".csv,.xlsx,.xls" hidden></label>
        </div>
        <div class="cp-import-note">${icon('check')}字段自动映射 · ${icon('check')}错误行预览 · ${icon('check')}PII 不入库</div>
      </section>
      <section class="panel cp-import-preview">
        <div class="panel-head"><div><span class="panel-kicker">step 2 · mapping</span><h3>字段映射与预览</h3></div>${batch ? `<span class="badge status-${h(batch.status)}">${h(STATUS_LABELS[batch.status] || batch.status)}</span>` : ''}</div>
        ${batch ? renderImportPreview(batch) : emptyBlock('等待上传报表', '上传后在这里检查字段映射、错误行、PII 跳过项和可入库行数。')}
      </section>
    </div>
    <section class="panel cp-import-history">
      <div class="panel-head"><div><span class="panel-kicker">import history</span><h3>最近导入</h3></div><span class="muted">仅保存脱敏后的字段</span></div>
      ${renderImportHistory(state.imports)}
    </section>`;
}

function renderImportPreview(batch) {
  const fields = IMPORT_TARGET_FIELDS[batch.report_type] || [];
  const sourceKeys = [...new Set([
    ...batch.rows.flatMap((row) => Object.keys(row.raw || {})),
    ...(batch.pii_columns || [])
  ])];
  const mappingRows = sourceKeys.map((source) => {
    const pii = batch.pii_columns.includes(source);
    const selected = batch.mapping[source] || '';
    return `<tr class="${pii ? 'cp-pii-row' : ''}">
      <td><strong>${h(source)}</strong>${pii ? '<span class="badge status-warning">PII 跳过</span>' : ''}</td>
      <td><select data-mapping-source="${escapeAttr(source)}" ${pii ? 'disabled' : ''}><option value="">不导入</option>${fields.map(([value, label]) => `<option value="${value}" ${selected === value ? 'selected' : ''}>${h(label)}</option>`).join('')}</select></td>
    </tr>`;
  }).join('');
  const previewRows = batch.rows.slice(0, 8);
  return `
    <div class="cp-import-summary">
      ${miniStat('识别类型', batch.report_type === 'products' ? '商品表现' : batch.report_type === 'ads' ? '搜索词' : batch.report_type === 'inventory' ? '库存' : '退货/评论')}
      ${miniStat('总行数', number(batch.total_rows))}
      ${miniStat('可入库', number(batch.valid_rows), 'green')}
      ${miniStat('错误行', number(batch.error_rows), batch.error_rows ? 'red' : 'green')}
      ${miniStat('PII 跳过', number(batch.pii_columns.length), 'amber')}
    </div>
    ${batch.invalidRequired?.length ? `<div class="cp-inline-alert">${icon('alert')}缺少必填字段，请调整映射后再提交。</div>` : ''}
    <div class="cp-mapping-table"><table class="data-table"><thead><tr><th>源字段</th><th>映射为</th></tr></thead><tbody>${mappingRows}</tbody></table></div>
    <div class="cp-preview-head"><strong>数据预览</strong><span>显示前 ${previewRows.length} 行</span></div>
    <div class="data-table-wrap cp-preview-table"><table class="data-table"><thead><tr><th>行</th>${fields.slice(0, 6).map(([, label]) => `<th>${h(label)}</th>`).join('')}<th>校验</th></tr></thead><tbody>
      ${previewRows.map((row) => `<tr><td>${row.row_index}</td>${fields.slice(0, 6).map(([key]) => `<td>${h(row.normalized[key] ?? '-')}</td>`).join('')}<td>${row.errors.length ? `<span class="badge status-failed">${row.errors.length} 个错误</span>` : '<span class="badge status-healthy">可入库</span>'}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="cp-wizard-actions">
      <button class="button secondary" data-action="reset-import">重新选择</button>
      <button class="button secondary" data-action="cancel-import" data-id="${batch.id}">取消批次</button>
      <button class="button secondary" data-action="apply-mapping" data-id="${batch.id}">${icon('refresh')}应用映射</button>
      <button class="button primary" data-action="commit-import" data-id="${batch.id}" ${batch.valid_rows ? '' : 'disabled'}>${icon('check')}确认入库 ${batch.valid_rows} 行</button>
    </div>`;
}

function renderImportHistory(items) {
  if (!items.length) return emptyBlock('还没有导入记录', '演示数据库内置的数据不会出现在这里。');
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>文件</th><th>类型</th><th>状态</th><th>可入库</th><th>错误</th><th>PII</th><th>时间</th><th></th></tr></thead><tbody>
    ${items.map((item) => `<tr><td><strong>${h(item.filename)}</strong></td><td>${h(reportTypeLabel(item.report_type))}</td><td>${statusBadge(item.status)}</td><td>${number(item.valid_rows)}</td><td>${number(item.error_rows)}</td><td>${number(item.pii_columns.length)}</td><td>${h(shortDateTime(item.created_at))}</td><td>${item.status === 'preview' ? `<button class="text-button" data-action="open-import" data-id="${item.id}">继续处理</button>` : ''}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderListings() {
  const selected = state.products.find((item) => item.id === state.selectedProductId) || state.products[0] || null;
  const filtered = state.products.filter((item) => !state.productQuery || `${item.sku} ${item.title}`.toLowerCase().includes(state.productQuery.toLowerCase()));
  app.innerHTML = `
    ${viewHead('Listing与商品', '用标题、五点、图片、属性、关键词覆盖和合规性六维评分，定位内容短板并生成上新资料包。', `
      <button class="button primary" data-action="listing-package" ${selected ? `data-id="${selected.id}"` : 'disabled'}>${icon('file')}生成资料包</button>`)}
    <div class="cp-split-layout">
      <section class="panel cp-product-sidebar">
        <div class="panel-head"><div><span class="panel-kicker">catalogue</span><h3>商品列表</h3></div><span class="muted">${state.products.length} 个 SKU</span></div>
        <form id="product-search-form" class="cp-search-form"><input name="q" value="${escapeAttr(state.productQuery)}" placeholder="搜索 SKU 或标题"><button class="icon-button" type="submit">${icon('search')}</button></form>
        <div class="cp-product-list">
          ${filtered.map((item) => `<button type="button" class="${item.id === selected?.id ? 'is-active' : ''}" data-action="select-product" data-id="${item.id}"><span>${h(item.sku)}</span><strong>${h(item.title)}</strong><small>Listing ${item.listing_score}/100 · 净利率 ${item.margin_percent}%</small></button>`).join('') || emptyBlock('没有匹配商品', '调整关键词后再试。')}
        </div>
      </section>
      <section class="panel cp-product-detail">
        ${selected ? renderListingDetail(selected) : emptyBlock('暂无商品', '导入商品表现报表后即可评分。')}
      </section>
    </div>
    <section class="panel cp-profit-panel">
      <div class="panel-head"><div><span class="panel-kicker">profit & pricing</span><h3>利润与定价</h3></div><span class="muted">净利润 = 净销售 − 采购 − 佣金 − 履约 − 退款损失 − 广告费</span></div>
      ${renderProfitTable(state.products)}
    </section>`;
}

function renderListingDetail(product) {
  const scores = [
    ['标题', product.titleScore], ['五点描述', product.bulletScore], ['图片', product.imageScore],
    ['属性', product.attributeScore], ['关键词覆盖', product.keywordScore], ['合规性', product.complianceScore]
  ];
  return `
    <header class="cp-detail-head">
      <div><span class="project-kicker">${h(product.sku)} · ${h(product.asin || '待补充 ASIN')}</span><h2>${h(product.title)}</h2><p>${h(product.issue_summary || '当前 Listing 结构完整，继续保持。')}</p></div>
      <div class="cp-score-ring" style="--score:${product.listing_score}"><strong>${product.listing_score}</strong><span>Listing</span></div>
    </header>
    <div class="cp-score-grid">${scores.map(([label, score]) => `<div class="cp-score-item"><div><span>${h(label)}</span><strong>${score}</strong></div><div class="progress-track"><span style="width:${Math.max(0, Math.min(100, Number(score)))}%"></span></div></div>`).join('')}</div>
    <div class="cp-detail-grid">
      <div><span>售价</span><strong>${money(product.price)}</strong></div>
      <div><span>建议售价</span><strong>${money(product.suggested_price)}</strong></div>
      <div><span>盈亏平衡价</span><strong>${money(product.break_even_price)}</strong></div>
      <div><span>转化率</span><strong>${product.cvr_percent}%</strong></div>
      <div><span>退货率</span><strong>${product.return_rate_percent}%</strong></div>
      <div><span>评分</span><strong>${product.rating} / 5</strong></div>
    </div>
    <div class="cp-detail-actions">
      <button class="button primary" data-action="listing-package" data-id="${product.id}">${icon('file')}生成上新资料包</button>
      <button class="button secondary" data-action="create-listing-action" data-id="${product.id}">${icon('plus')}创建优化动作</button>
    </div>`;
}

function renderProfitTable(products) {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>SKU / 商品</th><th>售价</th><th>单位成本</th><th>净销售</th><th>净利润</th><th>净利率</th><th>ACOS</th><th>建议售价</th><th>诊断</th></tr></thead><tbody>
    ${products.map((item) => `<tr><td><strong>${h(item.sku)}</strong><small class="cell-note">${h(item.title)}</small></td><td>${money(item.price)}</td><td>${money(item.unit_cost)}</td><td>${money(item.net_sales_30d)}</td><td class="${item.net_profit_30d < 0 ? 'cp-danger-text' : 'cp-green-text'}">${money(item.net_profit_30d)}</td><td>${item.margin_percent}%</td><td>${item.acos_percent}%</td><td>${money(item.suggested_price)}</td><td>${item.margin_percent < 10 ? '<span class="badge status-warning">低毛利</span>' : '<span class="badge status-healthy">健康</span>'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderAds() {
  const data = state.ads;
  const s = data.summary;
  app.innerHTML = `
    ${viewHead('广告与流量', '按搜索词计算 ACOS、CVR、CPC 和 ROAS，规则直接给出加词、否词、降价、暂停或放量建议。', `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}同步动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('ads', '广告花费', money(s.totalSpend, data.store.currency), '近 30 天', null, 'accent')}
      ${metricCard('chart', '广告销售', money(s.totalSales, data.store.currency), `整体 ACOS ${s.acos}%`, null, s.acos > data.store.target_acos ? 'amber' : 'green')}
      ${metricCard('x', '否词候选', `${s.negativeCandidates} 个`, '15+ 点击且 0 订单', null, 'red')}
      ${metricCard('target', '降价 / 暂停', `${s.reductionCandidates} 个`, `目标 ACOS ${data.store.target_acos}%`, null, 'amber')}
      ${metricCard('plus', '放量候选', `${s.scaleCandidates} 个`, '有订单且 ACOS 达标', null, 'green')}
    </div>
    <section class="panel">
      <div class="panel-head"><div><span class="panel-kicker">search term actions</span><h3>搜索词决策表</h3></div><span class="muted">规则可解释，不使用生成式猜测</span></div>
      ${renderAdsTable(data.items)}
    </section>
    <div class="cp-recommendation-grid">
      ${data.items.filter((item) => item.recommendation !== 'keep').slice(0, 6).map((item) => recommendationCard(item)).join('')}
    </div>`;
}

function renderAdsTable(items) {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>搜索词 / 活动</th><th>SKU</th><th>点击</th><th>花费</th><th>广告销售</th><th>订单</th><th>ACOS</th><th>CVR</th><th>建议</th><th></th></tr></thead><tbody>
    ${items.map((item) => `<tr><td><strong>${h(item.search_term)}</strong><small class="cell-note">${h(item.campaign)} · ${h(item.match_type)}</small></td><td>${h(item.sku)}</td><td>${number(item.clicks)}</td><td>${money(item.spend)}</td><td>${money(item.ad_sales)}</td><td>${number(item.ad_orders)}</td><td>${item.acos_percent}%</td><td>${item.cvr_percent}%</td><td>${recommendationBadge(item)}</td><td><button class="icon-button small" data-action="create-ad-action" data-id="${item.id}" title="创建动作">${icon('plus', 15)}</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderInventory() {
  const data = state.inventory;
  const s = data.summary;
  app.innerHTML = `
    ${viewHead('库存与履约', '以可售天数、采购交期和安全库存计算补货量，同时识别 FBA 在途、订单、退货和异常履约。', `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}刷新库存动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('alert', '缺货风险', `${s.stockout} 个 SKU`, '低于采购交期 + 14 天', null, 'red')}
      ${metricCard('inventory', '滞销风险', `${s.overstock} 个 SKU`, '可售天数高于 90 天', null, 'amber')}
      ${metricCard('check', '库存健康', `${s.healthy} 个 SKU`, '覆盖率处于安全区间', null, 'green')}
      ${metricCard('truck', '建议补货', `${number(s.reorderUnits)} 件`, '按当前日均销量测算', null, 'accent')}
    </div>
    <div class="cp-risk-summary">
      ${data.items.filter((item) => item.risk !== 'healthy').map((item) => `<article class="cp-risk-card ${item.risk}"><span>${h(item.risk_label)}</span><strong>${h(item.sku)}</strong><p>覆盖 ${item.coverage_days} 天 · 可售 ${number(item.available)} 件 · 在途 ${number(item.inbound)} 件</p><small>${h(item.note || item.recommended_order_date)}</small></article>`).join('')}
    </div>
    <section class="panel">
      <div class="panel-head"><div><span class="panel-kicker">inventory coverage</span><h3>补货与库存覆盖</h3></div><span class="muted">可售天数 = (可售 + 在途) ÷ 日均销量</span></div>
      ${renderInventoryTable(data.items)}
    </section>`;
}

function renderInventoryTable(items) {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>SKU / 商品</th><th>可售</th><th>在途</th><th>预留</th><th>日均销量</th><th>可售天数</th><th>覆盖天数</th><th>建议补货</th><th>风险</th><th>动作</th></tr></thead><tbody>
    ${items.map((item) => `<tr><td><strong>${h(item.sku)}</strong><small class="cell-note">${h(item.product_title)}</small></td><td>${number(item.available)}</td><td>${number(item.inbound)}</td><td>${number(item.reserved)}</td><td>${item.avg_daily_sales}</td><td>${item.available_days} 天</td><td>${item.coverage_days} 天</td><td>${number(item.reorder_units)} 件</td><td><span class="badge status-${item.risk === 'healthy' ? 'healthy' : item.risk === 'stockout' ? 'failed' : 'warning'}">${h(item.risk_label)}</span></td><td><button class="button secondary cp-table-button" data-action="create-inventory-action" data-id="${item.id}">${icon('plus', 14)}建动作</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderAfterSales() {
  const data = state.afterSales;
  const store = data.store;
  const s = data.summary;
  app.innerHTML = `
    ${viewHead('售后与账号', '把差评、退货、买家消息、索赔、订单缺陷、迟发和取消率放在同一条时间线上，并跟踪账号健康阈值。', `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}刷新预警动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('message', '待处理售后', `${s.open} 项`, '含消息、退货和索赔', null, s.open ? 'amber' : 'green')}
      ${metricCard('clock', '超时事项', `${s.overdue} 项`, '超过处理 SLA', null, s.overdue ? 'red' : 'green')}
      ${metricCard('alert', '紧急事项', `${s.critical} 项`, 'P0 需要当天处理', null, s.critical ? 'red' : 'green')}
      ${metricCard('reviews', '退货类问题', `${s.returns} 项`, '关联 SKU 与原因', null, 'accent')}
    </div>
    <section class="panel cp-health-panel">
      <div class="panel-head"><div><span class="panel-kicker">account health</span><h3>店铺健康阈值</h3></div><span class="badge status-${h(store.health_status)}">${h(STATUS_LABELS[store.health_status] || store.health_status)}</span></div>
      <div class="cp-health-grid">${store.health_metrics.map((item) => `<div class="cp-health-card ${item.status}"><div class="cp-health-icon">${icon(item.status === 'healthy' ? 'check' : 'alert')}</div><span>${h(item.label)}</span><strong>${item.key === 'rating' ? item.value : `${item.value}%`}</strong><small>阈值：${item.key === 'rating' ? `≥ ${item.threshold}` : `≤ ${item.threshold}%`}</small></div>`).join('')}</div>
    </section>
    <div class="cp-aftersales-layout">
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">case timeline</span><h3>售后问题时间线</h3></div><span class="muted">${data.items.length} 个事项</span></div>
        <div class="cp-case-timeline">${data.items.map(afterSaleRow).join('')}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">return reasons</span><h3>退货与差评原因</h3></div><span class="muted">按问题类型聚合</span></div>
        ${renderReturnReasons(data.items)}
      </section>
    </div>`;
}

function renderReturnReasons(items) {
  const grouped = new Map();
  for (const item of items) {
    const key = item.reason || item.type;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  }
  const max = Math.max(1, ...grouped.values());
  return `<div class="cp-reason-list">${[...grouped.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => `<div><div><strong>${h(reason)}</strong><span>${count} 项</span></div><div class="progress-track"><span style="width:${(count / max) * 100}%"></span></div></div>`).join('')}</div>`;
}

function renderReviews() {
  const data = state.overview;
  const k = data.kpis;
  app.innerHTML = `
    ${viewHead('运营复盘', '按周期汇总指标、异常、动作结果和未关闭事项，并导出 HTML、Markdown、CSV 或 XLSX 复盘报告。', `
      <button class="button secondary" data-action="new-knowledge">${icon('plus')}沉淀复盘文章</button>`)}
    <div class="cp-tabs">
      <button class="${state.reviewTab === 'reports' ? 'is-active' : ''}" data-action="set-review-tab" data-tab="reports">${icon('file')}周期报告</button>
      <button class="${state.reviewTab === 'knowledge' ? 'is-active' : ''}" data-action="set-review-tab" data-tab="knowledge">${icon('book')}运营知识库</button>
    </div>
    ${state.reviewTab === 'reports' ? renderReportsTab(data, k) : renderKnowledgeTab()}`;
}

function renderReportsTab(data, k) {
  return `
    <section class="panel cp-report-hero">
      <div>
        <span class="panel-kicker">period review</span>
        <h2>${h(data.store.name)} · 近 30 天运营复盘</h2>
        <p>报告包含 Summary、SKU、Ads、Inventory、After-sales 五个工作表，敏感字段在导出前统一脱敏。</p>
      </div>
      <div class="cp-report-actions">
        <a class="button primary" href="/api/reports/operations/${state.storeId}?format=xlsx">${icon('download')}导出 XLSX</a>
        <a class="button secondary" href="/api/reports/operations/${state.storeId}?format=html">${icon('file')}HTML</a>
        <a class="button secondary" href="/api/reports/operations/${state.storeId}?format=md">${icon('file')}Markdown</a>
        <a class="button secondary" href="/api/reports/operations/${state.storeId}?format=csv">${icon('file')}CSV</a>
      </div>
    </section>
    <div class="metric-grid cp-metric-grid">
      ${metricCard('chart', '净销售额', money(k.netSales, data.store.currency), '近 30 天', null, 'accent')}
      ${metricCard('target', '净利润', money(k.profit, data.store.currency), `净利率 ${k.margin}%`, null, k.margin < 10 ? 'amber' : 'green')}
      ${metricCard('ads', 'ACOS / TACOS', `${k.acos}% / ${k.tacos}%`, `ROAS ${k.roas}x`, null, 'accent')}
      ${metricCard('check', '动作完成', `${data.actionBreakdown.done} 项`, `${data.actionBreakdown.critical + data.actionBreakdown.high} 项高优先级未关闭`, null, data.actionBreakdown.critical ? 'amber' : 'green')}
    </div>
    <div class="cp-review-grid">
      <section class="panel"><div class="panel-head"><div><span class="panel-kicker">what happened</span><h3>本周期摘要</h3></div></div><div class="cp-review-copy"><p><strong>经营表现：</strong>净销售 ${money(k.netSales, data.store.currency)}，净利率 ${k.margin}%，平均评分 ${k.rating}。</p><p><strong>主要风险：</strong>${k.inventoryRiskCount} 个 SKU 存在库存风险，${k.lowMarginProducts} 个 SKU 净利率低于 10%，${k.pendingAfterSales} 个售后事项待处理。</p><p><strong>执行情况：</strong>${data.actionBreakdown.done} 项动作已完成，${data.actionBreakdown.critical} 项 P0 与 ${data.actionBreakdown.high} 项 P1 动作仍需跟进。</p></div></section>
      <section class="panel"><div class="panel-head"><div><span class="panel-kicker">next actions</span><h3>未关闭事项</h3></div></div><div class="cp-action-list">${state.actions.filter((item) => !isClosedAction(item.status)).slice(0, 5).map(actionCompact).join('') || emptyBlock('没有未关闭动作', '本周期执行闭环已完成。')}</div></section>
    </div>`;
}

function renderKnowledgeTab() {
  return `
    <section class="panel cp-knowledge-panel">
      <div class="panel-head"><div><span class="panel-kicker">operations playbook</span><h3>运营知识库</h3></div><form id="knowledge-search-form" class="cp-search-form compact"><input name="q" value="${escapeAttr(state.knowledgeQuery)}" placeholder="搜索 ACOS、库存、Listing"><button class="icon-button" type="submit">${icon('search')}</button></form></div>
      <div class="knowledge-grid">${state.knowledge.map((item) => `<article class="knowledge-card"><span class="project-kicker">${h(item.category)}</span><h3>${h(item.title)}</h3><p>${h(item.symptom)}</p><div class="cp-knowledge-meta"><span>${h(item.tags)}</span><small>${number(item.views)} 次查看</small></div><button class="text-button" data-action="open-knowledge" data-id="${item.id}">查看方法 ${icon('arrow')}</button></article>`).join('')}</div>
    </section>`;
}

function viewHead(title, description, actions = '') {
  return `<div class="view-head"><div><span class="project-kicker">CrossPilot operations</span><h2>${h(title)}</h2><p>${h(description)}</p></div><div class="head-actions">${actions}</div></div>`;
}

function metricCard(iconName, label, value, note, nav, color = 'accent') {
  const palette = {
    accent: ['#72ddf7', 'rgba(114,221,247,.12)'],
    green: ['#78e6c4', 'rgba(120,230,196,.12)'],
    amber: ['#f5c66d', 'rgba(245,198,109,.12)'],
    red: ['#ff9d8d', 'rgba(255,157,141,.12)']
  }[color] || ['#72ddf7', 'rgba(114,221,247,.12)'];
  return `<article class="metric-card" ${nav ? `data-nav="${nav}" role="button" tabindex="0"` : ''} style="--metric-color:${palette[0]};--metric-soft:${palette[1]}"><span class="metric-icon">${icon(iconName)}</span><div><span>${h(label)}</span><strong>${h(value)}</strong><small>${h(note)}</small></div></article>`;
}

function renderTrendChart(trend, currency) {
  if (!trend.length) return emptyBlock('暂无趋势数据', '导入每日指标后显示趋势。');
  const width = 720;
  const height = 220;
  const padding = 28;
  const sales = trend.map((item) => Number(item.sales || 0));
  const profit = trend.map((item) => Number(item.profit || 0));
  const max = Math.max(...sales, ...profit, 1);
  const min = Math.min(0, ...profit);
  const range = max - min || 1;
  const x = (index) => padding + index * ((width - padding * 2) / Math.max(1, trend.length - 1));
  const y = (value) => height - padding - ((value - min) / range) * (height - padding * 2);
  const salesPoints = trend.map((item, index) => `${x(index)},${y(item.sales)}`).join(' ');
  const profitPoints = trend.map((item, index) => `${x(index)},${y(item.profit)}`).join(' ');
  const area = `${padding},${height - padding} ${salesPoints} ${x(trend.length - 1)},${height - padding}`;
  return `<div class="cp-chart-wrap"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="销售与利润趋势"><defs><linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#72ddf7" stop-opacity=".28"/><stop offset="1" stop-color="#72ddf7" stop-opacity="0"/></linearGradient></defs>${[0, 1, 2, 3].map((index) => `<line x1="${padding}" y1="${padding + index * ((height - padding * 2) / 3)}" x2="${width - padding}" y2="${padding + index * ((height - padding * 2) / 3)}" class="cp-grid-line"/>`).join('')}<polygon points="${area}" fill="url(#sales-fill)"/><polyline points="${salesPoints}" class="cp-line sales"/><polyline points="${profitPoints}" class="cp-line profit"/>${trend.map((item, index) => index % 3 === 0 ? `<text x="${x(index)}" y="${height - 7}" class="cp-axis-label">${h(item.metric_date.slice(5))}</text>` : '').join('')}</svg><div class="cp-chart-legend"><span><i class="sales"></i>销售</span><span><i class="profit"></i>估算利润</span><strong>单位：${h(currency)}</strong></div></div>`;
}

function renderRiskProducts(products, currency) {
  return `<div class="cp-risk-list">${products.map((item) => `<button type="button" data-action="open-product" data-id="${item.id}"><span class="badge ${item.net_profit_30d < 0 ? 'status-failed' : item.margin_percent < 10 ? 'status-warning' : 'status-healthy'}">${item.net_profit_30d < 0 ? '亏损' : `${item.margin_percent}%`}</span><div><strong>${h(item.sku)}</strong><p>${h(item.title)}</p></div><small>${money(item.net_profit_30d, currency)}</small></button>`).join('')}</div>`;
}

function actionCompact(item) {
  return `<article class="cp-action-item"><span class="cp-priority priority-${h(item.priority)}">${h(PRIORITY_LABELS[item.priority] || item.priority)}</span><div><strong>${h(item.title)}</strong><p>${h(item.category)} · ${h(item.owner || '待分配')} · ${h(item.due_date || '未设截止')}</p></div><div class="cp-action-buttons"><button class="icon-button small" data-action="manage-action" data-id="${item.id}" title="查看或更新动作">${icon('edit', 14)}</button><button class="icon-button small" data-action="complete-action" data-id="${item.id}" title="快速完成">${icon('check', 14)}</button></div></article>`;
}

function healthRow(item) {
  return `<div class="cp-health-row"><span class="cp-health-dot ${h(item.status)}"></span><div><strong>${h(item.label)}</strong><small>阈值 ${item.comparator === 'below' ? '≥' : '≤'} ${item.threshold}${item.key === 'rating' ? '' : '%'}</small></div><strong>${item.key === 'rating' ? item.value : `${item.value}%`}</strong><span class="badge status-${h(item.status)}">${item.status === 'healthy' ? '正常' : '预警'}</span></div>`;
}

function recommendationBadge(item) {
  const classes = { negative_exact: 'failed', pause: 'failed', reduce: 'warning', scale: 'healthy', keep: 'healthy' };
  return `<span class="badge status-${classes[item.recommendation] || 'healthy'}">${h(item.action_label)}</span>`;
}

function recommendationCard(item) {
  return `<article class="cp-recommendation-card"><span class="badge status-${item.recommendation === 'scale' ? 'healthy' : item.recommendation === 'negative_exact' || item.recommendation === 'pause' ? 'failed' : 'warning'}">${h(item.action_label)}</span><h3>${h(item.search_term)}</h3><p>${h(item.campaign)} · ${number(item.clicks)} 次点击 · ${money(item.spend)} 花费 · ACOS ${item.acos_percent}%</p><button class="button secondary" data-action="create-ad-action" data-id="${item.id}">${icon('plus')}创建动作</button></article>`;
}

function afterSaleRow(item) {
  const priorityClass = item.priority === 'critical' ? 'failed' : item.priority === 'high' ? 'warning' : 'healthy';
  return `<article class="cp-case-row"><div class="cp-case-marker ${h(item.sla)}">${icon(item.sla === 'overdue' ? 'alert' : 'message', 16)}</div><div><div class="cp-case-head"><span>${h(item.case_no)} · ${h(item.type)}</span><span class="badge status-${priorityClass}">${h(PRIORITY_LABELS[item.priority] || item.priority)}</span></div><strong>${h(item.subject)}</strong><p>${h(item.detail)}</p><small>${h(item.sku || '无 SKU')} · ${h(item.reason || '待补充原因')} · ${h(item.owner || '待分配')}</small></div><div class="cp-case-side"><span class="badge status-${h(item.status)}">${h(STATUS_LABELS[item.status] || item.status)}</span><small class="${item.sla === 'overdue' ? 'cp-danger-text' : ''}">${h(item.sla_label)} · ${h(item.due_date || '无截止')}</small></div></article>`;
}

function miniStat(label, value, color = '') {
  return `<div class="${color ? `is-${color}` : ''}"><span>${h(label)}</span><strong>${h(value)}</strong></div>`;
}

function statusBadge(status) {
  const color = status === 'committed' ? 'healthy' : status === 'cancelled' ? 'archived' : status === 'preview' ? 'warning' : 'pending';
  return `<span class="badge status-${color}">${h(STATUS_LABELS[status] || status)}</span>`;
}

function renderStoreSwitcher() {
  storeSelect.innerHTML = state.stores.map((store) => `<option value="${store.id}" ${store.id === state.storeId ? 'selected' : ''}>${h(store.platform)} · ${h(store.name)}</option>`).join('') || '<option value="">暂无店铺</option>';
}

function renderShellSidebars() {
  const store = state.stores.find((item) => item.id === state.storeId);
  if (!store) return;
  const overview = state.overview;
  const openActions = state.actions.filter((item) => !isClosedAction(item.status));
  const health = store.health_metrics || [];
  const healthWarnings = health.filter((item) => item.status === 'warning').length;
  shellLeft.innerHTML = `
    <section class="aside-section aside-project">
      <div class="aside-section-head"><span>当前店铺</span><small>${h(store.code)}</small></div>
      <h2>${h(store.name)}</h2>
      <p>${h(store.platform)} · ${h(store.market)} · ${h(store.currency)}</p>
      <dl class="aside-facts">
        <div><dt>目标 ACOS</dt><dd>${store.target_acos}%</dd></div>
        <div><dt>目标净利率</dt><dd>${store.target_margin}%</dd></div>
        <div><dt>采购交期</dt><dd>${store.lead_time_days} 天</dd></div>
      </dl>
    </section>
    <section class="aside-section">
      <div class="aside-section-head"><span>账号健康</span><strong>${healthWarnings ? `${healthWarnings} 项预警` : '正常'}</strong></div>
      <div class="aside-progress"><i style="width:${healthWarnings ? 42 : 100}%"></i></div>
      <div class="aside-progress-meta"><span>评分 ${store.health_rating}</span><span>ODR ${store.order_defect_rate}%</span></div>
    </section>`;
  shellRight.innerHTML = `
    <section class="aside-section">
      <div class="aside-section-head"><span>运营状态</span><small>实时</small></div>
      <div class="aside-status-list">
        <div><span><i class="aside-status-dot"></i>规则引擎</span><strong>正常</strong></div>
        <div><span>待执行动作</span><strong>${openActions.length}</strong></div>
        <div><span>库存风险</span><strong>${overview?.kpis?.inventoryRiskCount ?? '-'}</strong></div>
        <div><span>待处理售后</span><strong>${overview?.kpis?.pendingAfterSales ?? '-'}</strong></div>
      </div>
    </section>
    <section class="aside-section">
      <div class="aside-section-head"><span>快捷入口</span></div>
      <div class="aside-links">
        <button data-nav="imports">${icon('imports')}<span>导入报表</span></button>
        <button data-nav="ads">${icon('ads')}<span>广告决策</span></button>
        <button data-nav="inventory">${icon('inventory')}<span>库存补货</span></button>
        <button data-nav="reviews">${icon('reviews')}<span>运营复盘</span></button>
      </div>
    </section>
    <section class="aside-section aside-focus">
      <div class="aside-section-head"><span>下一项动作</span></div>
      <strong>${h(openActions[0]?.title || '等待规则引擎刷新')}</strong>
      <p>${h(openActions[0]?.description || '当前没有未关闭的运营异常。')}</p>
      ${openActions[0] ? `<button class="text-button" data-action="manage-action" data-id="${openActions[0].id}">处理动作 ${icon('arrow')}</button>` : ''}
    </section>`;
}

async function handleClick(event) {
  const nav = event.target.closest('[data-nav]');
  const explicitAction = event.target.closest('[data-action]');
  if (nav) return navigate(nav.dataset.nav);
  if (!explicitAction) return;
  const { action, id, tab } = explicitAction.dataset;
  try {
    if (action === 'close-modal') closeModal();
    if (action === 'set-review-tab') {
      state.reviewTab = tab;
      renderReviews();
    }
    if (action === 'select-product') {
      state.selectedProductId = Number(id);
      renderListings();
    }
    if (action === 'open-product') {
      state.selectedProductId = Number(id);
      await navigate('listings');
    }
    if (action === 'listing-package') {
      const data = await api(`/api/products/${id}/listing-package`);
      openModal({ title: `${data.product.sku} · 上新资料包`, wide: true, content: renderListingPackage(data) });
    }
    if (action === 'create-listing-action') {
      const product = state.products.find((item) => item.id === Number(id));
      await api('/api/actions', { method: 'POST', body: { storeId: state.storeId, productId: id, category: 'Listing', title: `优化 ${product?.sku || ''} 的 Listing 内容`, description: `当前 Listing 得分 ${product?.listing_score || 0}/100，优先补齐薄弱维度。`, priority: 'medium', recommendation: 'manual_listing' } });
      showToast('Listing 优化动作已创建');
      await loadListings();
    }
    if (action === 'create-ad-action') {
      const item = state.ads.items.find((row) => row.id === Number(id));
      await api('/api/actions', { method: 'POST', body: { storeId: state.storeId, productId: item.product_id, category: '广告', title: `${item.action_label}：${item.search_term}`, description: `${item.campaign} · ACOS ${item.acos_percent}% · ${item.clicks} 次点击`, priority: item.recommendation === 'negative_exact' || item.recommendation === 'pause' ? 'high' : 'medium', recommendation: item.recommendation } });
      showToast('广告动作已进入执行队列');
      await loadAds();
    }
    if (action === 'create-inventory-action') {
      const item = state.inventory.items.find((row) => row.id === Number(id));
      await api('/api/actions', { method: 'POST', body: { storeId: state.storeId, productId: item.product_id, category: '库存', title: `${item.risk_label}：${item.sku}`, description: `覆盖 ${item.coverage_days} 天，建议补货 ${item.reorder_units} 件。`, priority: item.risk === 'stockout' ? 'high' : 'medium', recommendation: item.risk } });
      showToast('库存动作已创建');
      await loadInventory();
    }
    if (action === 'refresh-actions') await refreshActions();
    if (action === 'new-action') openActionModal();
    if (action === 'manage-action' || action === 'open-action') {
      const item = await api(`/api/actions/${id}`);
      openActionModal(item);
    }
    if (action === 'complete-action') {
      await api(`/api/actions/${id}`, { method: 'PATCH', body: { status: 'done', result: '执行完成，证据待补充。', evidence: '演示页快速完成' } });
      showToast('动作已完成并回写复盘数据');
      await loadCurrentView(true);
    }
    if (action === 'apply-mapping') await applyImportMapping(Number(id));
    if (action === 'commit-import') {
      await api(`/api/imports/${id}/commit`, { method: 'POST', body: {} });
      state.pendingImport = null;
      showToast('报表已确认入库，运营动作已重新计算');
      await loadImports();
    }
    if (action === 'cancel-import') {
      await api(`/api/imports/${id}/cancel`, { method: 'POST', body: {} });
      state.pendingImport = null;
      showToast('导入批次已取消', 'warning');
      await loadImports();
    }
    if (action === 'reset-import') {
      state.pendingImport = null;
      renderImports();
    }
    if (action === 'open-import') {
      state.pendingImport = await api(`/api/imports/${id}`);
      renderImports();
    }
    if (action === 'open-knowledge') {
      const article = await api(`/api/knowledge/${id}`);
      openModal({ title: article.title, wide: true, content: `<div class="article-detail"><div class="article-meta"><span>${h(article.category)}</span><small>${number(article.views)} 次查看 · ${formatDateTime(article.created_at)}</small></div><section><h4>问题现象</h4><p>${h(article.symptom)}</p></section><section><h4>解决方案</h4><p class="pre-line">${h(article.solution)}</p></section><div class="tag-row">${String(article.tags || '').split(',').filter(Boolean).map((tag) => `<span>${h(tag.trim())}</span>`).join('')}</div></div>` });
    }
    if (action === 'new-knowledge') openKnowledgeModal();
    if (action === 'refresh') await loadCurrentView(true);
  } catch (error) {
    showError(error);
  }
}

async function handleSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    if (form.id === 'action-form') {
      await api(data.id ? `/api/actions/${data.id}` : '/api/actions', {
        method: data.id ? 'PATCH' : 'POST',
        body: { ...data, storeId: state.storeId, productId: data.productId || null }
      });
      closeModal();
      showToast(data.id ? '动作已更新并记录时间线' : '运营动作已创建');
      await loadCurrentView(true);
    }
    if (form.id === 'knowledge-form') {
      await api('/api/knowledge', { method: 'POST', body: data });
      closeModal();
      showToast('复盘方法已沉淀到知识库');
      state.reviewTab = 'knowledge';
      await loadReviews();
    }
    if (form.id === 'product-search-form') {
      state.productQuery = String(data.q || '').trim();
      renderListings();
    }
    if (form.id === 'knowledge-search-form') {
      state.knowledgeQuery = String(data.q || '').trim();
      await loadReviews();
    }
  } catch (error) {
    showError(error);
  }
}

async function handleChange(event) {
  if (event.target.id !== 'import-file') return;
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    await previewImport(file);
  } catch (error) {
    showError(error);
  } finally {
    event.target.value = '';
  }
}

function handleDragOver(event) {
  if (!event.target.closest('[data-drop-zone]')) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

async function handleDrop(event) {
  const zone = event.target.closest('[data-drop-zone]');
  if (!zone) return;
  event.preventDefault();
  const file = event.dataTransfer.files?.[0];
  if (!file) return;
  try {
    await previewImport(file);
  } catch (error) {
    showError(error);
  }
}

async function previewImport(file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('文件不能超过 10 MB');
  app.querySelector('.cp-import-preview')?.classList.add('is-loading');
  showToast('正在识别报表和字段映射', 'warning');
  const contentBase64 = await fileToBase64(file);
  state.pendingImport = await api('/api/imports/preview', {
    method: 'POST',
    body: { storeId: state.storeId, filename: file.name, contentBase64, reportType: 'auto' }
  });
  showToast(`识别为${reportTypeLabel(state.pendingImport.report_type)}，已跳过 ${state.pendingImport.pii_columns.length} 个 PII 字段`);
  renderImports();
}

async function applyImportMapping(batchId) {
  const mapping = {};
  document.querySelectorAll('[data-mapping-source]').forEach((select) => {
    if (select.value) mapping[select.dataset.mappingSource] = select.value;
  });
  state.pendingImport = await api(`/api/imports/${batchId}/mapping`, { method: 'PATCH', body: { mapping } });
  showToast('字段映射已重新校验');
  renderImports();
}

async function refreshActions() {
  const result = await api('/api/actions/refresh', { method: 'POST', body: { storeId: state.storeId } });
  state.actions = result.items;
  showToast(`规则引擎已刷新，共 ${result.items.filter((item) => !isClosedAction(item.status)).length} 项待执行`);
  if (state.view === 'overview' || state.view === 'reviews') await loadCurrentView();
  else renderShellSidebars();
}

function openActionModal(item = null) {
  openModal({
    title: item ? '处理运营动作' : '新增运营动作',
    wide: true,
    content: `<form id="action-form" class="form-grid">
      <input type="hidden" name="id" value="${item?.id || ''}">
      ${field('动作标题 *', `<input name="title" required value="${escapeAttr(item?.title || '')}" ${item ? 'readonly' : ''} placeholder="例如：暂停无效搜索词">`)}
      ${field('模块', `<select name="category">${options({ 广告: '广告', 库存: '库存', Listing: 'Listing', 利润: '利润', 售后: '售后', 运营: '运营' }, item?.category || '运营')}</select>`)}
      ${field('优先级', `<select name="priority">${options({ critical: 'P0 紧急', high: 'P1 高', medium: 'P2 中', low: 'P3 低' }, item?.priority || 'medium')}</select>`)}
      ${field('状态', `<select name="status">${options({ open: '待处理', in_progress: '处理中', deferred: '已延期', done: '已完成', closed: '已关闭', ignored: '已忽略' }, item?.status || 'open')}</select>`)}
      ${field('负责人', `<input name="owner" value="${escapeAttr(item?.owner || '')}" placeholder="例如：运营-林">`)}
      ${field('截止日期', `<input type="date" name="dueDate" value="${escapeAttr(item?.due_date || today())}">`)}
      ${field('执行结果', `<textarea name="result" rows="3" placeholder="记录处理结果和指标变化">${h(item?.result || '')}</textarea>`, true)}
      ${field('执行证据', `<textarea name="evidence" rows="3" placeholder="例如：否词截图、补货单号、Listing 修改前后截图">${h(item?.evidence || '')}</textarea>`, true)}
      <p class="form-note span-2">保存后会自动写入动作时间线，并回写到运营复盘和报告摘要。</p>
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">${item ? '保存执行结果' : '创建动作'}</button></div>
    </form>`
  });
}

function openKnowledgeModal() {
  openModal({
    title: '沉淀运营方法',
    wide: true,
    content: `<form id="knowledge-form" class="form-grid">
      ${field('标题 *', '<input name="title" required placeholder="例如：欧洲站高退货产品的三步复盘法">')}
      ${field('分类', `<select name="category">${options({ 运营复盘: '运营复盘', 广告: '广告', 库存: '库存', Listing: 'Listing', 售后: '售后', 数据: '数据' }, '运营复盘')}</select>`)}
      ${field('问题现象 *', '<textarea name="symptom" rows="3" required placeholder="说明在什么情况下触发该方法"></textarea>', true)}
      ${field('解决方案 *', '<textarea name="solution" rows="7" required placeholder="按判断标准、执行步骤、结果验证的顺序记录"></textarea>', true)}
      ${field('标签', '<input name="tags" placeholder="用逗号分隔，例如：ACOS,否词,利润">', true)}
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存文章</button></div>
    </form>`
  });
}

function renderListingPackage(data) {
  return `<div class="cp-package">
    <div class="cp-package-head"><div><span>${h(data.product.sku)} · ${data.score}/100</span><h3>${h(data.product.title)}</h3></div><span class="safe-chip">模拟数据</span></div>
    <section><h4>建议标题</h4><p class="cp-code-block">${h(data.titleSuggestion)}</p></section>
    <section><h4>五点文案骨架</h4><ol>${data.bullets.map((item) => `<li>${h(item)}</li>`).join('')}</ol></section>
    <section><h4>图片需求清单</h4><ul>${data.imageRequirements.map((item) => `<li>${h(item)}</li>`).join('')}</ul></section>
    <section><h4>关键词分组</h4><div class="cp-keyword-grid">${data.keywordClusters.map((group) => `<div><strong>${h(group.cluster)}</strong><p>${group.terms.map(h).join(' · ')}</p></div>`).join('')}</div></section>
    <section><h4>优先改进</h4><ul>${data.priorityActions.map((item) => `<li>${h(item)}</li>`).join('')}</ul></section>
  </div>`;
}

function openModal({ title, content, wide = false }) {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal">
    <section class="modal-card ${wide ? 'is-wide' : ''}" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}" data-modal-content>
      <header><div><span>CrossPilot</span><h2>${h(title)}</h2></div><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('x')}</button></header>
      <div class="modal-body">${content}</div>
    </section>
  </div>`;
}

function closeModal() {
  modalRoot.innerHTML = '';
}

async function navigate(view) {
  if (!VIEW_META[view]) return;
  state.view = view;
  window.location.hash = view;
  updateViewChrome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await loadCurrentView();
}

function updateViewChrome() {
  const meta = VIEW_META[state.view];
  pageTitle.textContent = meta.title;
  pageEyebrow.textContent = meta.eyebrow;
  document.querySelectorAll('[data-nav]').forEach((button) => button.classList.toggle('is-active', button.dataset.nav === state.view));
}

function initHeroTypewriter() {
  if (!heroTypewriter) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTypewriter.textContent = HERO_PHRASES[0];
    return;
  }
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  const step = () => {
    const phrase = HERO_PHRASES[phraseIndex];
    if (!deleting) {
      characterIndex += 1;
      heroTypewriter.textContent = phrase.slice(0, characterIndex);
      if (characterIndex === phrase.length) {
        deleting = true;
        window.setTimeout(step, 1800);
      } else window.setTimeout(step, 72);
      return;
    }
    characterIndex -= 1;
    heroTypewriter.textContent = phrase.slice(0, characterIndex);
    if (characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % HERO_PHRASES.length;
      window.setTimeout(step, 420);
    } else window.setTimeout(step, 28);
  };
  window.setTimeout(step, 500);
}

async function checkHealth() {
  const apiStatus = document.querySelector('#api-status');
  try {
    await api('/api/health');
    apiStatus.classList.add('is-online');
  } catch {
    apiStatus.classList.add('is-error');
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `请求失败（${response.status}）`);
  return payload;
}

function field(label, control, span = false) {
  return `<label class="field ${span ? 'span-2' : ''}"><span>${label}</span>${control}</label>`;
}

function options(items, selected) {
  return Object.entries(items).map(([value, label]) => `<option value="${escapeAttr(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${h(label)}</option>`).join('');
}

function emptyBlock(title, message) {
  return `<div class="empty-block"><strong>${h(title)}</strong><span>${h(message)}</span></div>`;
}

function loadingTemplate(message) {
  return `<div class="loading-state"><span class="loading-ring"></span><strong>${h(message)}</strong></div>`;
}

function errorTemplate(message) {
  return `<div class="error-state">${icon('alert')}<h2>页面加载失败</h2><p>${h(message)}</p><button class="button primary" data-action="refresh">重新加载</button></div>`;
}

function icon(name, size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.overview}</svg>`;
}

function reportTypeLabel(value) {
  return { products: '商品表现', ads: '搜索词', inventory: '库存', after_sales: '退货/评论' }[value] || value;
}

function activityTitle(value) {
  return { import: '报表导入', import_preview: '导入预览', import_commit: '确认入库', import_cancel: '取消导入', action: '动作引擎', after_sale: '售后处理', report: '报告导出', create: '创建动作', update: '更新动作' }[value] || '运营动态';
}

function isClosedAction(status) {
  return ['done', 'closed', 'ignored'].includes(status);
}

function actionCloseRate(actions) {
  if (!actions.length) return 0;
  return Math.round((actions.filter((item) => isClosedAction(item.status)).length / actions.length) * 100);
}

function money(value, currency = '€') {
  return `${currency || ''} ${Number(value || 0).toFixed(2)}`.trim();
}

function number(value) {
  return new Intl.NumberFormat('zh-CN').format(Number(value) || 0);
}

function relativeTime(value) {
  if (!value) return '-';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '-';
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function shortDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function h(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return h(value).replaceAll('`', '&#096;');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function showError(error) {
  showToast(error.message || '操作失败', 'error');
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result).split(',')[1] || ''));
    reader.addEventListener('error', () => reject(new Error('文件读取失败')));
    reader.readAsDataURL(file);
  });
}

function readFontMode() {
  try {
    return localStorage.getItem('opsflow-font-mode') === 'original' ? 'original' : 'literary';
  } catch {
    return 'literary';
  }
}

function applyFontMode(mode) {
  const nextMode = mode === 'original' ? 'original' : 'literary';
  document.documentElement.dataset.fontMode = nextMode;
  try {
    localStorage.setItem('opsflow-font-mode', nextMode);
  } catch {}
  if (fontToggle) {
    fontToggle.title = nextMode === 'literary' ? '当前：文艺字体，点击切换原版字体' : '当前：原版字体，点击切换文艺字体';
    fontToggle.setAttribute('aria-pressed', String(nextMode === 'original'));
  }
  return nextMode;
}

function initFontToggle() {
  if (!fontToggle) return;
  fontToggle.addEventListener('click', () => applyFontMode(readFontMode() === 'literary' ? 'original' : 'literary'));
}

function initSakura() {
  const layer = document.querySelector('#sakura-layer');
  if (!layer || layer.childElementCount) return;
  layer.innerHTML = Array.from({ length: 28 }, (_, index) => {
    const left = (index * 37 + 9) % 100;
    const size = 7 + ((index * 5) % 7);
    const drift = 24 + ((index * 29) % 72);
    const duration = 13 + ((index * 7) % 12);
    const delay = -((index * 11) % 19);
    return `<span class="sakura-petal" style="--left:${left}%;--size:${size}px;--drift:${drift}px;--duration:${duration}s;--delay:${delay}s"></span>`;
  }).join('');
}

function initAppHeader() {
  if (!appHeader || !navProgress) return;
  const scrollElement = document.scrollingElement || document.documentElement;
  let scheduled = false;
  const update = () => {
    const maxScroll = Math.max(0, scrollElement.scrollHeight - window.innerHeight);
    const progress = maxScroll ? Math.min(1, window.scrollY / maxScroll) : 0;
    appHeader.classList.toggle('is-scrolled', window.scrollY > 8);
    navProgress.style.transform = `scaleX(${progress})`;
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  const observer = new MutationObserver(update);
  observer.observe(app, { childList: true, subtree: true });
  update();
}
