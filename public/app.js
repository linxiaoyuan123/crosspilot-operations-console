const ICON_PATHS = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  tickets: '<path d="M16 12h1.5a1.5 1.5 0 0 0 0-3H16V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2h.5a1.5 1.5 0 0 1 0 3H2v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2Z"/><path d="M16 9V7a2 2 0 0 1 2-2h1a1 1 0 0 0 1-1V3"/>',
  deployments: '<path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M5 21h14"/><path d="M6 18h12a2 2 0 0 0 2-2V6l-3-3H7L4 6v10a2 2 0 0 0 2 2Z"/><path d="M4 6h16"/>',
  diagnostics: '<path d="M4.9 19.1A10 10 0 1 1 19.1 4.9"/><path d="m12 12 7-7"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/>',
  knowledge: '<path d="M2 4h6a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H2Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h6Z"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<circle cx="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  network: '<rect width="6" height="6" x="9" y="2" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="16" y="16" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
  clock: '<circle cx="12" r="10"/><path d="M12 6v6l4 2"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 11h8M8 15h6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>'
};

const VIEW_META = {
  dashboard: { title: '运行概览', loader: loadDashboard },
  tickets: { title: '工单中心', loader: loadTickets },
  deployments: { title: '实施交付', loader: loadDeployments },
  diagnostics: { title: '诊断工具', loader: loadDiagnostics },
  knowledge: { title: '知识库', loader: loadKnowledge }
};

const STATUS_META = {
  open: ['待处理', 'status-open'],
  in_progress: ['处理中', 'status-in_progress'],
  waiting: ['待客户', 'status-waiting'],
  resolved: ['已解决', 'status-resolved'],
  closed: ['已关闭', 'status-closed'],
  planning: ['规划中', 'status-planning'],
  deploying: ['部署中', 'status-deploying'],
  testing: ['验证中', 'status-testing'],
  live: ['已交付', 'status-live'],
  at_risk: ['有风险', 'status-at_risk'],
  healthy: ['正常', 'status-healthy'],
  warning: ['异常', 'status-warning'],
  failed: ['失败', 'status-failed']
};

const PRIORITY_META = {
  critical: ['P0 紧急', 'priority-critical'],
  high: ['P1 高', 'priority-high'],
  medium: ['P2 中', 'priority-medium'],
  low: ['P3 低', 'priority-low']
};

const state = {
  view: 'dashboard',
  filters: { status: '', priority: '', q: '' },
  knowledgeFilters: { category: '', q: '' }
};

const app = document.querySelector('#app');
const pageTitle = document.querySelector('#page-title');
const sidebar = document.querySelector('#sidebar');
const menuToggle = document.querySelector('#menu-toggle');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');

init();

function init() {
  document.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icon(element.dataset.icon);
  });

  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.nav));
  });

  document.querySelector('#refresh-button').addEventListener('click', () => loadCurrentView(true));
  menuToggle.addEventListener('click', toggleSidebar);
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('change', handleChange);
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeSidebar();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  const initialView = window.location.hash.replace('#', '');
  initVisualEffects();

  if (VIEW_META[initialView]) {
    state.view = initialView;
    pageTitle.textContent = VIEW_META[initialView].title;
    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.nav === initialView);
    });
  }

  checkHealth();
  loadCurrentView();
}

function initVisualEffects() {
  if (prefersReducedMotion()) return;
  initAmbientLayer();
  initScrollUX();
}

function initAmbientLayer() {
  let layer = document.querySelector('#ambient-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'ambient-layer';
    layer.className = 'ambient-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);
  }

  if (layer.childElementCount) return;
  const colors = ['rgba(114,221,255,.72)', 'rgba(126,231,199,.66)', 'rgba(255,213,128,.48)', 'rgba(255,157,141,.42)'];
  const count = window.innerWidth < 680 ? 14 : 28;
  const particles = Array.from({ length: count }, (_, index) => {
    const left = (index * 37 + 9) % 100;
    const size = 6 + ((index * 5) % 8);
    const drift = 22 + ((index * 29) % 74);
    const duration = 13 + ((index * 7) % 12);
    const delay = -((index * 11) % 19);
    const color = colors[index % colors.length];
    return `<span class="ambient-particle" style="--left:${left}%;--size:${size}px;--drift:${drift}px;--duration:${duration}s;--delay:${delay}s;--particle-color:${color}"></span>`;
  });
  layer.innerHTML = particles.join('');
}

