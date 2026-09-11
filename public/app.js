const ICON_PATHS = {
  workbench: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/>',
  projects: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 9h18"/>',
  preflight: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5M8 17h3"/><path d="m15 16 2 2 3-4"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  cases: '<path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 4V2h8v2M8 10h8M8 14h5"/>',
  handover: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-5"/>',
  knowledge: '<path d="M2 4h6a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H2Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h6Z"/>',
  menu: '<path d="M4 12h16M4 6h16M4 18h16"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  play: '<path d="m7 4 13 8-13 8Z"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  network: '<rect width="6" height="6" x="9" y="2" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="16" y="16" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
  search: '<circle cx="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 11h8M8 15h6"/>',
  alert: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  clock: '<circle cx="12" r="9"/><path d="M12 7v5l3 2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  settings: '<circle cx="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4Z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6Z"/>',
  db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'
};

const VIEW_META = {
  workbench: { title: '今日工作台', eyebrow: '现场实施' },
  projects: { title: '实施项目', eyebrow: '项目执行' },
  preflight: { title: '环境预检', eyebrow: '部署前检查' },
  database: { title: '数据库交付', eyebrow: '数据核验' },
  cases: { title: '技术支持', eyebrow: '问题闭环' },
  handover: { title: '培训验收', eyebrow: '交付确认' },
  knowledge: { title: '知识库', eyebrow: '经验沉淀' }
};

const PHASES = [
  ['requirement', '需求确认'],
  ['preflight', '环境预检'],
  ['deployment', '安装部署'],
  ['data', '数据核验'],
  ['integration', '联调测试'],
  ['training', '用户培训'],
  ['acceptance', '项目验收'],
  ['review', '上线复盘']
];

const STATUS_LABELS = {
  pending: '待处理',
  in_progress: '处理中',
  blocked: '已阻塞',
  done: '已完成',
  open: '待处理',
  waiting: '待客户',
  resolved: '已解决',
  closed: '已关闭',
  healthy: '通过',
  warning: '警告',
  failed: '失败',
  active: '进行中',
  completed: '已完成',
  archived: '已归档'
};

const PRIORITY_LABELS = { critical: 'P0 紧急', high: 'P1 高', medium: 'P2 中', low: 'P3 低' };
const CATEGORY_LABELS = { account: '账号角色', training: '用户培训', acceptance: '项目验收', document: '交付文档' };

const state = {
  view: 'workbench',
  projectId: null,
  projects: [],
  project: null,
  workbench: null,
  checks: [],
  system: null,
  profiles: [],
  validations: [],
  schema: [],
  selectedTable: '',
  queryResult: null,
  cases: [],
  selectedCase: null,
  handover: [],
  knowledge: [],
  knowledgeQuery: ''
};

const app = document.querySelector('#app');
const pageTitle = document.querySelector('#page-title');
const pageEyebrow = document.querySelector('#page-eyebrow');
const projectSelect = document.querySelector('#global-project');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');
const sidebar = document.querySelector('#sidebar');
const scrollCompanion = document.querySelector('#scroll-companion');
const companionProgress = document.querySelector('#companion-progress');
const companionDot = document.querySelector('#companion-dot');
const companionNode = document.querySelector('#companion-node');

init();

function init() {
  document.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icon(element.dataset.icon);
  });
  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.nav));
  });
  projectSelect.addEventListener('change', async () => {
    state.projectId = Number(projectSelect.value) || null;
    state.project = null;
    await loadCurrentView();
  });
  document.querySelector('#refresh-button').addEventListener('click', () => loadCurrentView(true));
  document.querySelector('#menu-toggle').addEventListener('click', toggleSidebar);
  initScrollCompanion();
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeSidebar();
  });
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
  app.innerHTML = loadingTemplate('正在加载交付工作台');
  try {
    const { items } = await api('/api/projects');
    state.projects = items;
    if (!state.projects.some((project) => project.id === state.projectId)) {
      state.projectId = state.projects[0]?.id || null;
    }
    renderProjectSwitcher();
    await loadCurrentView();
  } catch (error) {
    showError(error);
  }
}

async function loadCurrentView(force = false) {
  if (!state.projects.length || force) {
    const { items } = await api('/api/projects');
    state.projects = items;
    if (!state.projects.some((project) => project.id === state.projectId)) {
      state.projectId = state.projects[0]?.id || null;
    }
    renderProjectSwitcher();
  }
  app.innerHTML = loadingTemplate('正在加载页面数据');
  try {
    if (state.view === 'workbench') await loadWorkbench();
    if (state.view === 'projects') await loadProjects();
    if (state.view === 'preflight') await loadPreflight();
    if (state.view === 'database') await loadDatabase();
    if (state.view === 'cases') await loadCases();
    if (state.view === 'handover') await loadHandover();
    if (state.view === 'knowledge') await loadKnowledge();
  } catch (error) {
    app.innerHTML = errorTemplate(error.message);
  }
}

async function loadWorkbench() {
  state.workbench = await api(`/api/workbench${state.projectId ? `?projectId=${state.projectId}` : ''}`);
  if (state.workbench.project) state.projectId = state.workbench.project.id;
  renderProjectSwitcher();
  renderWorkbench();
}

async function loadProjects() {
  await ensureProject();
  if (!state.project) return renderEmptyPage('还没有实施项目', '创建第一个项目后即可开始完整交付流程。', 'new-project', '创建实施项目');
  renderProjects();
}

async function loadPreflight() {
  await ensureProject();
  const [system, history] = await Promise.all([
    api('/api/checks/system'),
    api(`/api/checks/history?projectId=${state.projectId}&limit=20`)
  ]);
  state.system = system;
  state.checks = history.items;
  renderPreflight();
}

async function loadDatabase() {
  await ensureProject();
  const [profiles, validations] = await Promise.all([
    api(`/api/db/profiles?projectId=${state.projectId}`),
    api(`/api/db/validations?projectId=${state.projectId}`)
  ]);
  state.profiles = profiles.items;
  state.validations = validations.items;
  if (!state.profiles.some((profile) => profile.id === state.profileId)) {
    state.profileId = state.profiles[0]?.id || null;
  }
  state.schema = [];
  state.selectedTable = '';
  renderDatabase();
}

async function loadCases() {
  await ensureProject();
  const { items } = await api(`/api/cases?projectId=${state.projectId}`);
  state.cases = items;
  if (!state.selectedCase || !state.cases.some((item) => item.id === state.selectedCase.id)) {
    state.selectedCase = state.cases[0] ? await api(`/api/cases/${state.cases[0].id}`) : null;
  } else {
    state.selectedCase = await api(`/api/cases/${state.selectedCase.id}`);
  }
  renderCases();
}

async function loadHandover() {
  await ensureProject();
  const { items } = await api(`/api/handover/${state.projectId}`);
  state.handover = items;
  renderHandover();
}

async function loadKnowledge() {
  const query = state.knowledgeQuery ? `?q=${encodeURIComponent(state.knowledgeQuery)}` : '';
  const { items } = await api(`/api/knowledge${query}`);
  state.knowledge = items;
  renderKnowledge();
}

async function ensureProject() {
  if (!state.projectId) return;
  if (!state.project || state.project.id !== state.projectId) {
    state.project = await api(`/api/projects/${state.projectId}`);
  }
}

