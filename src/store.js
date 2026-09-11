import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import DatabaseSync from 'better-sqlite3';

const DEFAULT_DB_PATH = resolve(process.env.DB_PATH || 'data/deploymate.db');
const PROJECT_STAGES = [
  ['requirement', '需求确认'],
  ['preflight', '环境预检'],
  ['deployment', '安装部署'],
  ['data', '数据核验'],
  ['integration', '联调测试'],
  ['training', '用户培训'],
  ['acceptance', '项目验收'],
  ['review', '上线复盘']
];

export function createDatabase(dbPath = DEFAULT_DB_PATH) {
  mkdirSync(dirname(dbPath), { recursive: true });
  ensureDemoDatabase(dbPath);
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  migrate(db);
  seed(db);
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      project_name TEXT NOT NULL,
      customer TEXT NOT NULL,
      product_name TEXT NOT NULL DEFAULT '',
      environment TEXT NOT NULL DEFAULT '生产环境',
      phase TEXT NOT NULL DEFAULT 'requirement',
      status TEXT NOT NULL DEFAULT 'active',
      owner TEXT NOT NULL DEFAULT '',
      customer_contact TEXT NOT NULL DEFAULT '',
      go_live_date TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS project_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      stage TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      sort_order INTEGER NOT NULL DEFAULT 0,
      owner TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      evidence TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS check_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      check_type TEXT NOT NULL,
      target TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      details_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS check_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL REFERENCES check_runs(id) ON DELETE CASCADE,
      item_key TEXT NOT NULL,
      label TEXT NOT NULL,
      expected_value TEXT NOT NULL DEFAULT '',
      actual_value TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS database_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      host TEXT NOT NULL DEFAULT '',
      port INTEGER,
      database_name TEXT NOT NULL DEFAULT '',
      username TEXT NOT NULL DEFAULT '',
      file_path TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS data_validations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      profile_id INTEGER REFERENCES database_profiles(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sql_text TEXT NOT NULL,
      expected_value TEXT NOT NULL DEFAULT '0',
      actual_value TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      last_run_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS support_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_no TEXT NOT NULL UNIQUE,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      customer TEXT NOT NULL DEFAULT '',
      symptom TEXT NOT NULL DEFAULT '',
      impact TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      category TEXT NOT NULL DEFAULT '技术支持',
      assignee TEXT NOT NULL DEFAULT '',
      root_cause TEXT NOT NULL DEFAULT '',
      resolution TEXT NOT NULL DEFAULT '',
      next_action TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      resolved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS case_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS handover_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      owner TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      evidence TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      symptom TEXT NOT NULL,
      solution TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '',
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_links (
      article_id INTEGER NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      case_id INTEGER REFERENCES support_cases(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (article_id, project_id, case_id)
    );
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS diagnostics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      check_type TEXT NOT NULL,
      target TEXT NOT NULL,
      status TEXT NOT NULL,
      latency_ms INTEGER,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_checks_project ON check_runs(project_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_cases_project ON support_cases(project_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_case ON case_events(case_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_handover_project ON handover_items(project_id, id);
    CREATE INDEX IF NOT EXISTS idx_validation_project ON data_validations(project_id, id);
  `);
}

function seed(db) {
  const count = Number(db.prepare('SELECT COUNT(*) AS count FROM projects').get().count);
  if (count > 0) return seedKnowledge(db);

  const now = Date.now();
  const at = (hoursAgo) => new Date(now - hoursAgo * 3600000).toISOString();
  const day = (offset) => new Date(now + offset * 86400000).toISOString().slice(0, 10);
  const project = db.prepare(`
    INSERT INTO projects (
      code, project_name, customer, product_name, environment, phase, status,
      owner, customer_contact, go_live_date, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'DM-2601', '华南零售 ERP 门店上线', '华南零售集团', '门店经营 ERP',
    '生产环境', 'integration', 'active', '陈工', '李经理 · 13800000000',
    day(18), '首批 12 家门店上线，重点关注主数据、结算接口和收银终端网络。', at(480), at(1)
  );
  const projectId = Number(project.lastInsertRowid);
  const insertTask = db.prepare(`
    INSERT INTO project_tasks (
      project_id, stage, title, description, status, sort_order, owner, due_date, evidence, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  [
    ['requirement', '确认门店上线范围和验收标准', '整理门店清单、角色、数据范围和接口清单。', 'done', 1, '陈工', day(-8), '需求确认单 V1.2'],
    ['preflight', '完成服务器与收银终端环境预检', '检查 Windows Server、门店终端、端口和依赖组件。', 'done', 2, '陈工', day(-5), '环境预检报告'],
    ['deployment', '部署应用并完成基础参数配置', '安装应用并配置数据库、时区、日志和服务。', 'done', 3, '周工', day(-2), '部署记录 DEP-0921'],
    ['data', '核对门店、商品和期初库存主数据', '执行数据量、空值、重复值和关联关系检查。', 'in_progress', 4, '陈工', day(2), '仍有 2 条门店区域编码异常'],
    ['integration', '完成结算接口和会员接口联调', '验证支付、退款、会员积分和异常回滚。', 'in_progress', 5, '林工', day(5), '支付接口成功率 99.7%'],
    ['training', '组织店长与收银员操作培训', '覆盖开班、收银、退款、交班和常见故障。', 'pending', 6, '陈工', day(9), ''],
    ['acceptance', '完成门店验收与签字确认', '逐店验证关键场景并记录遗留问题。', 'pending', 7, '王工', day(15), ''],
    ['review', '上线复盘并沉淀知识库', '汇总上线问题、根因和后续优化项。', 'pending', 8, '陈工', day(20), '']
  ].forEach((row) => insertTask.run(projectId, ...row, at(120), at(1)));

  const profile = db.prepare(`
    INSERT INTO database_profiles (
      project_id, name, kind, host, port, database_name, username, file_path, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const sqliteProfileId = Number(profile.run(projectId, '内置 ERP 演示库', 'sqlite', '', null, 'demo-erp', '', 'demo-erp.db', at(300), at(300)).lastInsertRowid);
  profile.run(projectId, 'MySQL 演示环境', 'mysql', '127.0.0.1', 3307, 'deploymate_demo', 'deploymate', '', at(300), at(300));

  const validation = db.prepare(`
    INSERT INTO data_validations (
      project_id, profile_id, name, description, sql_text, expected_value, actual_value, status, last_run_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  [
    ['门店区域编码完整性', '区域编码不能为空。', 'SELECT COUNT(*) AS invalid_count FROM stores WHERE region_code IS NULL OR TRIM(region_code) = \'\'', '0', '2', 'failed', at(4)],
    ['订单金额非负', '订单金额不能小于 0。', 'SELECT COUNT(*) AS invalid_count FROM orders WHERE total_amount < 0', '0', '0', 'healthy', at(5)],
    ['门店订单关联完整性', '订单门店必须存在。', 'SELECT COUNT(*) AS invalid_count FROM orders o LEFT JOIN stores s ON s.store_code = o.store_code WHERE s.store_code IS NULL', '0', '0', 'healthy', at(5)]
  ].forEach((row) => validation.run(projectId, sqliteProfileId, ...row, at(120), at(5)));

  const item = db.prepare(`
    INSERT INTO support_cases (
      case_no, project_id, title, customer, symptom, impact, priority, status,
      category, assignee, root_cause, resolution, next_action, created_at, updated_at, resolved_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const caseOne = Number(item.run('DM-CASE-001', projectId, '部分门店收银终端无法连接结算服务', '华南零售集团', '3 家门店在高峰期间歇性支付超时。', '影响高峰期收银。', 'critical', 'in_progress', '网络故障', '陈工', '', '', '检查防火墙会话数和运营商链路。', at(6), at(1), null).lastInsertRowid);
  const caseTwo = Number(item.run('DM-CASE-002', projectId, '门店主数据导入后缺少区域编码', '华南零售集团', '2 条门店数据区域编码为空。', '影响区域日报。', 'high', 'waiting', '数据问题', '林工', '客户 Excel 格式不一致。', '已整理错误清单。', '等待客户返回修订数据。', at(22), at(3), null).lastInsertRowid);
  const caseThree = Number(item.run('DM-CASE-003', projectId, '应用服务启动后日志目录权限不足', '华南零售集团', 'Windows 服务启动后立即退出。', '测试环境部署中断。', 'high', 'resolved', '服务部署', '周工', '服务账号没有日志目录写权限。', '授权并重启服务。', '观察一个运行日。', at(48), at(30), at(30)).lastInsertRowid);
  const event = db.prepare('INSERT INTO case_events (case_id, event_type, title, detail, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  event.run(caseOne, 'created', '问题受理', '客户反馈 3 家门店结算超时。', '{}', at(6));
  event.run(caseOne, 'diagnostic', 'TCP 端口检查', '443 端口可连接，高峰期延迟超过 2000ms。', '{}', at(5));
  event.run(caseTwo, 'validation', '执行数据校验', '发现 2 条区域编码为空。', '{}', at(20));
  event.run(caseThree, 'resolution', '问题解决', '调整日志目录权限并重启服务。', '{}', at(30));

  const handover = db.prepare(`
    INSERT INTO handover_items (project_id, category, title, status, owner, due_date, evidence, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  [
    ['account', '确认管理员、店长和收银员角色', 'done', '陈工', day(-1), '角色矩阵已确认。'],
    ['training', '准备收银操作培训材料', 'in_progress', '陈工', day(6), 'PPT 初稿完成。'],
    ['training', '完成培训签到', 'pending', '陈工', day(9), ''],
    ['acceptance', '完成关键业务场景验收', 'pending', '王工', day(15), ''],
    ['acceptance', '客户负责人签字确认', 'pending', '王工', day(15), ''],
    ['document', '整理部署和运维手册', 'in_progress', '周工', day(10), '完成 70%。']
  ].forEach((row) => handover.run(projectId, ...row, at(120), at(2)));

  const check = db.prepare('INSERT INTO check_runs (project_id, check_type, target, status, summary, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  check.run(projectId, 'network', 'gateway.example.com:443', 'warning', 'TCP 可连接，高峰期延迟超过预期', JSON.stringify([{ key: 'tcp', label: 'TCP 连接', expected: '可连接且延迟 < 500ms', actual: '可连接，峰值 2140ms', status: 'warning', detail: '检查防火墙会话数。' }]), at(5));
  check.run(projectId, 'database', '内置 ERP 演示库', 'healthy', '数据库连接和基础查询正常', JSON.stringify([{ key: 'connection', label: '连接测试', expected: '连接成功', actual: '12ms', status: 'healthy', detail: '' }]), at(4));
  addActivity(db, 'project.seed', 'project', projectId, 'DeployMate 演示实施项目已初始化', at(1));
  seedKnowledge(db);
}

function seedKnowledge(db) {
  if (Number(db.prepare('SELECT COUNT(*) AS count FROM knowledge_articles').get().count) > 0) return;
  const now = Date.now();
  const at = (hoursAgo) => new Date(now - hoursAgo * 3600000).toISOString();
  const insert = db.prepare('INSERT INTO knowledge_articles (title, category, symptom, solution, tags, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  [
    ['门店终端无法连接结算服务', '网络故障', '收银终端高峰期间歇性支付超时。', '依次检查 DNS、TCP、链路延迟、防火墙会话数和服务端日志。', '门店,结算,网络,TCP', 31, at(120)],
    ['Windows服务无法写入日志目录', '服务部署', '服务启动后立即退出，日志提示拒绝访问。', '检查运行账号和目录 ACL，授权后重启并观察日志。', 'Windows,服务,权限,日志', 22, at(180)],
    ['MySQL备份文件不完整', '数据库', '备份任务成功但文件异常小。', '检查空间、权限、超时和错误日志，恢复前在测试库验证。', 'MySQL,备份,恢复', 25, at(240)],
    ['门店主数据导入校验顺序', '数据交付', '导入后出现空值、重复和关联缺失。', '先查完整性，再查唯一性，最后查主外键关联。', '数据校验,SQL,主数据', 18, at(90)]
  ].forEach((row) => insert.run(...row));
}

function ensureDemoDatabase(appDbPath) {
  const demoPath = resolve(dirname(appDbPath), 'demo-erp.db');
  const demo = new DatabaseSync(demoPath);
  demo.exec(`
    CREATE TABLE IF NOT EXISTS stores (store_code TEXT PRIMARY KEY, store_name TEXT NOT NULL, region_code TEXT, status TEXT NOT NULL DEFAULT 'active');
    CREATE TABLE IF NOT EXISTS orders (order_no TEXT PRIMARY KEY, store_code TEXT NOT NULL, total_amount REAL NOT NULL, order_status TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS inventory (store_code TEXT NOT NULL, sku TEXT NOT NULL, quantity INTEGER NOT NULL, PRIMARY KEY (store_code, sku));
    CREATE TABLE IF NOT EXISTS sync_log (id INTEGER PRIMARY KEY AUTOINCREMENT, store_code TEXT NOT NULL, sync_type TEXT NOT NULL, status TEXT NOT NULL, synced_at TEXT NOT NULL);
  `);
  if (Number(demo.prepare('SELECT COUNT(*) AS count FROM stores').get().count) === 0) {
    const store = demo.prepare('INSERT INTO stores (store_code, store_name, region_code, status) VALUES (?, ?, ?, ?)');
    [
      ['S001', '天河旗舰店', 'GZ-01', 'active'], ['S002', '番禺万象店', 'GZ-02', 'active'],
      ['S003', '海珠广场店', 'GZ-03', 'active'], ['S004', '越秀北京路店', 'GZ-04', 'active'],
      ['S005', '白云新城店', 'GZ-05', 'active'], ['S006', '荔湾上下九店', 'GZ-06', 'active'],
      ['S007', '黄埔科学城店', 'GZ-07', 'active'], ['S008', '南沙万达店', 'GZ-08', 'active'],
      ['S009', '增城广场店', null, 'active'], ['S010', '从化街口店', null, 'active'],
      ['S011', '花都融创店', 'GZ-11', 'active'], ['S012', '南沙湾店', 'GZ-12', 'active']
    ].forEach((row) => store.run(...row));
    const order = demo.prepare('INSERT INTO orders (order_no, store_code, total_amount, order_status, created_at) VALUES (?, ?, ?, ?, ?)');
    for (let index = 1; index <= 36; index += 1) {
      const storeCode = `S${String(((index - 1) % 12) + 1).padStart(3, '0')}`;
      order.run(`ORD-${String(index).padStart(5, '0')}`, storeCode, 39.9 + index * 7.5, index % 9 === 0 ? 'refunded' : 'paid', new Date(Date.now() - index * 3600000).toISOString());
    }
    const inventory = demo.prepare('INSERT INTO inventory (store_code, sku, quantity) VALUES (?, ?, ?)');
    ['SKU-1001', 'SKU-1002', 'SKU-1003'].forEach((sku, skuIndex) => {
      for (let index = 1; index <= 12; index += 1) inventory.run(`S${String(index).padStart(3, '0')}`, sku, 20 + skuIndex * 13 + index);
    });
    const log = demo.prepare('INSERT INTO sync_log (store_code, sync_type, status, synced_at) VALUES (?, ?, ?, ?)');
    ['S001', 'S002', 'S003', 'S004'].forEach((storeCode, index) => log.run(storeCode, 'sales', index === 3 ? 'warning' : 'success', new Date(Date.now() - index * 1800000).toISOString()));
  }
  demo.close();
  return demoPath;
}

export function listProjects(db) {
  return db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM project_tasks t WHERE t.project_id = p.id AND t.status = 'done') AS completed_tasks,
      (SELECT COUNT(*) FROM project_tasks t WHERE t.project_id = p.id) AS total_tasks
    FROM projects p
    ORDER BY CASE p.status WHEN 'active' THEN 0 WHEN 'blocked' THEN 1 ELSE 2 END, p.updated_at DESC
  `).all();
}

export function getProject(db, id) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return null;
  return {
    ...project,
    tasks: listProjectTasks(db, id),
    checks: listCheckRuns(db, id, 8),
    profiles: listDatabaseProfiles(db, id),
    validations: listDataValidations(db, id),
    cases: listSupportCases(db, { projectId: id }),
    handover: listHandoverItems(db, id)
  };
}

export function createProject(db, input) {
  const now = new Date().toISOString();
  const count = Number(db.prepare('SELECT COUNT(*) AS count FROM projects').get().count) + 1;
  const result = db.prepare(`
    INSERT INTO projects (code, project_name, customer, product_name, environment, phase, status, owner, customer_contact, go_live_date, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.code || `DM-${2600 + count}`, input.projectName, input.customer, input.productName || '',
    input.environment || '生产环境', input.phase || 'requirement', input.status || 'active',
    input.owner || '', input.customerContact || '', input.goLiveDate || '', input.notes || '', now, now
  );
  const id = Number(result.lastInsertRowid);
  const insert = db.prepare(`
    INSERT INTO project_tasks (project_id, stage, title, description, status, sort_order, owner, due_date, evidence, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, '', '', '', ?, ?)
  `);
  [
    ['requirement', '确认实施范围和验收标准', '整理范围、数据和验收口径。'],
    ['preflight', '完成环境预检', '检查服务器、终端、网络、端口和服务。'],
    ['deployment', '完成安装和参数配置', '完成应用、数据库、日志和服务配置。'],
    ['data', '完成数据核验', '执行完整性、唯一性和关联关系检查。'],
    ['integration', '完成接口联调', '验证关键业务链路和异常回滚。'],
    ['training', '完成用户培训', '记录培训、签到和常见问题。'],
    ['acceptance', '完成项目验收', '逐项验证并完成签字确认。'],
    ['review', '完成上线复盘', '沉淀问题、根因和改进项。']
  ].forEach(([stage, title, description], index) => insert.run(id, stage, title, description, index + 1, now, now));
  addActivity(db, 'project.create', 'project', id, `${input.code || `DM-${2600 + count}`} 已创建`, now);
  return getProject(db, id);
}

export function updateProject(db, id, patch) {
  const ok = updateRow(db, 'projects', id, patch, {
    projectName: 'project_name', customer: 'customer', productName: 'product_name',
    environment: 'environment', phase: 'phase', status: 'status', owner: 'owner',
    customerContact: 'customer_contact', goLiveDate: 'go_live_date', notes: 'notes'
  });
  return ok ? getProject(db, id) : null;
}

export function listProjectTasks(db, projectId) {
  return db.prepare('SELECT * FROM project_tasks WHERE project_id = ? ORDER BY sort_order, id').all(projectId);
}

export function createProjectTask(db, projectId, input) {
  const now = new Date().toISOString();
  const count = Number(db.prepare('SELECT COUNT(*) AS count FROM project_tasks WHERE project_id = ?').get(projectId).count) + 1;
  const result = db.prepare(`
    INSERT INTO project_tasks (project_id, stage, title, description, status, sort_order, owner, due_date, evidence, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(projectId, input.stage || 'requirement', input.title, input.description || '', input.status || 'pending', input.sortOrder || count, input.owner || '', input.dueDate || '', input.evidence || '', now, now);
  return db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(Number(result.lastInsertRowid));
}

export function updateProjectTask(db, id, patch) {
  updateRow(db, 'project_tasks', id, patch, {
    stage: 'stage', title: 'title', description: 'description', status: 'status',
    sortOrder: 'sort_order', owner: 'owner', dueDate: 'due_date', evidence: 'evidence'
  });
  return db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(id) || null;
}

export function getWorkbench(db, projectId) {
  const project = projectId
    ? db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId)
    : db.prepare("SELECT * FROM projects ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'blocked' THEN 1 ELSE 2 END, updated_at DESC LIMIT 1").get();
  if (!project) return { project: null, nextTasks: [], blockers: [], recentChecks: [], openCases: [], pendingHandover: [], recentEvents: [] };
  return {
    project,
    nextTasks: db.prepare("SELECT * FROM project_tasks WHERE project_id = ? AND status != 'done' ORDER BY CASE status WHEN 'blocked' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, sort_order LIMIT 5").all(project.id),
    blockers: db.prepare("SELECT * FROM project_tasks WHERE project_id = ? AND status = 'blocked' ORDER BY sort_order").all(project.id),
    recentChecks: listCheckRuns(db, project.id, 5),
    openCases: listSupportCases(db, { projectId: project.id }).filter((item) => !['resolved', 'closed'].includes(item.status)).slice(0, 5),
    pendingHandover: db.prepare("SELECT * FROM handover_items WHERE project_id = ? AND status != 'done' ORDER BY due_date, id LIMIT 5").all(project.id),
    recentEvents: db.prepare('SELECT e.*, c.case_no, c.title AS case_title FROM case_events e JOIN support_cases c ON c.id = e.case_id WHERE c.project_id = ? ORDER BY e.created_at DESC LIMIT 6').all(project.id)
  };
}

export function listCheckRuns(db, projectId, limit = 30) {
  const where = projectId ? 'WHERE project_id = ?' : '';
  const params = projectId ? [projectId, limit] : [limit];
  return db.prepare(`SELECT * FROM check_runs ${where} ORDER BY created_at DESC, id DESC LIMIT ?`).all(...params);
}

export function getCheckRun(db, id) {
  const run = db.prepare('SELECT * FROM check_runs WHERE id = ?').get(id);
  if (!run) return null;
  return { ...run, details: parseJson(run.details_json, []), results: db.prepare('SELECT * FROM check_results WHERE run_id = ? ORDER BY id').all(id) };
}

export function saveCheckRun(db, input) {
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO check_runs (project_id, check_type, target, status, summary, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    input.projectId || null, input.type, input.target || '', input.status, input.summary || '', JSON.stringify(input.details || []), now
  );
  const id = Number(result.lastInsertRowid);
  const insert = db.prepare('INSERT INTO check_results (run_id, item_key, label, expected_value, actual_value, status, detail) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const item of input.details || []) insert.run(id, item.key || '', item.label || '', item.expected || '', item.actual || '', item.status || input.status, item.detail || '');
  addActivity(db, 'check.run', 'check', id, `${input.type} 检查完成：${input.status}`, now);
  return getCheckRun(db, id);
}

export function listDatabaseProfiles(db, projectId) {
  return db.prepare('SELECT * FROM database_profiles WHERE project_id = ? ORDER BY id').all(projectId);
}

export function getDatabaseProfile(db, id) {
  return db.prepare('SELECT * FROM database_profiles WHERE id = ?').get(id) || null;
}

export function createDatabaseProfile(db, projectId, input) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO database_profiles (project_id, name, kind, host, port, database_name, username, file_path, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(projectId, input.name, input.kind, input.host || '', input.port || null, input.databaseName || '', input.username || '', input.filePath || '', now, now);
  return getDatabaseProfile(db, Number(result.lastInsertRowid));
}

export function listDataValidations(db, projectId) {
  return db.prepare('SELECT * FROM data_validations WHERE project_id = ? ORDER BY id').all(projectId);
}

export function getDataValidation(db, id) {
  return db.prepare('SELECT * FROM data_validations WHERE id = ?').get(id) || null;
}

export function createDataValidation(db, projectId, input) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO data_validations (project_id, profile_id, name, description, sql_text, expected_value, actual_value, status, last_run_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, '', 'pending', NULL, ?, ?)
  `).run(projectId, input.profileId || null, input.name, input.description || '', input.sqlText, input.expectedValue || '0', now, now);
  return getDataValidation(db, Number(result.lastInsertRowid));
}

export function updateDataValidationResult(db, id, result) {
  const now = new Date().toISOString();
  db.prepare('UPDATE data_validations SET actual_value = ?, status = ?, last_run_at = ?, updated_at = ? WHERE id = ?').run(String(result.actualValue ?? ''), result.status, now, now, id);
  return getDataValidation(db, id);
}

export function listSupportCases(db, { projectId, status = '', priority = '', q = '' } = {}) {
  const clauses = [];
  const params = [];
  if (projectId) { clauses.push('project_id = ?'); params.push(projectId); }
  if (status) { clauses.push('status = ?'); params.push(status); }
  if (priority) { clauses.push('priority = ?'); params.push(priority); }
  if (q) {
    clauses.push('(case_no LIKE ? OR title LIKE ? OR customer LIKE ? OR symptom LIKE ?)');
    const term = `%${q}%`;
    params.push(term, term, term, term);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM support_cases ${where} ORDER BY updated_at DESC, id DESC`).all(...params);
}

export function getSupportCase(db, id) {
  const item = db.prepare('SELECT * FROM support_cases WHERE id = ?').get(id);
  return item ? { ...item, events: listCaseEvents(db, id) } : null;
}

export function createSupportCase(db, input) {
  const now = new Date().toISOString();
  const count = Number(db.prepare('SELECT COUNT(*) AS count FROM support_cases').get().count) + 1;
  const caseNo = input.caseNo || `DM-CASE-${String(count).padStart(3, '0')}`;
  const result = db.prepare(`
    INSERT INTO support_cases (case_no, project_id, title, customer, symptom, impact, priority, status, category, assignee, root_cause, resolution, next_action, created_at, updated_at, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(caseNo, input.projectId || null, input.title, input.customer || '', input.symptom || '', input.impact || '', input.priority || 'medium', input.status || 'open', input.category || '技术支持', input.assignee || '', input.rootCause || '', input.resolution || '', input.nextAction || '', now, now, ['resolved', 'closed'].includes(input.status) ? now : null);
  const id = Number(result.lastInsertRowid);
  createCaseEvent(db, id, { eventType: 'created', title: '问题受理', detail: input.symptom || input.title });
  addActivity(db, 'case.create', 'case', id, `${caseNo} 已创建`, now);
  return getSupportCase(db, id);
}

export function updateSupportCase(db, id, patch) {
  const current = db.prepare('SELECT * FROM support_cases WHERE id = ?').get(id);
  if (!current) return null;
  updateRow(db, 'support_cases', id, patch, {
    title: 'title', customer: 'customer', symptom: 'symptom', impact: 'impact',
    priority: 'priority', status: 'status', category: 'category', assignee: 'assignee',
    rootCause: 'root_cause', resolution: 'resolution', nextAction: 'next_action'
  }, patch.status && ['resolved', 'closed'].includes(patch.status) && !current.resolved_at ? { column: 'resolved_at', value: new Date().toISOString() } : null);
  if (patch.status && patch.status !== current.status) {
    createCaseEvent(db, id, { eventType: patch.status === 'resolved' ? 'resolution' : 'status', title: patch.status === 'resolved' ? '问题解决' : '状态更新', detail: `状态由 ${current.status} 更新为 ${patch.status}` });
  }
  return getSupportCase(db, id);
}

export function listCaseEvents(db, caseId) {
  return db.prepare('SELECT * FROM case_events WHERE case_id = ? ORDER BY created_at, id').all(caseId);
}

export function createCaseEvent(db, caseId, input) {
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO case_events (case_id, event_type, title, detail, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(caseId, input.eventType || 'note', input.title, input.detail || '', JSON.stringify(input.metadata || {}), now);
  db.prepare('UPDATE support_cases SET updated_at = ? WHERE id = ?').run(now, caseId);
  return db.prepare('SELECT * FROM case_events WHERE id = ?').get(Number(result.lastInsertRowid));
}

export function listHandoverItems(db, projectId) {
  return db.prepare("SELECT * FROM handover_items WHERE project_id = ? ORDER BY CASE category WHEN 'account' THEN 0 WHEN 'training' THEN 1 WHEN 'acceptance' THEN 2 ELSE 3 END, id").all(projectId);
}

export function createHandoverItem(db, projectId, input) {
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO handover_items (project_id, category, title, status, owner, due_date, evidence, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(projectId, input.category, input.title, input.status || 'pending', input.owner || '', input.dueDate || '', input.evidence || '', now, now);
  return db.prepare('SELECT * FROM handover_items WHERE id = ?').get(Number(result.lastInsertRowid));
}

export function updateHandoverItem(db, id, patch) {
  updateRow(db, 'handover_items', id, patch, { category: 'category', title: 'title', status: 'status', owner: 'owner', dueDate: 'due_date', evidence: 'evidence' });
  return db.prepare('SELECT * FROM handover_items WHERE id = ?').get(id) || null;
}

export function listKnowledge(db, { q = '', category = '' } = {}) {
  const clauses = [];
  const params = [];
  if (q) {
    clauses.push('(a.title LIKE ? OR a.symptom LIKE ? OR a.solution LIKE ? OR a.tags LIKE ?)');
    const term = `%${q}%`;
    params.push(term, term, term, term);
  }
  if (category) { clauses.push('a.category = ?'); params.push(category); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT a.* FROM knowledge_articles a ${where} ORDER BY views DESC, created_at DESC`).all(...params);
}

export function getKnowledge(db, id) {
  const article = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(id);
  if (!article) return null;
  db.prepare('UPDATE knowledge_articles SET views = views + 1 WHERE id = ?').run(id);
  return { ...article, views: Number(article.views) + 1 };
}

export function createKnowledge(db, input) {
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO knowledge_articles (title, category, symptom, solution, tags, views, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)').run(input.title, input.category || '技术支持', input.symptom, input.solution, input.tags || '', now);
  const id = Number(result.lastInsertRowid);
  if (input.projectId || input.caseId) db.prepare('INSERT OR REPLACE INTO knowledge_links (article_id, project_id, case_id, created_at) VALUES (?, ?, ?, ?)').run(id, input.projectId || null, input.caseId || null, now);
  return getKnowledge(db, id);
}

export function listActivities(db, limit = 20) {
  return db.prepare('SELECT * FROM activities ORDER BY created_at DESC, id DESC LIMIT ?').all(limit);
}

export function addActivity(db, action, entityType, entityId, detail, createdAt = new Date().toISOString()) {
  db.prepare('INSERT INTO activities (action, entity_type, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?)').run(action, entityType, entityId, detail, createdAt);
}

export function parseJson(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function updateRow(db, table, id, patch, mapping, extra = null) {
  const changes = Object.entries(patch).filter(([key, value]) => mapping[key] && value !== undefined);
  if (!changes.length && !extra) return true;
  const assignments = changes.map(([key]) => `${mapping[key]} = ?`);
  const values = changes.map(([, value]) => String(value));
  if (extra) { assignments.push(`${extra.column} = ?`); values.push(extra.value); }
  assignments.push('updated_at = ?');
  values.push(new Date().toISOString(), id);
  db.prepare(`UPDATE ${table} SET ${assignments.join(', ')} WHERE id = ?`).run(...values);
  return true;
}

export { PROJECT_STAGES };