function initScrollUX() {
  let progress = document.querySelector('#scroll-progress');
  if (!progress) {
    progress = document.createElement('div');
    progress.id = 'scroll-progress';
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);
  }

  let companion = document.querySelector('#scroll-companion');
  if (!companion) {
    companion = document.createElement('div');
    companion.id = 'scroll-companion';
    companion.className = 'scroll-companion';
    companion.innerHTML = `
      <div class="companion-rail"></div>
      <div class="companion-progress"></div>
      <div class="companion-rest"></div>
      <div class="companion-dot"></div>
      <button class="companion-node" type="button" aria-label="向下浏览一屏">
        <img class="companion-pig" src="/pig.png" alt="">
        <span class="companion-bubble">浏览 0%</span>
      </button>`;
    document.body.append(companion);
  }

  let backTop = document.querySelector('#back-to-top');
  if (!backTop) {
    backTop = document.createElement('button');
    backTop.id = 'back-to-top';
    backTop.className = 'back-to-top';
    backTop.type = 'button';
    backTop.title = '回到顶部';
    backTop.setAttribute('aria-label', '回到顶部');
    backTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5.25 14.75 6.75-6.75 6.75 6.75"></path></svg>';
    document.body.append(backTop);
  }

  const companionNode = companion.querySelector('.companion-node');
  const bubble = companion.querySelector('.companion-bubble');
  const rail = companion.querySelector('.companion-rail');
  const progressLine = companion.querySelector('.companion-progress');
  const restLine = companion.querySelector('.companion-rest');
  const dot = companion.querySelector('.companion-dot');
  const scrollContainer = document.querySelector('.content') || document.scrollingElement || document.documentElement;
  let scheduled = false;

  const update = () => {
    scheduled = false;
    const max = Math.max(scrollContainer.scrollHeight - scrollContainer.clientHeight, 0);
    const ratio = max > 0 ? Math.min(scrollContainer.scrollTop / max, 1) : 0;
    progress.style.width = `${ratio * 100}%`;
    companion.classList.toggle('is-visible', max > 1);

    const travel = Math.max((rail?.clientHeight || 0) - 2, 0);
    const travelTop = 8 + travel * ratio;
    companionNode.style.top = `${travelTop}px`;
    dot.style.top = `${travelTop}px`;
    progressLine.style.height = `${travel * ratio + 1}px`;
    restLine.style.top = `${travelTop}px`;
    bubble.textContent = `浏览 ${Math.round(ratio * 100)}%`;

    const shouldShow = ratio > 0.035;
    if (shouldShow && !backTop.classList.contains('is-visible')) {
      backTop.classList.remove('is-hiding', 'is-settled');
      void backTop.offsetWidth;
      backTop.classList.add('is-visible');
    }
    if (!shouldShow && backTop.classList.contains('is-visible')) {
      backTop.classList.remove('is-settled');
      backTop.classList.add('is-hiding');
    }
  };

  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  backTop.addEventListener('animationend', (event) => {
    if (event.animationName === 'back-top-throw') backTop.classList.add('is-settled');
    if (event.animationName === 'back-top-drop') backTop.classList.remove('is-visible', 'is-hiding', 'is-settled');
  });

  backTop.addEventListener('click', () => scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }));
  companionNode.addEventListener('click', () => scrollContainer.scrollBy({ top: Math.round(scrollContainer.clientHeight * 0.82), behavior: 'smooth' }));
  scrollContainer.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });

  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleUpdate).observe(app);
  }
  scheduleUpdate();
}