function renderWorkbench() {
  const data = state.workbench;
  if (!data?.project) {
    return renderEmptyPage('还没有实施项目', '先建立一个客户实施项目，再开始环境预检、数据核验和验收。', 'new-project', '创建实施项目');
  }
  const project = data.project;
  const taskTotal = state.projects.find((item) => item.id === project.id)?.total_tasks || 0;
  const taskDone = state.projects.find((item) => item.id === project.id)?.completed_tasks || 0;
  const progress = taskTotal ? Math.round((taskDone / taskTotal) * 100) : 0;
  app.innerHTML = `
    <section class="view-head">
      <div>
        <div class="project-kicker">${h(project.code)} · ${h(project.environment)}</div>
        <h2>${h(project.project_name)}</h2>
        <p>${h(project.customer)} · ${h(project.product_name || '待补充产品')} · 计划上线 ${h(project.go_live_date || '未设置')}</p>
      </div>
      <div class="head-actions">
        <button class="button secondary" data-action="edit-project">${icon('edit')}编辑项目</button>
        <a class="button secondary" href="/api/reports/project/${project.id}?format=html" target="_blank">${icon('download')}实施报告</a>
        <button class="button primary" data-action="new-task">${icon('plus')}新增任务</button>
      </div>
    </section>

    <section class="focus-strip">
      <div class="focus-copy">
        <span class="focus-label">当前阶段</span>
        <strong>${h(phaseLabel(project.phase))}</strong>
        <small>${h(project.notes || '暂无项目备注')}</small>
      </div>
      <div class="focus-progress">
        <div class="progress-label"><span>项目任务完成度</span><strong>${taskDone} / ${taskTotal}</strong></div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
      </div>
    </section>

    <section class="metric-grid">
      ${metricCard('next', '待推进任务', data.nextTasks.length, '按阻塞与阶段排序', 'workbench')}
      ${metricCard('blocked', '阻塞事项', data.blockers.length, data.blockers.length ? '需要优先处理' : '当前无阻塞', 'projects')}
      ${metricCard('cases', '待跟进问题', data.openCases.length, '客户问题闭环', 'cases')}
      ${metricCard('handover', '验收待办', data.pendingHandover.length, '培训与签字确认', 'handover')}
    </section>

    <section class="dashboard-grid">
      <article class="panel span-2">
        <header class="panel-head">
          <div><span class="panel-kicker">下一步</span><h3>今天要推进的任务</h3></div>
          <button class="text-button" data-nav="projects">全部任务 ${icon('arrow')}</button>
        </header>
        <div class="task-stack">
          ${data.nextTasks.length ? data.nextTasks.map(taskRow).join('') : emptyBlock('当前阶段任务已清空', '可以进入培训验收或整理上线复盘。')}
        </div>
      </article>

      <article class="panel">
        <header class="panel-head">
          <div><span class="panel-kicker">检查记录</span><h3>最近现场检查</h3></div>
          <button class="icon-button small" data-nav="preflight" title="打开环境预检">${icon('preflight')}</button>
        </header>
        <div class="timeline">
          ${data.recentChecks.length ? data.recentChecks.map(checkTimelineRow).join('') : emptyBlock('暂无检查记录', '运行环境或网络检查后会出现在这里。')}
        </div>
      </article>

      <article class="panel">
        <header class="panel-head">
          <div><span class="panel-kicker">客户支持</span><h3>待跟进问题</h3></div>
          <button class="text-button" data-nav="cases">问题中心 ${icon('arrow')}</button>
        </header>
        <div class="compact-list">
          ${data.openCases.length ? data.openCases.map((item) => `
            <button class="compact-row" data-action="open-case" data-id="${item.id}">
              <span>${statusBadge(item.priority, 'priority')}</span>
              <strong>${h(item.title)}</strong>
              <small>${h(item.next_action || item.symptom)}</small>
            </button>
          `).join('') : emptyBlock('没有待跟进问题', '客户问题处理完成后会沉淀到知识库。')}
        </div>
      </article>

      <article class="panel">
        <header class="panel-head">
          <div><span class="panel-kicker">交付工具</span><h3>工程师常用入口</h3></div>
        </header>
        <div class="quick-grid">
          <button data-nav="preflight">${icon('server')}<span>环境预检</span><small>系统、网络、端口</small></button>
          <button data-nav="database">${icon('database')}<span>数据核验</span><small>SQL、校验、导出</small></button>
          <button data-nav="handover">${icon('handover')}<span>培训验收</span><small>清单、签字、报告</small></button>
          <button data-nav="knowledge">${icon('knowledge')}<span>知识沉淀</span><small>问题转解决方案</small></button>
        </div>
      </article>
    </section>

    <section class="panel">
      <header class="panel-head">
        <div><span class="panel-kicker">处理轨迹</span><h3>最近项目动态</h3></div>
      </header>
      <div class="activity-line">
        ${data.recentEvents.length ? data.recentEvents.map((event) => `
          <div class="activity-row">
            <span class="activity-dot"></span>
            <div><strong>${h(event.case_no)} · ${h(event.title)}</strong><p>${h(event.detail)}</p></div>
            <time>${relativeTime(event.created_at)}</time>
          </div>
        `).join('') : emptyBlock('暂无处理动态', '问题受理、诊断和解决记录会显示在这里。')}
      </div>
    </section>
  `;
}

