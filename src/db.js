import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DB_PATH = resolve(process.env.DB_PATH || 'data/supportops.db');
const OPEN_STATUSES = ['open', 'in_progress', 'waiting'];
const ACTIVE_DEPLOYMENTS = ['planning', 'deploying', 'testing', 'at_risk'];

export function createDatabase(dbPath = DEFAULT_DB_PATH) {
  mkdirSync(dirname(dbPath), { recursive: true });

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
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_no TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      customer TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      category TEXT NOT NULL DEFAULT '',
      assignee TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      resolution TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      project_name TEXT NOT NULL,
      customer TEXT NOT NULL,
      environment TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planning',
      progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
      current_step TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL,
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

    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_updated ON tickets(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
    CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
  `);
}

function seed(db) {
  const row = db.prepare('SELECT COUNT(*) AS count FROM tickets').get();
  if (Number(row.count) > 0) return;

  const now = Date.now();
  const at = (hoursAgo) => new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();

  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      ticket_no, title, customer, priority, status, category, assignee,
      description, resolution, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ['SO-24001', '门店POS终端无法连接结算服务', '华南零售集团', 'critical', 'in_progress', '网络故障', '陈工', '三台收银终端间歇性断连，业务高峰期出现支付超时。', '', at(3), at(1)],
    ['SO-24002', 'ERP用户登录后采购模块空白', '远航制造', 'high', 'waiting', '应用异常', '林工', '仅采购角色出现空白页，其他角色访问正常。', '待客户提供浏览器控制台日志。', at(8), at(5)],
    ['SO-24003', 'Linux接口服务启动后自动退出', '康宁医疗', 'critical', 'open', '服务部署', '周工', '升级后服务启动约30秒退出，数据库连接正常。', '', at(12), at(12)],
    ['SO-24004', '经营看板统计时区相差8小时', '星海教育', 'medium', 'resolved', '数据问题', '陈工', '日报表日期边界错误，UTC时间未转换为本地时区。', '调整应用与数据库时区配置并完成历史数据校验。', at(32), at(20)],
    ['SO-24005', '新门店小票打印机驱动异常', '华南零售集团', 'medium', 'closed', '硬件终端', '王工', 'Windows终端无法识别USB打印机。', '更换兼容驱动并完成打印测试。', at(60), at(48)],
    ['SO-24006', '数据库自动备份任务告警', '远航制造', 'high', 'in_progress', '数据库', '周工', 'MySQL备份任务连续两次未生成完整备份文件。', '', at(18), at(4)]
  ].forEach((values) => insertTicket.run(...values));

  const insertDeployment = db.prepare(`
    INSERT INTO deployments (
      code, project_name, customer, environment, owner, status, progress,
      current_step, due_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ['DEP-2401', 'ERP门店经营平台上线', '华南零售集团', '生产环境', '陈工', 'deploying', 68, '业务数据核对与权限验收', '2026-09-22', at(240), at(2)],
    ['DEP-2402', '影像归档平台二期', '康宁医疗', '生产环境', '周工', 'testing', 84, '接口联调与用户培训', '2026-09-18', at(320), at(5)],
    ['DEP-2403', '客户数据中台部署', '星海教育', '预发布环境', '林工', 'planning', 35, '服务器和网络环境检查', '2026-09-30', at(96), at(8)],
    ['DEP-2404', '移动巡检终端交付', '远航制造', '生产环境', '王工', 'live', 100, '项目验收完成', '2026-09-10', at(400), at(36)]
  ].forEach((values) => insertDeployment.run(...values));

  const insertArticle = db.prepare(`
    INSERT INTO knowledge_articles (
      title, category, symptom, solution, tags, views, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ['Linux端口占用快速排查', '服务部署', '应用启动时报 Address already in use。', '使用 ss -lntp 或 lsof -i :端口 定位占用进程；确认业务影响后停止旧进程，并检查 systemd 或容器是否配置自动重启。', 'Linux,端口,部署', 46, at(720)],
    ['Windows服务启动失败的检查顺序', '系统运维', 'Windows服务启动后立即停止，事件查看器存在应用错误。', '依次检查服务账号权限、依赖服务、监听端口、安装目录权限和事件日志；使用 netstat 与 sc query 验证端口和服务状态。', 'Windows,服务,日志', 38, at(620)],
    ['MySQL连接数耗尽的判断方法', '数据库', '业务间歇性提示 Too many connections。', '检查 max_connections、当前连接数和连接来源；通过 SHOW PROCESSLIST 识别长时间空闲连接，并排查连接池泄漏。', 'MySQL,SQL,连接池', 57, at(520)],
    ['客户端登录失败的定位路径', '技术支持', '用户输入正确账号后仍无法进入系统。', '检查账号状态、授权有效期、浏览器时间、接口返回码和应用日志，再验证网络链路与后端服务健康状态。', '客户端,登录,工单', 29, at(360)],
    ['SQL Server备份还原检查清单', '数据库', '恢复数据库后业务数据与备份时间不一致。', '确认备份文件完整、目标库无连接、恢复模式正确；还原后执行数据行数与时间点校验，并记录操作结果。', 'SQL Server,备份,恢复', 33, at(220)]
  ].forEach((values) => insertArticle.run(...values));

  addActivity(db, 'seed', 'system', null, '演示数据初始化完成', at(24));
  addActivity(db, 'deployment.update', 'deployment', 1, 'DEP-2401 进度更新至 68%', at(2));
  addActivity(db, 'ticket.resolve', 'ticket', 4, 'SO-24004 已完成数据校验并解决', at(20));
  addActivity(db, 'ticket.create', 'ticket', 1, 'SO-24001 创建为 P0 工单', at(3));
}

export function getDashboard(db) {
  const ticketCounts = db.prepare(`
    SELECT
      SUM(CASE WHEN status IN ('open', 'in_progress', 'waiting') THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN priority IN ('critical', 'high') AND status NOT IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS urgent,
      COUNT(*) AS total
    FROM tickets
  `).get();

  const deploymentCounts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) AS live,
      SUM(CASE WHEN status = 'at_risk' THEN 1 ELSE 0 END) AS at_risk,
      ROUND(AVG(progress), 0) AS average_progress
    FROM deployments
  `).get();

  return {
    tickets: normalizeNumbers(ticketCounts),
    deployments: normalizeNumbers(deploymentCounts),
    recentTickets: listTickets(db, {}).slice(0, 5),
    deploymentsInFlight: listDeployments(db).filter((item) => ACTIVE_DEPLOYMENTS.includes(item.status)).slice(0, 4),
    activities: listActivities(db, 6)
  };
}

export function listTickets(db, { status = '', priority = '', q = '' } = {}) {
  const clauses = [];
  const params = [];

  if (status) {
    clauses.push('status = ?');
    params.push(status);
  }
  if (priority) {
    clauses.push('priority = ?');
    params.push(priority);
  }
  if (q) {
    clauses.push('(ticket_no LIKE ? OR title LIKE ? OR customer LIKE ? OR assignee LIKE ?)');
    const term = `%${q}%`;
    params.push(term, term, term, term);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM tickets ${where} ORDER BY updated_at DESC, id DESC`).all(...params);
}

export function getTicket(db, id) {
  return db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) || null;
}

export function createTicket(db, input) {
  const now = new Date().toISOString();
  const count = Number(db.prepare('SELECT COUNT(*) AS count FROM tickets').get().count) + 1;
  const ticketNo = input.ticketNo || `SO-${String(24000 + count).padStart(5, '0')}`;

  const result = db.prepare(`
    INSERT INTO tickets (
      ticket_no, title, customer, priority, status, category, assignee,
      description, resolution, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ticketNo,
    input.title,
    input.customer,
    input.priority || 'medium',
    input.status || 'open',
    input.category || '技术支持',
    input.assignee || '',
    input.description || '',
    input.resolution || '',
    now,
    now
  );

  const id = Number(result.lastInsertRowid);
  addActivity(db, 'ticket.create', 'ticket', id, `${ticketNo} 已创建`, now);
  return getTicket(db, id);
}

export function updateTicket(db, id, patch) {
  const current = getTicket(db, id);
  if (!current) return null;

  const allowed = ['title', 'customer', 'priority', 'status', 'category', 'assignee', 'description', 'resolution'];
  const changes = Object.entries(patch).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!changes.length) return current;

  const now = new Date().toISOString();
  const assignments = changes.map(([key]) => `${key} = ?`);
  const values = changes.map(([, value]) => String(value));
  assignments.push('updated_at = ?');
  values.push(now, id);

  db.prepare(`UPDATE tickets SET ${assignments.join(', ')} WHERE id = ?`).run(...values);
  const action = patch.status === 'resolved' ? 'ticket.resolve' : 'ticket.update';
  addActivity(db, action, 'ticket', id, `${current.ticket_no} 已更新`, now);
  return getTicket(db, id);
}

export function listDeployments(db) {
  return db.prepare('SELECT * FROM deployments ORDER BY CASE status WHEN \'at_risk\' THEN 0 WHEN \'deploying\' THEN 1 WHEN \'testing\' THEN 2 WHEN \'planning\' THEN 3 ELSE 4 END, due_date ASC').all();
}

export function getDeployment(db, id) {
  return db.prepare('SELECT * FROM deployments WHERE id = ?').get(id) || null;
}

export function createDeployment(db, input) {
  const now = new Date().toISOString();
  const count = Number(db.prepare('SELECT COUNT(*) AS count FROM deployments').get().count) + 1;
  const code = input.code || `DEP-${String(2400 + count)}`;

  const result = db.prepare(`
    INSERT INTO deployments (
      code, project_name, customer, environment, owner, status, progress,
      current_step, due_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    code,
    input.projectName,
    input.customer,
    input.environment || '生产环境',
    input.owner || '',
    input.status || 'planning',
    clampProgress(input.progress || 0),
    input.currentStep || '环境调研',
    input.dueDate || now.slice(0, 10),
    now,
    now
  );

  const id = Number(result.lastInsertRowid);
  addActivity(db, 'deployment.create', 'deployment', id, `${code} 已创建`, now);
  return getDeployment(db, id);
}

export function updateDeployment(db, id, patch) {
  const current = getDeployment(db, id);
  if (!current) return null;

  const next = {
    project_name: patch.projectName ?? current.project_name,
    customer: patch.customer ?? current.customer,
    environment: patch.environment ?? current.environment,
    owner: patch.owner ?? current.owner,
    status: patch.status ?? current.status,
    progress: clampProgress(patch.progress ?? current.progress),
    current_step: patch.currentStep ?? current.current_step,
    due_date: patch.dueDate ?? current.due_date
  };

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE deployments
    SET project_name = ?, customer = ?, environment = ?, owner = ?, status = ?, progress = ?, current_step = ?, due_date = ?, updated_at = ?
    WHERE id = ?
  `).run(...Object.values(next), now, id);
  addActivity(db, 'deployment.update', 'deployment', id, `${current.code} 进度更新至 ${next.progress}%`, now);
  return getDeployment(db, id);
}

export function listKnowledge(db, { q = '', category = '' } = {}) {
  const clauses = [];
  const params = [];
  if (q) {
    clauses.push('(title LIKE ? OR symptom LIKE ? OR solution LIKE ? OR tags LIKE ?)');
    const term = `%${q}%`;
    params.push(term, term, term, term);
  }
  if (category) {
    clauses.push('category = ?');
    params.push(category);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM knowledge_articles ${where} ORDER BY views DESC, created_at DESC`).all(...params);
}

export function getKnowledge(db, id) {
  const article = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(id);
  if (!article) return null;
  db.prepare('UPDATE knowledge_articles SET views = views + 1 WHERE id = ?').run(id);
  return { ...article, views: Number(article.views) + 1 };
}

export function createKnowledge(db, input) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO knowledge_articles (title, category, symptom, solution, tags, views, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(input.title, input.category || '技术支持', input.symptom, input.solution, input.tags || '', now);
  const id = Number(result.lastInsertRowid);
  addActivity(db, 'knowledge.create', 'knowledge', id, `${input.title} 已加入知识库`, now);
  return getKnowledge(db, id);
}

export function listActivities(db, limit = 20) {
  return db.prepare('SELECT * FROM activities ORDER BY created_at DESC, id DESC LIMIT ?').all(limit);
}

export function saveDiagnostic(db, result) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO diagnostics (check_type, target, status, latency_ms, detail, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(result.type, result.target, result.status, result.latencyMs ?? null, result.detail, now);
  addActivity(db, 'diagnostic.run', 'diagnostic', null, `${result.type.toUpperCase()} 检查 ${result.target}: ${result.status}`, now);
}

export function listDiagnostics(db, limit = 10) {
  return db.prepare('SELECT * FROM diagnostics ORDER BY created_at DESC, id DESC LIMIT ?').all(limit);
}

export function addActivity(db, action, entityType, entityId, detail, createdAt = new Date().toISOString()) {
  db.prepare(`
    INSERT INTO activities (action, entity_type, entity_id, detail, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(action, entityType, entityId, detail, createdAt);
}

function normalizeNumbers(row) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value || 0)]));
}

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number.parseInt(value, 10) || 0));
}

export { ACTIVE_DEPLOYMENTS, OPEN_STATUSES };