function animateMetrics(root) {
  if (prefersReducedMotion()) return;
  root.querySelectorAll('.metric-value').forEach((element) => {
    const target = Number(element.textContent.replaceAll(',', '').trim());
    if (!Number.isFinite(target)) return;
    const duration = 620;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = number(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function animateProgress(root) {
  if (prefersReducedMotion()) return;
  root.querySelectorAll('.progress-track > span').forEach((bar, index) => {
    const target = bar.style.width || '0%';
    bar.style.width = '0%';
    window.setTimeout(() => { bar.style.width = target; }, 110 + index * 65);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function navigate(view) {
  if (!VIEW_META[view]) return;
  state.view = view;
  pageTitle.textContent = VIEW_META[view].title;
  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.nav === view);
  });
  closeSidebar();
  loadCurrentView();
  history.replaceState(null, '', `#${view}`);
}

async function loadCurrentView(isRefresh = false) {
  const loader = VIEW_META[state.view].loader;
  if (!isRefresh) app.innerHTML = loadingTemplate();
  try {
    await loader();
    window.dispatchEvent(new Event('resize'));
  } catch (error) {
    app.innerHTML = errorTemplate(error.message);
  }
}

async function checkHealth() {
  const apiStatus = document.querySelector('#api-status');
  const sidebarDot = document.querySelector('#sidebar-status-dot');
  const sidebarLabel = document.querySelector('#sidebar-status-label');
  try {
    await api('/api/health');
    apiStatus.className = 'sync-state api-online';
    apiStatus.innerHTML = '<span class="status-dot"></span><span>API 正常</span>';
    sidebarDot.classList.add('is-online');
    sidebarLabel.textContent = '服务运行正常';
  } catch {
    apiStatus.className = 'sync-state api-offline';
    apiStatus.innerHTML = '<span class="status-dot"></span><span>API 离线</span>';
    sidebarDot.classList.add('is-offline');
    sidebarLabel.textContent = '服务不可用';
  }
}

async function loadDashboard() {
  const data = await api('/api/dashboard');
  app.innerHTML = `
    <section class="metric-grid" aria-label="关键指标">
      ${metricCard('active', '待处理工单', data.tickets.active, '含处理中与待客户确认', 'tickets', 'var(--red)', 'var(--red-soft)')}
      ${metricCard('resolved', '已解决工单', data.tickets.resolved, `共记录 ${data.tickets.total} 张工单`, 'check', 'var(--green)', 'var(--green-soft)')}
      ${metricCard('deploying', '实施项目', data.deployments.total, `平均进度 ${data.deployments.average_progress}%`, 'deployments', 'var(--blue)', '#e7efff')}
      ${metricCard('alert', '高风险事项', data.tickets.urgent + data.deployments.at_risk, '需要优先跟进', 'alert', 'var(--amber)', 'var(--amber-soft)')}
    </section>

    <div class="dashboard-grid">
      <div class="stack">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title"><strong>最近工单</strong><span>按最近更新时间排序</span></div>
            <button class="panel-link" type="button" data-nav="tickets">全部工单 ${icon('arrowRight', 13)}</button>
          </div>
          <div class="panel-body panel-body-flush">
            ${ticketTable(data.recentTickets, true)}
          </div>
        </section>
      </div>

      <div class="stack">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title"><strong>交付进度</strong><span>进行中的实施项目</span></div>
            <button class="panel-link" type="button" data-nav="deployments">查看项目 ${icon('arrowRight', 13)}</button>
          </div>
          <div class="panel-body">${deploymentList(data.deploymentsInFlight)}</div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title"><strong>最近动态</strong><span>系统操作与状态变化</span></div>
          </div>
          <div class="activity-list">${activityList(data.activities)}</div>
        </section>
      </div>
    </div>
  `;
  bindDataIcons();
  animateMetrics(app);
  animateProgress(app);
}

async function loadTickets() {
  const params = new URLSearchParams(cleanParams(state.filters));
  const { items } = await api(`/api/tickets?${params}`);
  app.innerHTML = `
    <div class="page-actions">
      <div class="page-actions-copy"><strong>服务工单</strong><span>统一记录客户问题、处理过程与解决结果</span></div>
      <button class="button button-primary" type="button" data-action="new-ticket">${icon('plus')}新建工单</button>
    </div>
    <form class="filter-bar" id="ticket-filter-form">
      <label class="field-search">${icon('search')}<input name="q" value="${escapeHtml(state.filters.q)}" placeholder="搜索工单号、标题、客户或负责人"></label>
      <select name="status" aria-label="工单状态">${options([['', '全部状态'], ['open', '待处理'], ['in_progress', '处理中'], ['waiting', '待客户'], ['resolved', '已解决'], ['closed', '已关闭']], state.filters.status)}</select>
      <select name="priority" aria-label="工单优先级">${options([['', '全部优先级'], ['critical', 'P0 紧急'], ['high', 'P1 高'], ['medium', 'P2 中'], ['low', 'P3 低']], state.filters.priority)}</select>
      <button class="button button-secondary" type="submit">${icon('search')}筛选</button>
    </form>
    <section class="panel">
      <div class="panel-body panel-body-flush">${ticketTable(items)}</div>
    </section>
  `;
  bindDataIcons();
}

async function loadDeployments() {
  const { items } = await api('/api/deployments');
  app.innerHTML = `
    <div class="page-actions">
      <div class="page-actions-copy"><strong>实施交付看板</strong><span>跟踪部署、联调、验收与上线状态</span></div>
      <button class="button button-primary" type="button" data-action="new-deployment">${icon('plus')}新建项目</button>
    </div>
    ${items.length ? `<section class="deployment-grid">${items.map(deploymentCard).join('')}</section>` : emptyState('暂无实施项目', '创建项目后，交付进度会显示在这里。')}
  `;
  bindDataIcons();
  animateProgress(app);
}

async function loadDiagnostics() {
  const [system, history] = await Promise.all([
    api('/api/diagnostics/system'),
    api('/api/diagnostics/history')
  ]);

  app.innerHTML = `
    <div class="diagnostics-grid">
      <div class="stack">
        <section class="panel">
          <div class="panel-header"><div class="panel-title"><strong>系统状态</strong><span>当前服务运行环境</span></div></div>
          <div class="system-grid">
            ${systemStat('主机名', system.hostname)}
            ${systemStat('操作系统', `${system.platform} ${system.release}`)}
            ${systemStat('CPU / 架构', `${system.cpuCount} cores · ${system.arch}`)}
            ${systemStat('Node.js', system.nodeVersion)}
            ${systemStat('主机运行时长', humanDuration(system.uptimeSeconds))}
            ${systemStat('进程 PID', system.pid)}
          </div>
          <div class="memory-block">
            <div class="memory-top"><span>内存使用率</span><strong>${system.memory.usedPercent}%</strong></div>
            <div class="progress-track"><span style="width:${system.memory.usedPercent}%"></span></div>
          </div>
          ${system.disk ? `<div class="memory-block" style="padding-top:0">
            <div class="memory-top"><span>磁盘 ${escapeHtml(system.disk.path)}</span><strong>${system.disk.usedPercent}%</strong></div>
            <div class="progress-track"><span style="width:${system.disk.usedPercent}%"></span></div>
          </div>` : ''}
        </section>

        <section class="panel">
          <div class="panel-header"><div class="panel-title"><strong>诊断记录</strong><span>最近执行的网络检查</span></div></div>
          <div class="panel-body panel-body-flush">
            ${history.items.length ? `<div class="table-wrap"><table class="responsive-table diagnostic-table"><thead><tr><th>类型</th><th>目标</th><th>结果</th><th>耗时</th><th>时间</th></tr></thead><tbody>${history.items.map((item) => `<tr><td data-label="类型">${escapeHtml(item.check_type.toUpperCase())}</td><td class="cell-muted" data-label="目标">${escapeHtml(item.target)}</td><td data-label="结果">${statusBadge(item.status)}</td><td data-label="耗时">${item.latency_ms == null ? '--' : `${item.latency_ms} ms`}</td><td class="cell-muted" data-label="时间">${formatDate(item.created_at)}</td></tr>`).join('')}</tbody></table></div>` : emptyState('暂无诊断记录', '执行一次网络检查后会保留结果。')}
          </div>
        </section>
      </div>

      <section class="panel">
        <div class="panel-header"><div class="panel-title"><strong>网络诊断</strong><span>DNS、端口、HTTP 与连通性检查</span></div></div>
        <div class="panel-body">
          <form class="diagnostic-form" id="diagnostic-form">
            <div class="form-row">
              <label class="form-field"><span>检查类型</span><select name="type" id="diagnostic-type"><option value="app">本应用健康检查</option><option value="dns">DNS 解析</option><option value="port">TCP 端口</option><option value="http">HTTP 服务</option><option value="ping">Ping 连通性</option></select></label>
              <label class="form-field" id="diagnostic-port-field" hidden><span>端口</span><input name="port" type="number" min="1" max="65535" value="443"></label>
            </div>
            <label class="form-field" id="diagnostic-target-field" hidden><span>目标地址</span><input name="target" placeholder="例如 example.com 或 192.168.1.10"><small class="form-hint">仅执行只读健康检查，不修改目标环境。</small></label>
            <button class="button button-primary" type="submit">${icon('diagnostics')}开始诊断</button>
          </form>
          <pre class="result-box" id="diagnostic-result"></pre>
        </div>
      </section>
    </div>
  `;
  bindDataIcons();
  animateProgress(app);
  syncDiagnosticFields();
}

async function loadKnowledge() {
  const params = new URLSearchParams(cleanParams(state.knowledgeFilters));
  const { items } = await api(`/api/knowledge?${params}`);
  app.innerHTML = `
    <div class="page-actions">
      <div class="page-actions-copy"><strong>解决方案知识库</strong><span>沉淀常见故障、排查路径与标准处理方案</span></div>
      <button class="button button-primary" type="button" data-action="new-article">${icon('plus')}新增方案</button>
    </div>
    <form class="filter-bar" id="knowledge-filter-form" style="grid-template-columns:minmax(240px,1fr) 180px auto">
      <label class="field-search">${icon('search')}<input name="q" value="${escapeHtml(state.knowledgeFilters.q)}" placeholder="搜索问题、故障或标签"></label>
      <select name="category" aria-label="知识分类">${options([['', '全部分类'], ['技术支持', '技术支持'], ['服务部署', '服务部署'], ['系统运维', '系统运维'], ['数据库', '数据库']], state.knowledgeFilters.category)}</select>
      <button class="button button-secondary" type="submit">${icon('search')}搜索</button>
    </form>
    ${items.length ? `<section class="knowledge-grid">${items.map(articleCard).join('')}</section>` : emptyState('没有匹配的知识条目', '调整关键词或分类后重新搜索。')}
  `;
  bindDataIcons();
}

function metricCard(iconName, label, value, note, nav, color, soft) {
  return `
    <article class="metric-card" style="--metric-color:${color};--metric-soft:${soft}">
      <div class="metric-top"><span>${escapeHtml(label)}</span><span class="metric-icon">${icon(iconName)}</span></div>
      <div><div class="metric-value">${number(value)}</div><div class="metric-note">${escapeHtml(note)}</div></div>
      <button class="panel-link" type="button" data-nav="${nav}">查看详情 ${icon('arrowRight', 12)}</button>
    </article>
  `;
}

function ticketTable(items, compact = false) {
  if (!items.length) return emptyState('暂无工单', '创建工单后会显示在这里。');
  return `
    <div class="table-wrap">
      <table class="responsive-table ticket-table">
        <thead><tr><th>工单</th><th>客户</th><th>优先级</th><th>状态</th><th>负责人</th>${compact ? '' : '<th>更新时间</th>'}</tr></thead>
        <tbody>${items.map((ticket) => `
          <tr class="ticket-row" data-ticket-id="${ticket.id}">
            <td data-label="工单"><div class="ticket-title"><strong>${escapeHtml(ticket.title)}</strong><span>${escapeHtml(ticket.ticket_no)} · ${escapeHtml(ticket.category || '未分类')}</span></div></td>
            <td data-label="客户">${escapeHtml(ticket.customer)}</td>
            <td data-label="优先级">${priorityBadge(ticket.priority)}</td>
            <td data-label="状态">${statusBadge(ticket.status)}</td>
            <td data-label="负责人">${escapeHtml(ticket.assignee || '未分配')}</td>
            ${compact ? '' : `<td class="cell-muted" data-label="更新时间">${formatDate(ticket.updated_at)}</td>`}
          </tr>`).join('')}</tbody>
      </table>
    </div>
  `;
}

function deploymentList(items) {
  if (!items.length) return emptyState('暂无进行中项目', '当前没有待交付的实施项目。');
  return `<div class="deployment-list">${items.map((item) => `
    <article class="deployment-item">
      <div class="deployment-topline"><strong>${escapeHtml(item.project_name)}</strong>${statusBadge(item.status)}</div>
      <div class="deployment-meta"><span>${escapeHtml(item.customer)}</span><span>${escapeHtml(item.owner || '未分配')}</span></div>
      <div><div class="progress-labels"><span>${escapeHtml(item.current_step)}</span><strong>${item.progress}%</strong></div><div class="progress-track ${item.status === 'at_risk' ? 'is-warning' : ''}"><span style="width:${item.progress}%"></span></div></div>
    </article>`).join('')}</div>`;
}

function deploymentCard(item) {
  return `
    <article class="deployment-card">
      <div class="deployment-card-head"><div><span class="deployment-code">${escapeHtml(item.code)} · ${escapeHtml(item.environment)}</span><h3>${escapeHtml(item.project_name)}</h3></div>${statusBadge(item.status)}</div>
      <p>${escapeHtml(item.current_step)}</p>
      <div><div class="progress-labels"><span>交付进度</span><strong>${item.progress}%</strong></div><div class="progress-track ${item.status === 'at_risk' ? 'is-warning' : ''}"><span style="width:${item.progress}%"></span></div></div>
      <div class="deployment-details"><div>${icon('server', 14)} ${escapeHtml(item.customer)}</div><div>${icon('clock', 14)} 截止 ${escapeHtml(item.due_date)}</div></div>
      <div class="deployment-card-foot"><span class="cell-muted">负责人 ${escapeHtml(item.owner || '未分配')}</span><button class="button button-secondary button-sm" type="button" data-deployment-id="${item.id}">更新进度</button></div>
    </article>`;
}

function articleCard(item) {
  return `
    <article class="article-card" data-article-id="${item.id}">
      <div class="article-card-head"><div><span class="article-category">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3></div><span class="cell-muted">${icon('knowledge', 18)}</span></div>
      <p class="article-snippet">${escapeHtml(item.symptom)}</p>
      <div class="tag-list">${String(item.tags || '').split(',').filter(Boolean).map((tag) => `<span class="tag">${escapeHtml(tag.trim())}</span>`).join('')}</div>
      <div class="article-card-foot"><span class="cell-muted">浏览 ${item.views}</span><span class="panel-link">查看方案 ${icon('arrowRight', 12)}</span></div>
    </article>`;
}

function activityList(items) {
  if (!items.length) return emptyState('暂无动态', '系统中的操作记录会显示在这里。');
  return items.map((item) => `
    <article class="activity-item">
      <span class="activity-icon">${icon(activityIcon(item.action), 13)}</span>
      <div class="activity-copy"><strong>${escapeHtml(item.detail)}</strong><span>${relativeTime(item.created_at)}</span></div>
    </article>`).join('');
}

function activityIcon(action) {
  if (action.includes('ticket')) return 'tickets';
  if (action.includes('deployment')) return 'deployments';
  if (action.includes('knowledge')) return 'knowledge';
  if (action.includes('diagnostic')) return 'network';
  return 'check';
}

function statusBadge(status) {
  const [label, className] = STATUS_META[status] || [status, 'status-open'];
  return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

function priorityBadge(priority) {
  const [label, className] = PRIORITY_META[priority] || [priority, 'priority-medium'];
  return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

async function openTicketModal(ticket = null) {
  const editing = Boolean(ticket);
  openModal({
    title: editing ? `${ticket.ticket_no} · 工单详情` : '新建工单',
    wide: true,
    content: `
      <form class="form-grid" id="ticket-form" data-ticket-id="${editing ? ticket.id : ''}">
        <div class="form-row">
          <label class="form-field"><span>工单标题</span><input name="title" required maxlength="120" value="${escapeAttr(ticket?.title || '')}"></label>
          <label class="form-field"><span>客户名称</span><input name="customer" required maxlength="80" value="${escapeAttr(ticket?.customer || '')}"></label>
        </div>
        <div class="form-row">
          <label class="form-field"><span>优先级</span><select name="priority">${options([['critical', 'P0 紧急'], ['high', 'P1 高'], ['medium', 'P2 中'], ['low', 'P3 低']], ticket?.priority || 'medium')}</select></label>
          <label class="form-field"><span>状态</span><select name="status">${options([['open', '待处理'], ['in_progress', '处理中'], ['waiting', '待客户'], ['resolved', '已解决'], ['closed', '已关闭']], ticket?.status || 'open')}</select></label>
        </div>
        <div class="form-row">
          <label class="form-field"><span>问题分类</span><input name="category" maxlength="40" value="${escapeAttr(ticket?.category || '技术支持')}"></label>
          <label class="form-field"><span>负责人</span><input name="assignee" maxlength="40" value="${escapeAttr(ticket?.assignee || '')}"></label>
        </div>
        <label class="form-field"><span>问题描述</span><textarea name="description" maxlength="2000">${escapeHtml(ticket?.description || '')}</textarea></label>
        ${editing ? `<label class="form-field"><span>解决记录</span><textarea name="resolution" maxlength="2000">${escapeHtml(ticket?.resolution || '')}</textarea></label>` : ''}
        <div class="form-actions"><button class="button button-secondary" type="button" data-action="close-modal">取消</button><button class="button button-primary" type="submit">${editing ? '保存变更' : '创建工单'}</button></div>
      </form>
    `
  });
}

async function openDeploymentModal(item = null) {
  openModal({
    title: item ? `${item.code} · 更新交付进度` : '新建实施项目',
    content: `
      <form class="form-grid" id="deployment-form" data-deployment-id="${item?.id || ''}">
        <label class="form-field"><span>项目名称</span><input name="projectName" required maxlength="120" value="${escapeAttr(item?.project_name || '')}"></label>
        <label class="form-field"><span>客户名称</span><input name="customer" required maxlength="80" value="${escapeAttr(item?.customer || '')}"></label>
        <div class="form-row">
          <label class="form-field"><span>环境</span><input name="environment" maxlength="60" value="${escapeAttr(item?.environment || '生产环境')}"></label>
          <label class="form-field"><span>负责人</span><input name="owner" maxlength="40" value="${escapeAttr(item?.owner || '')}"></label>
        </div>
        <div class="form-row">
          <label class="form-field"><span>状态</span><select name="status">${options([['planning', '规划中'], ['deploying', '部署中'], ['testing', '验证中'], ['live', '已交付'], ['at_risk', '有风险']], item?.status || 'planning')}</select></label>
          <label class="form-field"><span>进度</span><input name="progress" type="number" min="0" max="100" value="${item?.progress ?? 0}"></label>
        </div>
        <label class="form-field"><span>当前步骤</span><input name="currentStep" maxlength="120" value="${escapeAttr(item?.current_step || '环境调研')}"></label>
        <label class="form-field"><span>计划完成日期</span><input name="dueDate" type="date" value="${escapeAttr(item?.due_date || new Date().toISOString().slice(0, 10))}"></label>
        <div class="form-actions"><button class="button button-secondary" type="button" data-action="close-modal">取消</button><button class="button button-primary" type="submit">${item ? '保存进度' : '创建项目'}</button></div>
      </form>
    `
  });
}

async function openKnowledgeModal() {
  openModal({
    title: '新增知识方案',
    wide: true,
    content: `
      <form class="form-grid" id="knowledge-form">
        <div class="form-row">
          <label class="form-field"><span>标题</span><input name="title" required maxlength="120"></label>
          <label class="form-field"><span>分类</span><select name="category">${options([['技术支持', '技术支持'], ['服务部署', '服务部署'], ['系统运维', '系统运维'], ['数据库', '数据库']], '技术支持')}</select></label>
        </div>
        <label class="form-field"><span>问题现象</span><textarea name="symptom" required maxlength="2000"></textarea></label>
        <label class="form-field"><span>解决方案</span><textarea name="solution" required maxlength="4000"></textarea></label>
        <label class="form-field"><span>标签</span><input name="tags" maxlength="200" placeholder="用英文逗号分隔，例如 Linux,端口,部署"></label>
        <div class="form-actions"><button class="button button-secondary" type="button" data-action="close-modal">取消</button><button class="button button-primary" type="submit">保存方案</button></div>
      </form>
    `
  });
}

function openArticleModal(article) {
  openModal({
    title: '知识条目',
    content: `
      <article class="article-detail">
        <span class="article-category">${escapeHtml(article.category)}</span>
        <h3>${escapeHtml(article.title)}</h3>
        <section class="article-section"><span>问题现象</span><p>${escapeHtml(article.symptom)}</p></section>
        <section class="article-section"><span>处理方案</span><p>${escapeHtml(article.solution)}</p></section>
        <section class="article-section"><span>标签</span><div class="tag-list">${String(article.tags || '').split(',').filter(Boolean).map((tag) => `<span class="tag">${escapeHtml(tag.trim())}</span>`).join('')}</div></section>
      </article>
    `
  });
}

function openModal({ title, content, wide = false }) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="backdrop">
      <section class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
        <header class="modal-header"><h2>${escapeHtml(title)}</h2><button class="icon-button" type="button" data-action="close-modal" aria-label="关闭">${icon('x')}</button></header>
        <div class="modal-body">${content}</div>
      </section>
    </div>`;
}

function closeModal() {
  modalRoot.innerHTML = '';
}

function handleDocumentClick(event) {
  const navButton = event.target.closest('[data-nav]');
  if (navButton) {
    navigate(navButton.dataset.nav);
    return;
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'close-modal') closeModal();
  if (action === 'backdrop' && event.target.classList.contains('modal-backdrop')) closeModal();
  if (action === 'new-ticket') openTicketModal();
  if (action === 'new-deployment') openDeploymentModal();
  if (action === 'new-article') openKnowledgeModal();

  const ticketRow = event.target.closest('tr[data-ticket-id]');
  if (ticketRow && !event.target.closest('button')) {
    api(`/api/tickets/${ticketRow.dataset.ticketId}`).then(openTicketModal).catch(showError);
  }

  const deploymentButton = event.target.closest('[data-deployment-id]');
  if (deploymentButton && deploymentButton.tagName === 'BUTTON') {
    api('/api/deployments').then(({ items }) => {
      const item = items.find((deployment) => deployment.id === Number(deploymentButton.dataset.deploymentId));
      if (item) openDeploymentModal(item);
    }).catch(showError);
  }

  const articleCardElement = event.target.closest('[data-article-id]');
  if (articleCardElement) {
    api(`/api/knowledge/${articleCardElement.dataset.articleId}`).then(openArticleModal).catch(showError);
  }
}

async function handleSubmit(event) {
  const form = event.target;
  if (!form.matches('form')) return;
  event.preventDefault();

  try {
    if (form.id === 'ticket-form') return await submitTicket(form);
    if (form.id === 'deployment-form') return await submitDeployment(form);
    if (form.id === 'knowledge-form') return await submitKnowledge(form);
    if (form.id === 'diagnostic-form') return await submitDiagnostic(form);
    if (form.id === 'ticket-filter-form') return applyTicketFilters(form);
    if (form.id === 'knowledge-filter-form') return applyKnowledgeFilters(form);
  } catch (error) {
    showError(error);
  }
}

function handleChange(event) {
  if (event.target.id === 'diagnostic-type') syncDiagnosticFields();
}

async function submitTicket(form) {
  const id = form.dataset.ticketId;
  const payload = Object.fromEntries(new FormData(form));
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    await api(id ? `/api/tickets/${id}` : '/api/tickets', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload)
    });
    closeModal();
    showToast(id ? '工单已更新' : '工单已创建');
    await loadCurrentView(true);
  } finally {
    button.disabled = false;
  }
}

async function submitDeployment(form) {
  const id = form.dataset.deploymentId;
  const payload = Object.fromEntries(new FormData(form));
  payload.progress = Number(payload.progress);
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    await api(id ? `/api/deployments/${id}` : '/api/deployments', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload)
    });
    closeModal();
    showToast(id ? '交付进度已更新' : '实施项目已创建');
    await loadCurrentView(true);
  } finally {
    button.disabled = false;
  }
}

async function submitKnowledge(form) {
  const payload = Object.fromEntries(new FormData(form));
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    await api('/api/knowledge', { method: 'POST', body: JSON.stringify(payload) });
    closeModal();
    showToast('知识条目已保存');
    await loadCurrentView(true);
  } finally {
    button.disabled = false;
  }
}

async function submitDiagnostic(form) {
  const payload = Object.fromEntries(new FormData(form));
  if (payload.type === 'app') delete payload.target;
  const button = form.querySelector('[type="submit"]');
  const resultBox = document.querySelector('#diagnostic-result');
  button.disabled = true;
  button.textContent = '检查中...';
  try {
    const result = await api('/api/diagnostics/network', { method: 'POST', body: JSON.stringify(payload) });
    resultBox.textContent = [
      `检查类型: ${result.type.toUpperCase()}`,
      `目标: ${result.target}`,
      `结果: ${result.status}`,
      `耗时: ${result.latencyMs ?? '--'} ms`,
      '',
      result.detail
    ].join('\n');
    resultBox.classList.add('is-visible');
    showToast(result.status === 'failed' ? '检查完成，目标不可达' : '检查完成');
    const history = await api('/api/diagnostics/history');
    const historyPanel = app.querySelectorAll('.panel')[1];
    if (historyPanel) updateHistoryPanel(historyPanel, history.items);
  } finally {
    button.disabled = false;
    button.innerHTML = `${icon('diagnostics')}开始诊断`;
  }
}

async function applyTicketFilters(form) {
  state.filters = Object.fromEntries(new FormData(form));
  await loadTickets();
}

async function applyKnowledgeFilters(form) {
  state.knowledgeFilters = Object.fromEntries(new FormData(form));
  await loadKnowledge();
}

function updateHistoryPanel(panel, items) {
  const wrap = panel.querySelector('.panel-body');
  if (!items.length) {
    wrap.innerHTML = emptyState('暂无诊断记录', '执行一次网络检查后会保留结果。');
    return;
  }
  wrap.innerHTML = `<div class="table-wrap"><table class="responsive-table diagnostic-table"><thead><tr><th>类型</th><th>目标</th><th>结果</th><th>耗时</th><th>时间</th></tr></thead><tbody>${items.map((item) => `<tr><td data-label="类型">${escapeHtml(item.check_type.toUpperCase())}</td><td class="cell-muted" data-label="目标">${escapeHtml(item.target)}</td><td data-label="结果">${statusBadge(item.status)}</td><td data-label="耗时">${item.latency_ms == null ? '--' : `${item.latency_ms} ms`}</td><td class="cell-muted" data-label="时间">${formatDate(item.created_at)}</td></tr>`).join('')}</tbody></table></div>`;
}

function syncDiagnosticFields() {
  const type = document.querySelector('#diagnostic-type')?.value;
  const targetField = document.querySelector('#diagnostic-target-field');
  const portField = document.querySelector('#diagnostic-port-field');
  const targetInput = targetField?.querySelector('input');
  if (!type || !targetField || !portField || !targetInput) return;
  const needsTarget = type !== 'app';
  targetField.hidden = !needsTarget;
  portField.hidden = type !== 'port';
  targetInput.required = needsTarget;
  targetInput.placeholder = type === 'http' ? '例如 https://example.com/health' : type === 'dns' ? '例如 example.com' : '例如 192.168.1.10';
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `请求失败 (${response.status})`);
  return payload;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icon(type === 'success' ? 'check' : 'alert')}<span>${escapeHtml(message)}</span>`;
  toastRoot.append(toast);
  setTimeout(() => toast.remove(), 3200);
}

function showError(error) {
  showToast(error.message || '操作失败', 'error');
}

function toggleSidebar() {
  const isOpen = sidebar.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
}

function closeSidebar() {
  sidebar.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

function bindDataIcons() {
  app.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icon(element.dataset.icon);
  });
}

function icon(name, size = 18) {
  const path = ICON_PATHS[name] || ICON_PATHS.activity;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function options(items, selected) {
  return items.map(([value, label]) => `<option value="${escapeAttr(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function systemStat(label, value) {
  return `<div class="system-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function emptyState(title, message) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div>`;
}

function errorTemplate(message) {
  return `<div class="error-state"><strong>页面加载失败</strong><span>${escapeHtml(message || '请检查服务连接')}</span><button class="button button-secondary" type="button" data-nav="dashboard">返回概览</button></div>`;
}

function loadingTemplate() {
  return `<div class="skeleton-grid">${Array.from({ length: 4 }, () => '<span class="skeleton skeleton-card"></span>').join('')}</div><div style="height:18px"></div><span class="skeleton" style="height:320px"></span>`;
}

function formatDate(value) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value));
}

function relativeTime(value) {
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.round(hours / 24)} 天前`;
}

function humanDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}天 ${hours}小时`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小时 ${minutes}分钟`;
}

function number(value) {
  return new Intl.NumberFormat('zh-CN').format(Number(value || 0));
}

function cleanParams(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== '' && value != null));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}