function renderProjects() {
  const project = state.project;
  const grouped = PHASES.map(([key, label]) => ({
    key,
    label,
    tasks: project.tasks.filter((task) => task.stage === key)
  }));
  app.innerHTML = `
    <section class="view-head">
      <div><div class="project-kicker">项目执行</div><h2>标准实施阶段与现场任务</h2><p>按阶段推进需求、部署、数据、培训和验收，所有证据保留在项目内。</p></div>
      <div class="head-actions">
        <button class="button secondary" data-action="edit-project">${icon('edit')}项目资料</button>
        <button class="button primary" data-action="new-task">${icon('plus')}新增任务</button>
      </div>
    </section>
    <section class="project-workspace">
      <aside class="project-list panel">
        <header class="panel-head"><div><span class="panel-kicker">项目列表</span><h3>${state.projects.length} 个实施项目</h3></div><button class="icon-button small" data-action="new-project" title="创建项目">${icon('plus')}</button></header>
        <div class="project-list-items">
          ${state.projects.map((item) => `
            <button class="project-list-item ${item.id === project.id ? 'is-active' : ''}" data-action="select-project" data-id="${item.id}">
              <span class="project-code">${h(item.code)}</span>
              <strong>${h(item.project_name)}</strong>
              <small>${h(item.customer)} · ${h(item.environment)}</small>
              <span class="mini-progress"><i style="width:${item.total_tasks ? Math.round((item.completed_tasks / item.total_tasks) * 100) : 0}%"></i></span>
            </button>
          `).join('')}
        </div>
      </aside>
      <div class="project-detail">
        <section class="project-summary panel">
          <div>
            <span class="project-kicker">${h(project.code)}</span>
            <h2>${h(project.project_name)}</h2>
            <p>${h(project.customer)} · ${h(project.product_name || '待补充产品')}</p>
          </div>
          <dl class="summary-facts">
            <div><dt>环境</dt><dd>${h(project.environment)}</dd></div>
            <div><dt>负责人</dt><dd>${h(project.owner || '未设置')}</dd></div>
            <div><dt>客户联系人</dt><dd>${h(project.customer_contact || '未设置')}</dd></div>
            <div><dt>计划上线</dt><dd>${h(project.go_live_date || '未设置')}</dd></div>
          </dl>
        </section>
        <section class="phase-board panel">
          <header class="panel-head"><div><span class="panel-kicker">实施阶段</span><h3>交付路线</h3></div><span class="muted">点击任务可补充负责人、日期和证据</span></header>
          <div class="phase-steps">
            ${grouped.map((group, index) => `<div class="phase-step ${group.tasks.every((task) => task.status === 'done') && group.tasks.length ? 'is-done' : ''}"><span>${index + 1}</span><strong>${h(group.label)}</strong></div>`).join('')}
          </div>
          <div class="phase-groups">
            ${grouped.map((group) => `
              <section class="phase-group">
                <header><div><span>${h(group.label)}</span><small>${group.tasks.filter((task) => task.status === 'done').length}/${group.tasks.length} 已完成</small></div><button class="text-button" data-action="new-task" data-stage="${group.key}">${icon('plus')}添加</button></header>
                <div class="task-stack">
                  ${group.tasks.length ? group.tasks.map(taskRow).join('') : `<div class="empty-inline">本阶段暂无任务</div>`}
                </div>
              </section>
            `).join('')}
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderPreflight() {
  const info = state.system;
  app.innerHTML = `
    <section class="view-head">
      <div><div class="project-kicker">${h(state.project.code)} · 环境预检</div><h2>部署前环境与网络检查</h2><p>检查系统资源、端口、DNS、HTTP、系统服务和数据库连接，结果自动留档。</p></div>
      <div class="head-actions">
        <a class="button secondary" href="/api/reports/project/${state.projectId}?format=html" target="_blank">${icon('download')}实施报告</a>
      </div>
    </section>

    <section class="metric-grid">
      ${metricCard('server', '主机', info.hostname, `${info.platform} ${info.release}`, 'preflight')}
      ${metricCard('cpu', 'CPU', `${info.cpuCount} 核`, info.cpuModel || 'CPU 信息', 'preflight')}
      ${metricCard('memory', '内存使用', `${info.memory.usedPercent}%`, `${formatBytes(info.memory.used)} / ${formatBytes(info.memory.total)}`, 'preflight')}
      ${metricCard('disk', '磁盘可用', info.disk ? formatBytes(info.disk.free) : '-', info.disk ? `${info.disk.path} · 已用 ${info.disk.usedPercent}%` : '当前平台不可读取', 'preflight')}
    </section>

    <section class="two-column">
      <article class="panel">
        <header class="panel-head"><div><span class="panel-kicker">系统预检</span><h3>资源与运行环境</h3></div>${statusBadge(info ? memoryStatus(info.memory.usedPercent) : 'healthy')}</header>
        <form id="system-check-form" class="form-grid compact">
          <input type="hidden" name="projectId" value="${state.projectId}">
          ${field('内存告警阈值（%）', '<input type="number" name="memoryMaxPercent" value="85" min="1" max="100">')}
          ${field('磁盘最小可用（GB）', '<input type="number" name="diskMinFreeGb" value="10" min="1" step="0.5">')}
          ${field('单核负载上限', '<input type="number" name="cpuMaxLoadPerCore" value="2.5" min="0.1" step="0.1">')}
          <div class="form-actions span-2"><button class="button primary" type="submit">${icon('play')}执行系统预检并留档</button></div>
        </form>
        <div class="system-facts">
          ${fact('主机名', info.hostname)}${fact('操作系统', `${info.platform} ${info.release}`)}${fact('CPU', `${info.cpuCount} 核`)}
          ${fact('Node.js', info.nodeVersion)}${fact('系统运行', humanDuration(info.uptimeSeconds))}${fact('时区', info.timezone || '未知')}
        </div>
      </article>

      <article class="panel">
        <header class="panel-head"><div><span class="panel-kicker">网络诊断</span><h3>从当前工程师电脑发起检查</h3></div>${icon('network')}</header>
        <form id="network-check-form" class="form-grid compact">
          <input type="hidden" name="projectId" value="${state.projectId}">
          ${field('检查类型', `<select name="type" id="network-type">${options({ dns: 'DNS 解析', port: 'TCP 端口', http: 'HTTP 响应', ping: 'Ping 连通性', service: '系统服务', app: '本应用健康' }, 'port')}</select>`)}
          ${field('目标地址 / 主机名', '<input name="target" id="network-target" value="127.0.0.1" placeholder="例如 10.0.0.15 或 api.example.com">')}
          ${field('TCP 端口', '<input type="number" name="port" id="network-port" value="3306" min="1" max="65535">')}
          <div class="form-actions span-2"><button class="button primary" type="submit">${icon('play')}执行网络检查</button></div>
        </form>
        <p class="form-note">检查会从运行 DeployMate 的机器发起，适合验证安装电脑到客户服务器、数据库和业务服务之间的连通性。</p>
      </article>
    </section>

    <section class="panel">
      <header class="panel-head"><div><span class="panel-kicker">检查历史</span><h3>环境与网络留档</h3></div><span class="muted">最近 ${state.checks.length} 条</span></header>
      ${checksTable(state.checks)}
    </section>
  `;
}

function renderDatabase() {
  const profile = state.profiles.find((item) => item.id === state.profileId);
  const selectedTable = state.schema.find((table) => table.name === state.selectedTable);
  app.innerHTML = `
    <section class="view-head">
      <div><div class="project-kicker">${h(state.project.code)} · 数据库交付</div><h2>客户数据核验与导出</h2><p>统一连接 SQLite、MySQL 和 SQL Server，支持结构浏览、只读 SQL、校验模板和 CSV 导出。</p></div>
      <div class="head-actions"><button class="button primary" data-action="new-profile">${icon('plus')}新增数据库连接</button></div>
    </section>

    <section class="db-toolbar panel">
      <div class="db-profile-select">
        <span>当前连接</span>
        <select id="profile-select">
          <option value="">请选择数据库连接</option>
          ${state.profiles.map((item) => `<option value="${item.id}" ${item.id === state.profileId ? 'selected' : ''}>${h(item.name)} · ${h(databaseKindLabel(item.kind))}</option>`).join('')}
        </select>
      </div>
      <div class="db-password"><span>临时密码</span><input id="db-password" type="password" placeholder="仅本次请求使用，不写入数据库"></div>
      <button class="button secondary" data-action="test-profile" ${profile ? '' : 'disabled'}>${icon('play')}测试连接</button>
      <button class="button secondary" data-action="load-schema" ${profile ? '' : 'disabled'}>${icon('database')}读取结构</button>
      <button class="button secondary" data-action="new-validation" ${profile ? '' : 'disabled'}>${icon('plus')}新增校验</button>
    </section>

    ${profile ? profileStrip(profile) : emptyBlock('尚未配置数据库连接', '可以添加内置 SQLite 演示库，或连接客户环境中的 MySQL / SQL Server。')}

    <section class="database-grid">
      <article class="panel schema-panel">
        <header class="panel-head"><div><span class="panel-kicker">数据结构</span><h3>${state.schema.length ? `${state.schema.length} 个表或视图` : '等待读取结构'}</h3></div>${state.selectedTable ? `<button class="text-button" data-action="export-table">${icon('download')}导出当前表</button>` : ''}</header>
        ${state.schema.length ? `
          <div class="schema-layout">
            <div class="schema-tables">
              ${state.schema.map((table) => `
                <button class="${table.name === state.selectedTable ? 'is-active' : ''}" data-action="select-table" data-table="${escapeAttr(table.name)}">
                  <span>${icon(table.type === 'view' ? 'search' : 'db')}</span><strong>${h(table.name)}</strong><small>${table.rowCount === null ? '--' : number(table.rowCount)} 行</small>
                </button>
              `).join('')}
            </div>
            <div class="schema-columns">
              ${selectedTable ? `<h4>${h(selectedTable.name)}</h4><p>${selectedTable.columns.length} 个字段 · ${selectedTable.rowCount === null ? '行数不可用' : `${number(selectedTable.rowCount)} 行`}</p>
                <div class="column-list">${selectedTable.columns.map((column) => `<div><strong>${h(column.name)}</strong><span>${h(column.type || '未声明')}</span><small>${column.primaryKey ? '主键' : column.nullable ? '可空' : '非空'}</small></div>`).join('')}</div>` : emptyBlock('选择数据表', '读取结构后选择表或视图查看字段。')}
            </div>
          </div>
        ` : emptyBlock('还没有读取数据库结构', '先选择数据库连接，再点击“读取结构”。')}
      </article>

      <article class="panel query-panel">
        <header class="panel-head"><div><span class="panel-kicker">只读优先</span><h3>SQL 查询台</h3></div><span class="safe-chip">默认只读</span></header>
        <form id="sql-form">
          <input type="hidden" name="profileId" value="${profile?.id || ''}">
          <textarea name="sqlText" class="code-editor" spellcheck="false" placeholder="SELECT * FROM stores LIMIT 50;">${h(defaultSql(profile))}</textarea>
          <label class="check-line"><input type="checkbox" name="allowWrite"> 允许写操作</label>
          <div class="write-confirm"><span>高风险 DDL / DROP / TRUNCATE 需要确认：</span><code>CONFIRM DANGEROUS SQL</code><input name="confirmPhrase" placeholder="输入确认短语"></div>
          <div class="form-actions"><button class="button primary" type="submit">${icon('play')}执行 SQL</button></div>
        </form>
        ${renderQueryResult()}
      </article>
    </section>

    <section class="panel">
      <header class="panel-head"><div><span class="panel-kicker">数据校验</span><h3>交付前数据质量检查</h3></div><button class="text-button" data-action="new-validation" ${profile ? '' : 'disabled'}>${icon('plus')}添加校验</button></header>
      ${validationsTable(state.validations)}
    </section>
  `;
}

function renderCases() {
  const selected = state.selectedCase;
  app.innerHTML = `
    <section class="view-head">
      <div><div class="project-kicker">${h(state.project.code)} · 客户支持</div><h2>问题单与处理时间线</h2><p>记录现象、影响、诊断证据、根因和解决方案，处理完成后可直接沉淀知识库。</p></div>
      <div class="head-actions"><button class="button primary" data-action="new-case">${icon('plus')}新建问题单</button></div>
    </section>
    <section class="case-layout">
      <aside class="panel case-list-panel">
        <header class="panel-head"><div><span class="panel-kicker">问题列表</span><h3>${state.cases.length} 条记录</h3></div></header>
        <div class="case-list">
          ${state.cases.length ? state.cases.map((item) => `
            <button class="case-list-item ${selected?.id === item.id ? 'is-active' : ''}" data-action="select-case" data-id="${item.id}">
              <div><span>${h(item.case_no)}</span>${statusBadge(item.priority, 'priority')}</div>
              <strong>${h(item.title)}</strong>
              <small>${h(item.category)} · ${relativeTime(item.updated_at)}更新</small>
              ${statusBadge(item.status)}
            </button>
          `).join('') : emptyBlock('暂无问题单', '创建问题单后开始记录处理过程。')}
        </div>
      </aside>
      <div class="case-detail">
        ${selected ? renderCaseDetail(selected) : emptyBlock('选择问题单', '左侧选择一条问题单查看处理时间线。')}
      </div>
    </section>
  `;
}

function renderCaseDetail(item) {
  return `
    <section class="panel case-summary">
      <header class="case-head">
        <div><span class="project-kicker">${h(item.case_no)}</span><h2>${h(item.title)}</h2><p>${h(item.customer || state.project.customer)} · 负责人 ${h(item.assignee || '未分配')}</p></div>
        <div class="head-actions">
          <a class="button secondary" href="/api/reports/case/${item.id}?format=html" target="_blank">${icon('download')}处理报告</a>
          <button class="button secondary" data-action="edit-case" data-id="${item.id}">${icon('edit')}更新问题</button>
          <button class="button primary" data-action="convert-case" data-id="${item.id}">${icon('book')}转知识库</button>
        </div>
      </header>
      <div class="case-facts">
        ${fact('优先级', PRIORITY_LABELS[item.priority] || item.priority)}${fact('状态', STATUS_LABELS[item.status] || item.status)}${fact('分类', item.category)}${fact('更新时间', formatDateTime(item.updated_at))}
      </div>
      <div class="case-sections">
        <section><h4>问题现象</h4><p>${h(item.symptom || '-')}</p></section>
        <section><h4>影响范围</h4><p>${h(item.impact || '-')}</p></section>
        <section><h4>根本原因</h4><p>${h(item.root_cause || '尚未填写')}</p></section>
        <section><h4>解决方案</h4><p>${h(item.resolution || '尚未填写')}</p></section>
        <section><h4>后续跟进</h4><p>${h(item.next_action || '-')}</p></section>
      </div>
    </section>
    <section class="panel">
      <header class="panel-head"><div><span class="panel-kicker">处理时间线</span><h3>诊断、沟通与解决记录</h3></div><span class="muted">${item.events.length} 条记录</span></header>
      <div class="case-timeline">
        ${item.events.length ? item.events.map((event) => `
          <div class="case-event">
            <span class="event-marker">${eventIcon(event.event_type)}</span>
            <div><strong>${h(event.title)}</strong><p>${h(event.detail || '-')}</p></div>
            <time>${formatDateTime(event.created_at)}</time>
          </div>
        `).join('') : emptyBlock('暂无处理记录', '添加诊断、客户沟通或解决步骤。')}
      </div>
      <form id="case-event-form" class="form-grid event-form">
        <input type="hidden" name="caseId" value="${item.id}">
        ${field('记录类型', `<select name="eventType">${options({ note: '处理记录', diagnostic: '诊断结果', validation: '数据校验', contact: '客户沟通', resolution: '解决方案' }, 'note')}</select>`)}
        ${field('记录标题', '<input name="title" placeholder="例如：检查数据库等待事件" required maxlength="120">')}
        ${field('详细说明', '<textarea name="detail" rows="3" placeholder="记录命令、结果、证据和下一步"></textarea>', true)}
        <div class="form-actions span-2"><button class="button primary" type="submit">${icon('plus')}添加处理记录</button></div>
      </form>
    </section>
  `;
}

function renderHandover() {
  const done = state.handover.filter((item) => item.status === 'done').length;
  const progress = state.handover.length ? Math.round((done / state.handover.length) * 100) : 0;
  app.innerHTML = `
    <section class="view-head">
      <div><div class="project-kicker">${h(state.project.code)} · 培训验收</div><h2>账号、培训、验收与交付文档</h2><p>用清单确认项目具备交付条件，保留执行证据并生成可打印验收报告。</p></div>
      <div class="head-actions">
        <a class="button secondary" href="/api/reports/handover/${state.projectId}?format=html" target="_blank">${icon('download')}验收报告</a>
        <a class="button secondary" href="/api/reports/handover/${state.projectId}?format=md">${icon('download')}Markdown</a>
        <button class="button primary" data-action="new-handover">${icon('plus')}新增交付事项</button>
      </div>
    </section>
    <section class="handover-summary panel">
      <div><span class="project-kicker">交付完成度</span><strong>${progress}%</strong><p>${done} / ${state.handover.length} 项已确认</p></div>
      <div class="progress-track large"><span style="width:${progress}%"></span></div>
      <div class="handover-stats">
        ${['account', 'training', 'acceptance', 'document'].map((category) => {
          const items = state.handover.filter((item) => item.category === category);
          return `<span><strong>${items.filter((item) => item.status === 'done').length}/${items.length}</strong><small>${CATEGORY_LABELS[category]}</small></span>`;
        }).join('')}
      </div>
    </section>
    <section class="handover-grid">
      ${['account', 'training', 'acceptance', 'document'].map((category) => `
        <article class="panel handover-group">
          <header class="panel-head"><div><span class="panel-kicker">${CATEGORY_LABELS[category]}</span><h3>${handoverGroupTitle(category)}</h3></div><button class="icon-button small" data-action="new-handover" data-category="${category}" title="添加事项">${icon('plus')}</button></header>
          <div class="check-list">
            ${state.handover.filter((item) => item.category === category).map(handoverRow).join('') || `<div class="empty-inline">暂无事项</div>`}
          </div>
        </article>
      `).join('')}
    </section>
  `;
}

function renderKnowledge() {
  app.innerHTML = `
    <section class="view-head">
      <div><div class="project-kicker">团队经验库</div><h2>把现场问题变成可复用方案</h2><p>搜索故障现象和解决步骤，保留分类、标签和引用次数。</p></div>
      <div class="head-actions"><button class="button primary" data-action="new-knowledge">${icon('plus')}新增知识文章</button></div>
    </section>
    <section class="knowledge-toolbar panel">
      <form id="knowledge-search-form" class="search-form">
        <span>${icon('search')}</span><input name="q" value="${escapeAttr(state.knowledgeQuery)}" placeholder="搜索门店网络、SQL、服务部署或 Windows 权限问题">
        <button class="button secondary" type="submit">搜索</button>
      </form>
      <span class="muted">${state.knowledge.length} 篇可复用方案</span>
    </section>
    <section class="knowledge-grid">
      ${state.knowledge.length ? state.knowledge.map((article) => `
        <article class="knowledge-card panel">
          <div class="knowledge-meta"><span>${h(article.category)}</span><small>${number(article.views)} 次查看</small></div>
          <h3>${h(article.title)}</h3>
          <p>${h(article.symptom)}</p>
          <div class="tag-row">${String(article.tags || '').split(',').filter(Boolean).slice(0, 4).map((tag) => `<span>${h(tag.trim())}</span>`).join('')}</div>
          <button class="text-button" data-action="view-knowledge" data-id="${article.id}">查看解决方案 ${icon('arrow')}</button>
        </article>
      `).join('') : emptyBlock('没有匹配的知识文章', '调整关键词，或把已解决的问题沉淀进来。')}
    </section>
  `;
}

function taskRow(task) {
  const overdue = task.due_date && task.due_date < today() && task.status !== 'done';
  return `
    <div class="task-row">
      <button class="task-check ${task.status === 'done' ? 'is-done' : ''}" data-action="mark-task-done" data-id="${task.id}" title="标记完成">${icon('check')}</button>
      <div class="task-main">
        <strong>${h(task.title)}</strong>
        <p>${h(task.description || '暂无任务说明')}</p>
        <div class="task-meta"><span>${h(phaseLabel(task.stage))}</span><span>${h(task.owner || '未分配')}</span><span class="${overdue ? 'is-overdue' : ''}">${h(task.due_date || '未设置日期')}</span>${task.evidence ? `<span>证据：${h(task.evidence)}</span>` : ''}</div>
      </div>
      ${statusBadge(task.status)}
      <button class="icon-button small" data-action="edit-task" data-id="${task.id}" title="编辑任务">${icon('edit')}</button>
    </div>
  `;
}

function checkTimelineRow(check) {
  return `
    <div class="timeline-row">
      <span class="timeline-icon">${icon(check.check_type === 'network' ? 'network' : check.check_type === 'database' ? 'database' : 'server')}</span>
      <div><strong>${h(check.target || checkLabel(check.check_type))}</strong><p>${h(check.summary)}</p></div>
      <div class="timeline-side">${statusBadge(check.status)}<time>${relativeTime(check.created_at)}</time></div>
    </div>
  `;
}

function checksTable(items) {
  if (!items.length) return emptyBlock('暂无检查记录', '执行环境预检或网络诊断后会自动留档。');
  return `<div class="data-table-wrap"><table class="data-table">
    <thead><tr><th>检查时间</th><th>类型</th><th>目标</th><th>结论</th><th>摘要</th><th>操作</th></tr></thead>
    <tbody>${items.map((item) => `<tr>
      <td>${formatDateTime(item.created_at)}</td>
      <td>${h(checkLabel(item.check_type))}</td>
      <td class="mono">${h(item.target)}</td>
      <td>${statusBadge(item.status)}</td>
      <td>${h(item.summary)}</td>
      <td><a class="text-button" href="/api/reports/check/${item.id}?format=html" target="_blank">查看报告</a></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function validationsTable(items) {
  if (!items.length) return emptyBlock('暂无数据校验模板', '添加“空值、重复值、关联缺失”等可重复执行的校验。');
  return `<div class="data-table-wrap"><table class="data-table">
    <thead><tr><th>校验名称</th><th>期望值</th><th>实际值</th><th>状态</th><th>最后执行</th><th>操作</th></tr></thead>
    <tbody>${items.map((item) => `<tr>
      <td><strong>${h(item.name)}</strong><small class="cell-note">${h(item.description || item.sql_text)}</small></td>
      <td class="mono">${h(item.expected_value)}</td>
      <td class="mono">${h(item.actual_value || '-')}</td>
      <td>${statusBadge(item.status)}</td>
      <td>${item.last_run_at ? formatDateTime(item.last_run_at) : '未执行'}</td>
      <td><button class="text-button" data-action="run-validation" data-id="${item.id}">${icon('play')}执行</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function handoverRow(item) {
  return `<div class="check-row">
    <button class="task-check ${item.status === 'done' ? 'is-done' : ''}" data-action="toggle-handover" data-id="${item.id}" title="切换完成状态">${icon('check')}</button>
    <div><strong>${h(item.title)}</strong><p>${h(item.evidence || '尚未填写证据')}</p><small>${h(item.owner || '未分配')} · ${h(item.due_date || '未设置日期')}</small></div>
    ${statusBadge(item.status)}
    <button class="icon-button small" data-action="edit-handover" data-id="${item.id}" title="编辑事项">${icon('edit')}</button>
  </div>`;
}

function metricCard(iconName, label, value, note, nav) {
  return `<article class="metric-card" ${nav ? `data-nav="${nav}" role="button" tabindex="0"` : ''}>
    <span class="metric-icon">${icon(iconName)}</span>
    <div><span>${h(label)}</span><strong>${h(value)}</strong><small>${h(note)}</small></div>
  </article>`;
}

function profileStrip(profile) {
  return `<section class="profile-strip panel">
    <span class="metric-icon">${icon(profile.kind === 'sqlite' ? 'db' : 'database')}</span>
    <div><strong>${h(profile.name)}</strong><p>${h(databaseKindLabel(profile.kind))} · ${h(profile.kind === 'sqlite' ? profile.file_path : `${profile.host || '-'}:${profile.port || databaseDefaultPort(profile.kind)}/${profile.database_name || '-'}`)}</p></div>
    <span class="password-note">密码仅随当前请求传入，不保存、不写日志、不进入报告</span>
  </section>`;
}

function renderQueryResult() {
  if (!state.queryResult) return `<div class="query-empty">${icon('database')}<strong>查询结果将显示在这里</strong><span>默认最多返回 200 行。</span></div>`;
  if (!state.queryResult.rows?.length) {
    return `<div class="query-summary"><strong>执行完成</strong><span>${h(state.queryResult.mode === 'read' ? '没有返回数据行' : '写操作已完成')}</span></div>`;
  }
  const columns = [...new Set(state.queryResult.rows.flatMap((row) => Object.keys(row)))];
  return `<div class="query-summary"><strong>返回 ${state.queryResult.rows.length} 行</strong><span>${state.queryResult.limited ? '结果已截断' : '查询完成'}</span></div>
    <div class="data-table-wrap query-result"><table class="data-table"><thead><tr>${columns.map((column) => `<th>${h(column)}</th>`).join('')}</tr></thead><tbody>${state.queryResult.rows.map((row) => `<tr>${columns.map((column) => `<td class="mono">${h(formatCell(row[column]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderProjectSwitcher() {
  projectSelect.innerHTML = state.projects.length
    ? state.projects.map((project) => `<option value="${project.id}" ${project.id === state.projectId ? 'selected' : ''}>${h(project.code)} · ${h(project.project_name)}</option>`).join('')
    : '<option value="">暂无项目</option>';
}

function renderEmptyPage(title, message, action, actionLabel) {
  app.innerHTML = `<section class="empty-page panel"><span>${icon('projects')}</span><h2>${h(title)}</h2><p>${h(message)}</p><button class="button primary" data-action="${action}">${icon('plus')}${h(actionLabel)}</button></section>`;
}

async function handleClick(event) {
  const nav = event.target.closest('[data-nav]');
  const explicitAction = event.target.closest('[data-action]');
  const modalContent = event.target.closest('[data-modal-content]');
  if (modalContent && (!explicitAction || !modalContent.contains(explicitAction))) return;
  if (nav) {
    await navigate(nav.dataset.nav);
    return;
  }
  const target = explicitAction;
  if (!target) return;
  const { action, id } = target.dataset;
  try {
    if (action === 'close-modal') closeModal();
    if (action === 'new-project') openProjectModal();
    if (action === 'edit-project') openProjectModal(state.project);
    if (action === 'new-task') openTaskModal(null, target.dataset.stage);
    if (action === 'edit-task') openTaskModal(state.project.tasks.find((task) => task.id === Number(id)));
    if (action === 'mark-task-done') {
      await api(`/api/tasks/${id}`, { method: 'PATCH', body: { status: 'done' } });
      showToast('任务已标记完成');
      await loadCurrentView(true);
    }
    if (action === 'select-project') {
      state.projectId = Number(id);
      state.project = null;
      await loadCurrentView(true);
    }
    if (action === 'new-profile') openProfileModal();
    if (action === 'new-validation') openValidationModal();
    if (action === 'test-profile') await testProfile();
    if (action === 'load-schema') await loadSchema();
    if (action === 'select-table') {
      state.selectedTable = target.dataset.table;
      renderDatabase();
    }
    if (action === 'export-table') await exportTable();
    if (action === 'run-validation') await runValidation(Number(id));
    if (action === 'new-case') openCaseModal();
    if (action === 'select-case') {
      state.selectedCase = await api(`/api/cases/${id}`);
      renderCases();
    }
    if (action === 'edit-case') openCaseModal(await api(`/api/cases/${id}`));
    if (action === 'convert-case') {
      const article = await api(`/api/cases/${id}/knowledge`, { method: 'POST', body: {} });
      showToast(`已创建知识文章：${article.title}`);
      await loadCurrentView(true);
    }
    if (action === 'new-handover') openHandoverModal(null, target.dataset.category);
    if (action === 'edit-handover') openHandoverModal(state.handover.find((item) => item.id === Number(id)));
    if (action === 'toggle-handover') {
      const item = state.handover.find((entry) => entry.id === Number(id));
      await api(`/api/handover/${state.projectId}/${id}`, { method: 'PATCH', body: { status: item.status === 'done' ? 'pending' : 'done' } });
      await loadCurrentView(true);
    }
    if (action === 'new-knowledge') openKnowledgeModal();
    if (action === 'view-knowledge') openKnowledgeArticle(await api(`/api/knowledge/${id}`));
    if (action === 'open-case') {
      state.view = 'cases';
      state.selectedCase = await api(`/api/cases/${id}`);
      updateViewChrome();
      await loadCurrentView();
    }
  } catch (error) {
    showError(error);
  }
}

async function handleSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const formId = form.getAttribute('id') || '';
  event.preventDefault();
  const data = formData(form);
  try {
    if (formId === 'project-form') await submitProject(form, data);
    if (formId === 'task-form') await submitTask(form, data);
    if (formId === 'system-check-form') await submitSystemCheck(data);
    if (formId === 'network-check-form') await submitNetworkCheck(data);
    if (formId === 'profile-form') await submitProfile(data);
    if (formId === 'sql-form') await submitSql(data);
    if (formId === 'validation-form') await submitValidation(data);
    if (formId === 'case-form') await submitCase(form, data);
    if (formId === 'case-event-form') await submitCaseEvent(data);
    if (formId === 'handover-form') await submitHandover(form, data);
    if (formId === 'knowledge-form') await submitKnowledge(data);
    if (formId === 'knowledge-search-form') {
      state.knowledgeQuery = String(data.q || '').trim();
      await loadKnowledge();
    }
  } catch (error) {
    showError(error);
  }
}

async function submitProject(form, data) {
  const id = data.id;
  const payload = {
    code: data.code,
    projectName: data.projectName,
    customer: data.customer,
    productName: data.productName,
    environment: data.environment,
    phase: data.phase,
    status: data.status,
    owner: data.owner,
    customerContact: data.customerContact,
    goLiveDate: data.goLiveDate,
    notes: data.notes
  };
  const saved = id ? await api(`/api/projects/${id}`, { method: 'PATCH', body: payload }) : await api('/api/projects', { method: 'POST', body: payload });
  state.projectId = saved.id;
  state.project = null;
  closeModal();
  showToast(id ? '项目资料已更新' : '实施项目已创建');
  await loadCurrentView(true);
}

async function submitTask(form, data) {
  const id = data.id;
  const projectId = Number(data.projectId);
  const payload = {
    stage: data.stage,
    title: data.title,
    description: data.description,
    status: data.status,
    owner: data.owner,
    dueDate: data.dueDate,
    evidence: data.evidence
  };
  if (id) await api(`/api/tasks/${id}`, { method: 'PATCH', body: payload });
  else await api(`/api/projects/${projectId}/tasks`, { method: 'POST', body: payload });
  closeModal();
  showToast(id ? '任务已更新' : '任务已添加');
  await loadCurrentView(true);
}

async function submitSystemCheck(data) {
  const result = await api('/api/checks/system', { method: 'POST', body: { ...data, projectId: state.projectId } });
  closeModal();
  showToast(`系统预检完成：${STATUS_LABELS[result.status] || result.status}`);
  await loadCurrentView(true);
}

async function submitNetworkCheck(data) {
  const result = await api('/api/checks/network', {
    method: 'POST',
    body: { ...data, projectId: state.projectId, port: data.port || undefined }
  });
  showToast(`网络检查完成：${STATUS_LABELS[result.status] || result.status}`);
  await loadCurrentView(true);
}

async function submitProfile(data) {
  await api('/api/db/profiles', {
    method: 'POST',
    body: { ...data, projectId: state.projectId, port: data.port || null }
  });
  closeModal();
  showToast('数据库连接已保存，密码未落库');
  await loadCurrentView(true);
}

async function submitSql(data) {
  const result = await api('/api/db/query', {
    method: 'POST',
    body: {
      profileId: data.profileId,
      password: document.querySelector('#db-password')?.value || '',
      sqlText: data.sqlText,
      allowWrite: data.allowWrite === 'on',
      confirmPhrase: data.confirmPhrase
    }
  });
  state.queryResult = result;
  showToast(`SQL 执行完成，返回 ${result.rows.length} 行`);
  renderDatabase();
}

async function submitValidation(data) {
  await api('/api/db/validations', {
    method: 'POST',
    body: { ...data, projectId: state.projectId, profileId: state.profileId }
  });
  closeModal();
  showToast('数据校验模板已创建');
  await loadCurrentView(true);
}

async function submitCase(form, data) {
  const id = data.id;
  const payload = {
    projectId: state.projectId,
    title: data.title,
    customer: data.customer,
    symptom: data.symptom,
    impact: data.impact,
    priority: data.priority,
    status: data.status,
    category: data.category,
    assignee: data.assignee,
    rootCause: data.rootCause,
    resolution: data.resolution,
    nextAction: data.nextAction
  };
  const saved = id ? await api(`/api/cases/${id}`, { method: 'PATCH', body: payload }) : await api('/api/cases', { method: 'POST', body: payload });
  state.selectedCase = await api(`/api/cases/${saved.id}`);
  closeModal();
  showToast(id ? '问题单已更新' : '问题单已创建');
  await loadCurrentView(true);
}

async function submitCaseEvent(data) {
  const caseId = Number(data.caseId);
  await api(`/api/cases/${caseId}/events`, {
    method: 'POST',
    body: { eventType: data.eventType, title: data.title, detail: data.detail }
  });
  state.selectedCase = await api(`/api/cases/${caseId}`);
  showToast('处理记录已添加');
  renderCases();
}

async function submitHandover(form, data) {
  const id = data.id;
  const payload = {
    category: data.category,
    title: data.title,
    status: data.status,
    owner: data.owner,
    dueDate: data.dueDate,
    evidence: data.evidence
  };
  if (id) await api(`/api/handover/${state.projectId}/${id}`, { method: 'PATCH', body: payload });
  else await api(`/api/handover/${state.projectId}`, { method: 'POST', body: payload });
  closeModal();
  showToast(id ? '交付事项已更新' : '交付事项已添加');
  await loadCurrentView(true);
}

async function submitKnowledge(data) {
  await api('/api/knowledge', { method: 'POST', body: data });
  closeModal();
  showToast('知识文章已创建');
  await loadCurrentView(true);
}

async function testProfile() {
  const profileId = state.profileId;
  if (!profileId) throw new Error('请选择数据库连接');
  const result = await api('/api/db/test', {
    method: 'POST',
    body: { profileId, password: document.querySelector('#db-password')?.value || '' }
  });
  openModal({
    title: '数据库连接测试通过',
    content: `<div class="result-stack">
      ${resultBox('healthy', result.detail, `${result.tableCount} 个表或视图`)}
      <div class="mini-table">${result.tables.map((table) => `<div><strong>${h(table.name)}</strong><span>${h(table.type)}</span><small>${table.rowCount === null ? '--' : number(table.rowCount)} 行</small></div>`).join('')}</div>
    </div>`
  });
}

async function loadSchema() {
  const result = await api('/api/db/schema', {
    method: 'POST',
    body: { profileId: state.profileId, password: document.querySelector('#db-password')?.value || '' }
  });
  state.schema = result.items;
  state.selectedTable = state.schema[0]?.name || '';
  showToast(`已读取 ${state.schema.length} 个表或视图`);
  renderDatabase();
}

async function exportTable() {
  const response = await fetch('/api/db/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId: state.profileId,
      password: document.querySelector('#db-password')?.value || '',
      table: state.selectedTable,
      limit: 5000
    })
  });
  if (!response.ok) throw new Error((await response.json()).error || '导出失败');
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${state.selectedTable}-${today()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('CSV 已导出');
}

async function runValidation(id) {
  const result = await api('/api/db/validate', {
    method: 'POST',
    body: { validationId: id, password: document.querySelector('#db-password')?.value || '' }
  });
  showToast(result.message);
  await loadCurrentView(true);
}

function openProjectModal(project = null) {
  openModal({
    title: project ? '编辑项目资料' : '创建实施项目',
    content: `<form id="project-form" class="form-grid">
      <input type="hidden" name="id" value="${project?.id || ''}">
      ${field('项目编号', `<input name="code" value="${escapeAttr(project?.code || '')}" placeholder="留空自动生成">`)}
      ${field('项目名称 *', `<input name="projectName" required value="${escapeAttr(project?.project_name || '')}" placeholder="例如：华东零售 ERP 门店上线">`)}
      ${field('客户名称 *', `<input name="customer" required value="${escapeAttr(project?.customer || '')}">`)}
      ${field('产品名称', `<input name="productName" value="${escapeAttr(project?.product_name || '')}">`)}
      ${field('环境', `<input name="environment" value="${escapeAttr(project?.environment || '生产环境')}">`)}
      ${field('当前阶段', `<select name="phase">${options(Object.fromEntries(PHASES), project?.phase || 'requirement')}</select>`)}
      ${field('负责人', `<input name="owner" value="${escapeAttr(project?.owner || '')}">`)}
      ${field('客户联系人', `<input name="customerContact" value="${escapeAttr(project?.customer_contact || '')}">`)}
      ${field('计划上线日期', `<input type="date" name="goLiveDate" value="${escapeAttr(project?.go_live_date || '')}">`)}
      ${field('项目状态', `<select name="status">${options({ active: '进行中', blocked: '已阻塞', completed: '已完成', archived: '已归档' }, project?.status || 'active')}</select>`)}
      ${field('项目说明', `<textarea name="notes" rows="3">${h(project?.notes || '')}</textarea>`, true)}
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存项目</button></div>
    </form>`
  });
}

function openTaskModal(task = null, stage = '') {
  if (!state.project) return;
  openModal({
    title: task ? '更新实施任务' : '新增实施任务',
    content: `<form id="task-form" class="form-grid">
      <input type="hidden" name="id" value="${task?.id || ''}">
      <input type="hidden" name="projectId" value="${state.projectId}">
      ${field('实施阶段', `<select name="stage">${options(Object.fromEntries(PHASES), task?.stage || stage || 'requirement')}</select>`)}
      ${field('任务名称 *', `<input name="title" required value="${escapeAttr(task?.title || '')}" placeholder="例如：完成数据库连接测试">`)}
      ${field('状态', `<select name="status">${options({ pending: '待处理', in_progress: '处理中', blocked: '已阻塞', done: '已完成' }, task?.status || 'pending')}</select>`)}
      ${field('负责人', `<input name="owner" value="${escapeAttr(task?.owner || state.project.owner || '')}">`)}
      ${field('计划日期', `<input type="date" name="dueDate" value="${escapeAttr(task?.due_date || '')}">`)}
      ${field('执行证据', `<input name="evidence" value="${escapeAttr(task?.evidence || '')}" placeholder="例如：环境预检报告 CHECK-003">`)}
      ${field('任务说明', `<textarea name="description" rows="3">${h(task?.description || '')}</textarea>`, true)}
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存任务</button></div>
    </form>`
  });
}

function openProfileModal() {
  openModal({
    title: '新增数据库连接',
    content: `<form id="profile-form" class="form-grid">
      ${field('连接名称 *', '<input name="name" required placeholder="例如：客户生产 MySQL">')}
      ${field('数据库类型', `<select name="kind" id="profile-kind">${options({ sqlite: 'SQLite', mysql: 'MySQL', sqlserver: 'SQL Server' }, 'mysql')}</select>`)}
      ${field('主机地址', '<input name="host" placeholder="例如：10.20.1.15">')}
      ${field('端口', '<input type="number" name="port" placeholder="MySQL 3306 / SQL Server 1433">')}
      ${field('数据库名', '<input name="databaseName" placeholder="例如：erp_prod">')}
      ${field('用户名', '<input name="username" placeholder="数据库账号">')}
      ${field('SQLite 文件路径', '<input name="filePath" placeholder="例如：demo-erp.db 或绝对路径">', true)}
      <p class="form-note span-2">数据库密码不会保存到项目数据。执行测试、查询和校验时，请在页面顶部临时输入。</p>
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存连接</button></div>
    </form>`
  });
}

function openValidationModal() {
  openModal({
    title: '新增数据校验模板',
    content: `<form id="validation-form" class="form-grid">
      ${field('校验名称 *', '<input name="name" required placeholder="例如：门店区域编码完整性">')}
      ${field('期望值 *', '<input name="expectedValue" required value="0" placeholder="SQL 第一列结果应等于该值">')}
      ${field('校验 SQL *', '<textarea name="sqlText" rows="5" class="code-editor" required>SELECT COUNT(*) AS invalid_count FROM stores WHERE region_code IS NULL;</textarea>', true)}
      ${field('说明', '<textarea name="description" rows="2" placeholder="说明校验目的和异常处理方式"></textarea>', true)}
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存校验</button></div>
    </form>`,
    wide: true
  });
}

function openCaseModal(item = null) {
  openModal({
    title: item ? '更新问题单' : '新建问题单',
    wide: true,
    content: `<form id="case-form" class="form-grid">
      <input type="hidden" name="id" value="${item?.id || ''}">
      ${field('问题标题 *', `<input name="title" required value="${escapeAttr(item?.title || '')}" placeholder="一句话概括客户现象">`)}
      ${field('客户', `<input name="customer" value="${escapeAttr(item?.customer || state.project?.customer || '')}">`)}
      ${field('优先级', `<select name="priority">${options({ critical: 'P0 紧急', high: 'P1 高', medium: 'P2 中', low: 'P3 低' }, item?.priority || 'medium')}</select>`)}
      ${field('状态', `<select name="status">${options({ open: '待处理', in_progress: '处理中', waiting: '待客户', resolved: '已解决', closed: '已关闭' }, item?.status || 'open')}</select>`)}
      ${field('问题分类', `<input name="category" value="${escapeAttr(item?.category || '技术支持')}">`)}
      ${field('负责人', `<input name="assignee" value="${escapeAttr(item?.assignee || state.project?.owner || '')}">`)}
      ${field('问题现象 *', `<textarea name="symptom" rows="3" required>${h(item?.symptom || '')}</textarea>`, true)}
      ${field('影响范围', `<textarea name="impact" rows="2">${h(item?.impact || '')}</textarea>`, true)}
      ${field('根本原因', `<textarea name="rootCause" rows="2">${h(item?.root_cause || '')}</textarea>`, true)}
      ${field('解决方案', `<textarea name="resolution" rows="3">${h(item?.resolution || '')}</textarea>`, true)}
      ${field('后续跟进', `<textarea name="nextAction" rows="2">${h(item?.next_action || '')}</textarea>`, true)}
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存问题单</button></div>
    </form>`
  });
}

function openHandoverModal(item = null, category = 'acceptance') {
  openModal({
    title: item ? '编辑交付事项' : '新增交付事项',
    content: `<form id="handover-form" class="form-grid">
      <input type="hidden" name="id" value="${item?.id || ''}">
      ${field('类别', `<select name="category">${options(CATEGORY_LABELS, item?.category || category)}</select>`)}
      ${field('事项名称 *', `<input name="title" required value="${escapeAttr(item?.title || '')}">`)}
      ${field('状态', `<select name="status">${options({ pending: '待处理', in_progress: '处理中', blocked: '已阻塞', done: '已完成' }, item?.status || 'pending')}</select>`)}
      ${field('负责人', `<input name="owner" value="${escapeAttr(item?.owner || state.project?.owner || '')}">`)}
      ${field('计划日期', `<input type="date" name="dueDate" value="${escapeAttr(item?.due_date || '')}">`)}
      ${field('执行证据', `<textarea name="evidence" rows="3" placeholder="记录签到、签字、截图或文档名称">${h(item?.evidence || '')}</textarea>`, true)}
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存事项</button></div>
    </form>`
  });
}

function openKnowledgeModal() {
  openModal({
    title: '新增知识文章',
    wide: true,
    content: `<form id="knowledge-form" class="form-grid">
      ${field('标题 *', '<input name="title" required placeholder="例如：门店终端无法连接结算服务">')}
      ${field('分类', '<input name="category" value="技术支持">')}
      ${field('问题现象 *', '<textarea name="symptom" rows="3" required></textarea>', true)}
      ${field('解决方案 *', '<textarea name="solution" rows="6" required placeholder="建议按检查顺序记录命令、判断标准和处理步骤"></textarea>', true)}
      ${field('标签', '<input name="tags" placeholder="用逗号分隔，例如：MySQL,连接池,超时">', true)}
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">保存文章</button></div>
    </form>`
  });
}

function openKnowledgeArticle(article) {
  openModal({
    title: article.title,
    wide: true,
    content: `<div class="article-detail">
      <div class="article-meta"><span>${h(article.category)}</span><small>${number(article.views)} 次查看 · ${formatDateTime(article.created_at)}</small></div>
      <section><h4>问题现象</h4><p>${h(article.symptom)}</p></section>
      <section><h4>解决方案</h4><p class="pre-line">${h(article.solution)}</p></section>
      <div class="tag-row">${String(article.tags || '').split(',').filter(Boolean).map((tag) => `<span>${h(tag.trim())}</span>`).join('')}</div>
    </div>`
  });
}

function openModal({ title, content, wide = false }) {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal">
    <section class="modal-card ${wide ? 'is-wide' : ''}" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}" data-modal-content>
      <header><div><span>DeployMate</span><h2>${h(title)}</h2></div><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('x')}</button></header>
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
  closeSidebar();
  await loadCurrentView();
}

function updateViewChrome() {
  const meta = VIEW_META[state.view];
  pageTitle.textContent = meta.title;
  pageEyebrow.textContent = meta.eyebrow;
  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.nav === state.view);
  });
}

async function checkHealth() {
  const indicator = document.querySelector('#sidebar-status-dot');
  const label = document.querySelector('#sidebar-status-label');
  const apiStatus = document.querySelector('#api-status');
  try {
    const result = await api('/api/health');
    indicator.className = 'status-dot is-online';
    label.textContent = '本地服务正常';
    apiStatus.classList.add('is-online');
  } catch {
    indicator.className = 'status-dot is-error';
    label.textContent = '服务不可用';
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

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function options(items, selected) {
  return Object.entries(items).map(([value, label]) => `<option value="${escapeAttr(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${h(label)}</option>`).join('');
}

function field(label, control, span = false) {
  return `<label class="field ${span ? 'span-2' : ''}"><span>${label}</span>${control}</label>`;
}

function fact(label, value) {
  return `<div><dt>${h(label)}</dt><dd>${h(value || '-')}</dd></div>`;
}

function resultBox(status, title, detail) {
  return `<div class="result-box ${status}">${icon(status === 'healthy' ? 'check' : 'alert')}<div><strong>${h(title)}</strong><p>${h(detail)}</p></div></div>`;
}

function statusBadge(status, type = 'status') {
  const key = type === 'priority' ? status : status;
  const label = type === 'priority' ? (PRIORITY_LABELS[key] || key) : (STATUS_LABELS[key] || key || '-');
  return `<span class="badge ${type} status-${escapeAttr(status)}">${h(label)}</span>`;
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
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.settings}</svg>`;
}

function phaseLabel(value) {
  return Object.fromEntries(PHASES)[value] || value || '-';
}

function checkLabel(value) {
  return { system: '环境预检', network: '网络检查', database: '数据库连接', app: '应用健康' }[value] || value || '检查';
}

function databaseKindLabel(value) {
  return { sqlite: 'SQLite', mysql: 'MySQL', sqlserver: 'SQL Server' }[value] || value;
}

function databaseDefaultPort(value) {
  return value === 'mysql' ? 3306 : value === 'sqlserver' ? 1433 : '';
}

function handoverGroupTitle(category) {
  return {
    account: '账号与角色',
    training: '培训与签到',
    acceptance: '功能验收与签字',
    document: '部署与运维文档'
  }[category];
}

function eventIcon(type) {
  return icon({ diagnostic: 'network', validation: 'database', resolution: 'check', knowledge: 'book', contact: 'cases' }[type] || 'clock', 16);
}

function defaultSql(profile) {
  if (!profile) return 'SELECT 1;';
  if (profile.kind === 'sqlite') return 'SELECT * FROM stores ORDER BY store_code LIMIT 50;';
  return profile.kind === 'mysql'
    ? 'SELECT NOW() AS checked_at, CURRENT_USER() AS current_user;'
    : 'SELECT GETDATE() AS checked_at, SUSER_SNAME() AS current_user;';
}

function memoryStatus(value) {
  return Number(value) <= 85 ? 'healthy' : 'warning';
}

function formatCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatBytes(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let current = numberValue;
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current.toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function humanDuration(seconds) {
  const value = Number(seconds) || 0;
  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600);
  if (days) return `${days} 天 ${hours} 小时`;
  const minutes = Math.floor((value % 3600) / 60);
  return `${hours} 小时 ${minutes} 分钟`;
}

function relativeTime(value) {
  if (!value) return '-';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '-';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false });
}

function number(value) {
  return new Intl.NumberFormat('zh-CN').format(Number(value) || 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function h(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

function toggleSidebar() {
  const next = !sidebar.classList.contains('is-open');
  sidebar.classList.toggle('is-open', next);
  document.querySelector('#menu-toggle').setAttribute('aria-expanded', String(next));
}

function closeSidebar() {
  sidebar.classList.remove('is-open');
  document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
}

function initScrollCompanion() {
  if (!scrollCompanion || !companionProgress || !companionDot || !companionNode) return;
  const scrollElement = document.querySelector('.workspace');
  if (!scrollElement) return;
  let scheduled = false;

  const update = () => {
    const maxScroll = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
    const progress = maxScroll ? Math.min(1, scrollElement.scrollTop / maxScroll) : 0;
    companionProgress.style.height = `${progress * 100}%`;
    companionDot.style.top = `${progress * 100}%`;
    companionNode.style.top = `${progress * 100}%`;
    scrollCompanion.classList.toggle('is-visible', maxScroll > 120 && scrollElement.scrollTop > 80);
    scrollCompanion.classList.toggle('is-scrollable', maxScroll > 120);
    scheduled = false;
  };

  scrollElement.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  companionNode.addEventListener('click', () => scrollElement.scrollTo({ top: 0, behavior: 'smooth' }));
  const observer = new MutationObserver(update);
  observer.observe(app, { childList: true, subtree: true });
  update();
}
