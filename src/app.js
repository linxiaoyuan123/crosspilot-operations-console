import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createDatabase,
  createDatabaseProfile,
  createDataValidation,
  createHandoverItem,
  createKnowledge,
  createProject,
  createProjectTask,
  createSupportCase,
  createCaseEvent,
  getCheckRun,
  getDatabaseProfile,
  getDataValidation,
  getKnowledge,
  getProject,
  getSupportCase,
  getWorkbench,
  listActivities,
  listCheckRuns,
  listDatabaseProfiles,
  listDataValidations,
  listHandoverItems,
  listKnowledge,
  listProjects,
  listProjectTasks,
  listSupportCases,
  saveCheckRun,
  updateDataValidationResult,
  updateHandoverItem,
  updateProject,
  updateProjectTask,
  updateSupportCase
} from './store.js';
import { collectSystemInfo, runNetworkDiagnostic, runSystemCheck, summarizeStatus } from './diagnostics.js';
import { DANGEROUS_CONFIRMATION, csvFromRows, executeDatabaseQuery, generateBackupPlan, withDatabaseAdapter } from './database.js';
import { generateReport } from './reports.js';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(MODULE_DIR, '..', 'public');
const MAX_BODY_BYTES = 1024 * 1024;
const VERSION = '2.0.0';
const DEFAULT_DB_PATH = resolve(process.env.DB_PATH || 'data/deploymate.db');
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8'
};

const PROJECT_PHASES = ['requirement', 'preflight', 'deployment', 'data', 'integration', 'training', 'acceptance', 'review'];
const PROJECT_STATUSES = ['active', 'blocked', 'completed', 'archived'];
const TASK_STATUSES = ['pending', 'in_progress', 'blocked', 'done'];
const CASE_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CASE_STATUSES = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];
const CASE_EVENT_TYPES = ['note', 'diagnostic', 'validation', 'contact', 'resolution', 'knowledge', 'status'];
const HANDOVER_CATEGORIES = ['account', 'training', 'acceptance', 'document'];
const DATABASE_KINDS = ['sqlite', 'mysql', 'sqlserver'];

export function createApp({ dbPath } = {}) {
  const resolvedDbPath = resolve(dbPath || DEFAULT_DB_PATH);
  const dataDirectory = dirname(resolvedDbPath);
  const db = createDatabase(resolvedDbPath);

  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      if (requestUrl.pathname.startsWith('/api/')) {
        await handleApi({ db, dataDirectory, request, response, requestUrl });
      } else {
        await serveStatic({ request, response, pathname: requestUrl.pathname });
      }
    } catch (error) {
      const status = error.statusCode || 500;
      if (status >= 500) console.error(error);
      sendJson(response, status, { error: error.publicMessage || '服务器内部错误' });
    }
  });

  return { server, db, dataDirectory };
}

async function handleApi({ db, dataDirectory, request, response, requestUrl }) {
  const { pathname } = requestUrl;
  const method = request.method || 'GET';

  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(response, 200, { status: 'ok', service: 'deploymate', version: VERSION, timestamp: new Date().toISOString() });
  }

  if (method === 'GET' && pathname === '/api/workbench') {
    return sendJson(response, 200, getWorkbench(db, optionalId(requestUrl.searchParams.get('projectId'))));
  }

  if (method === 'GET' && pathname === '/api/projects') {
    return sendJson(response, 200, { items: listProjects(db) });
  }

  if (method === 'POST' && pathname === '/api/projects') {
    const body = await readJsonBody(request);
    return sendJson(response, 201, createProject(db, {
      code: optionalText(body.code, 30),
      projectName: requireText(body.projectName, '项目名称', 120),
      customer: requireText(body.customer, '客户', 100),
      productName: optionalText(body.productName, 100),
      environment: optionalText(body.environment, 60) || '生产环境',
      phase: enumValue(body.phase, PROJECT_PHASES, 'requirement'),
      status: enumValue(body.status, PROJECT_STATUSES, 'active'),
      owner: optionalText(body.owner, 40),
      customerContact: optionalText(body.customerContact, 100),
      goLiveDate: optionalDate(body.goLiveDate),
      notes: optionalText(body.notes, 2000)
    }));
  }

  const projectMatch = pathname.match(/^\/api\/projects\/(\d+)$/);
  if (projectMatch && method === 'GET') {
    const project = getProject(db, Number(projectMatch[1]));
    return project ? sendJson(response, 200, project) : sendJson(response, 404, { error: '实施项目不存在' });
  }

  if (projectMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const project = updateProject(db, Number(projectMatch[1]), projectPatch(body));
    return project ? sendJson(response, 200, project) : sendJson(response, 404, { error: '实施项目不存在' });
  }

  const projectTasksMatch = pathname.match(/^\/api\/projects\/(\d+)\/tasks$/);
  if (projectTasksMatch && method === 'GET') {
    return sendJson(response, 200, { items: listProjectTasks(db, Number(projectTasksMatch[1])) });
  }

  if (projectTasksMatch && method === 'POST') {
    const projectId = Number(projectTasksMatch[1]);
    if (!getProject(db, projectId)) return sendJson(response, 404, { error: '实施项目不存在' });
    const body = await readJsonBody(request);
    return sendJson(response, 201, createProjectTask(db, projectId, {
      stage: enumValue(body.stage, PROJECT_PHASES, 'requirement'),
      title: requireText(body.title, '任务名称', 120),
      description: optionalText(body.description, 2000),
      status: enumValue(body.status, TASK_STATUSES, 'pending'),
      sortOrder: optionalPositiveInteger(body.sortOrder),
      owner: optionalText(body.owner, 40),
      dueDate: optionalDate(body.dueDate),
      evidence: optionalText(body.evidence, 500)
    }));
  }

  const taskMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
  if (taskMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const task = updateProjectTask(db, Number(taskMatch[1]), {
      ...(body.stage !== undefined ? { stage: enumValue(body.stage, PROJECT_PHASES) } : {}),
      ...(body.title !== undefined ? { title: requireText(body.title, '任务名称', 120) } : {}),
      ...(body.description !== undefined ? { description: optionalText(body.description, 2000) } : {}),
      ...(body.status !== undefined ? { status: enumValue(body.status, TASK_STATUSES) } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: optionalPositiveInteger(body.sortOrder) } : {}),
      ...(body.owner !== undefined ? { owner: optionalText(body.owner, 40) } : {}),
      ...(body.dueDate !== undefined ? { dueDate: optionalDate(body.dueDate) } : {}),
      ...(body.evidence !== undefined ? { evidence: optionalText(body.evidence, 500) } : {})
    });
    return task ? sendJson(response, 200, task) : sendJson(response, 404, { error: '项目任务不存在' });
  }

  if (method === 'GET' && pathname === '/api/checks/system') {
    return sendJson(response, 200, collectSystemInfo());
  }

  if (method === 'POST' && pathname === '/api/checks/system') {
    const body = await readJsonBody(request);
    const check = runSystemCheck(body);
    const saved = saveCheckRun(db, {
      projectId: optionalId(body.projectId),
      type: check.type,
      target: check.target,
      status: check.status,
      summary: check.summary,
      details: check.details
    });
    return sendJson(response, 201, { ...saved, raw: check.raw });
  }

  if (method === 'POST' && pathname === '/api/checks/network') {
    const body = await readJsonBody(request);
    const check = await runNetworkDiagnostic(body);
    const saved = saveCheckRun(db, {
      projectId: optionalId(body.projectId),
      type: 'network',
      target: check.target,
      status: check.status,
      summary: `${checkLabel(body.type)}：${check.detail}`,
      details: check.details
    });
    return sendJson(response, 201, { ...saved, checkType: body.type, latencyMs: check.latencyMs });
  }

  if (method === 'POST' && pathname === '/api/checks/database') {
    const body = await readJsonBody(request);
    const connection = resolveConnectionProfile(db, body);
    const saved = await runDatabaseCheck(db, dataDirectory, { projectId: body.projectId, connection });
    return sendJson(response, saved.status === 'failed' ? 200 : 201, saved);
  }

  if (method === 'GET' && pathname === '/api/checks/history') {
    return sendJson(response, 200, {
      items: listCheckRuns(
        db,
        optionalId(requestUrl.searchParams.get('projectId')),
        boundedLimit(requestUrl.searchParams.get('limit'), 30, 100)
      )
    });
  }

  const checkMatch = pathname.match(/^\/api\/checks\/(\d+)$/);
  if (checkMatch && method === 'GET') {
    const check = getCheckRun(db, Number(checkMatch[1]));
    return check ? sendJson(response, 200, check) : sendJson(response, 404, { error: '检查记录不存在' });
  }

  if (method === 'GET' && pathname === '/api/db/profiles') {
    const projectId = optionalId(requestUrl.searchParams.get('projectId'));
    if (!projectId) return sendJson(response, 400, { error: '缺少 projectId' });
    return sendJson(response, 200, { items: listDatabaseProfiles(db, projectId) });
  }

  if (method === 'POST' && pathname === '/api/db/profiles') {
    const body = await readJsonBody(request);
    const projectId = requirePositiveId(body.projectId, '实施项目');
    if (!getProject(db, projectId)) return sendJson(response, 404, { error: '实施项目不存在' });
    return sendJson(response, 201, createDatabaseProfile(db, projectId, {
      name: requireText(body.name, '连接名称', 80),
      kind: enumValue(body.kind, DATABASE_KINDS),
      host: optionalText(body.host, 120),
      port: optionalPort(body.port),
      databaseName: optionalText(body.databaseName, 100),
      username: optionalText(body.username, 100),
      filePath: optionalText(body.filePath, 500)
    }));
  }

  if (method === 'POST' && pathname === '/api/db/test') {
    const body = await readJsonBody(request);
    const connection = resolveConnectionProfile(db, body);
    const result = await withDatabaseAdapter(connection, { dataDirectory, readOnly: true }, async (adapter) => {
      const test = await adapter.test();
      const schema = await adapter.schema();
      return {
        ...test,
        kind: adapter.kind,
        label: adapter.label,
        tableCount: schema.length,
        tables: schema.slice(0, 8).map((table) => ({ name: table.name, type: table.type, rowCount: table.rowCount }))
      };
    });
    return sendJson(response, 200, result);
  }

  if (method === 'POST' && pathname === '/api/db/schema') {
    const body = await readJsonBody(request);
    const connection = resolveConnectionProfile(db, body);
    const schema = await withDatabaseAdapter(connection, { dataDirectory, readOnly: true }, (adapter) => adapter.schema());
    return sendJson(response, 200, { items: schema });
  }

  if (method === 'POST' && pathname === '/api/db/query') {
    const body = await readJsonBody(request);
    const connection = resolveConnectionProfile(db, body);
    const result = await executeDatabaseQuery(connection, { dataDirectory }, {
      sqlText: requireText(body.sqlText, 'SQL 语句', 20000),
      allowWrite: Boolean(body.allowWrite),
      confirmPhrase: optionalText(body.confirmPhrase, 80),
      limit: boundedLimit(body.limit, 200, 500)
    });
    return sendJson(response, 200, { ...result, dangerousConfirmation: DANGEROUS_CONFIRMATION, executedAt: new Date().toISOString() });
  }

  if (method === 'GET' && pathname === '/api/db/validations') {
    const projectId = optionalId(requestUrl.searchParams.get('projectId'));
    if (!projectId) return sendJson(response, 400, { error: '缺少 projectId' });
    return sendJson(response, 200, { items: listDataValidations(db, projectId) });
  }

  if (method === 'POST' && pathname === '/api/db/validations') {
    const body = await readJsonBody(request);
    const projectId = requirePositiveId(body.projectId, '实施项目');
    const profileId = requirePositiveId(body.profileId, '数据库连接');
    if (!getProject(db, projectId)) return sendJson(response, 404, { error: '实施项目不存在' });
    if (!getDatabaseProfile(db, profileId)) return sendJson(response, 404, { error: '数据库连接不存在' });
    return sendJson(response, 201, createDataValidation(db, projectId, {
      profileId,
      name: requireText(body.name, '校验名称', 120),
      description: optionalText(body.description, 1000),
      sqlText: requireText(body.sqlText, '校验 SQL', 20000),
      expectedValue: requireText(body.expectedValue, '期望值', 100)
    }));
  }

  if (method === 'POST' && pathname === '/api/db/validate') {
    const body = await readJsonBody(request);
    return sendJson(response, 200, await runDataValidation(db, dataDirectory, body));
  }

  const validationMatch = pathname.match(/^\/api\/db\/validations\/(\d+)$/);
  if (validationMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const validation = updateDataValidationResult(db, Number(validationMatch[1]), {
      actualValue: optionalText(body.actualValue, 200),
      status: enumValue(body.status, ['pending', 'healthy', 'warning', 'failed'])
    });
    return validation ? sendJson(response, 200, validation) : sendJson(response, 404, { error: '数据校验不存在' });
  }

  if (method === 'POST' && pathname === '/api/db/export') {
    const body = await readJsonBody(request);
    const connection = resolveConnectionProfile(db, body);
    const sqlText = body.table
      ? buildTableSelect(connection.kind, body.table, boundedLimit(body.limit, 1000, 5000))
      : requireText(body.sqlText, 'SQL 语句', 20000);
    const result = await executeDatabaseQuery(connection, { dataDirectory }, {
      sqlText,
      allowWrite: false,
      limit: boundedLimit(body.limit, 1000, 5000)
    });
    return sendDownload(response, csvFromRows(result.rows), 'text/csv; charset=utf-8', `data-export-${today()}.csv`);
  }

  if (method === 'POST' && pathname === '/api/db/backup-plan') {
    const body = await readJsonBody(request);
    const projectId = optionalId(body.projectId);
    if (projectId && !getProject(db, projectId)) return sendJson(response, 404, { error: '实施项目不存在' });
    const connection = resolveConnectionProfile(db, body);
    const plan = generateBackupPlan(connection, {
      operation: enumValue(body.operation, ['backup', 'restore'], 'backup'),
      artifactPath: requireText(body.artifactPath, '备份文件路径', 500),
      dataDirectory
    });
    const saved = saveCheckRun(db, {
      projectId,
      type: 'backup',
      target: connection.name || connection.kind,
      status: 'warning',
      summary: `已生成${plan.operationLabel}方案，执行前需要人工审批`,
      details: [{
        key: plan.operation,
        label: `${plan.operationLabel}方案`,
        expected: '经过人工审批并在变更窗口执行',
        actual: '命令已生成，未自动执行',
        status: 'warning',
        detail: '执行前确认备份目录、空间、权限和回滚方案；命令内容不写入报告。'
      }]
    });
    return sendJson(response, 201, { ...saved, plan });
  }

  if (method === 'GET' && pathname === '/api/cases') {
    return sendJson(response, 200, {
      items: listSupportCases(db, {
        projectId: optionalId(requestUrl.searchParams.get('projectId')),
        status: requestUrl.searchParams.get('status') || '',
        priority: requestUrl.searchParams.get('priority') || '',
        q: requestUrl.searchParams.get('q') || ''
      })
    });
  }

  if (method === 'POST' && pathname === '/api/cases') {
    const body = await readJsonBody(request);
    const projectId = optionalId(body.projectId);
    if (projectId && !getProject(db, projectId)) return sendJson(response, 404, { error: '实施项目不存在' });
    return sendJson(response, 201, createSupportCase(db, {
      projectId,
      title: requireText(body.title, '问题标题', 120),
      customer: optionalText(body.customer, 100),
      symptom: requireText(body.symptom, '问题现象', 3000),
      impact: optionalText(body.impact, 1000),
      priority: enumValue(body.priority, CASE_PRIORITIES, 'medium'),
      status: enumValue(body.status, CASE_STATUSES, 'open'),
      category: optionalText(body.category, 50) || '技术支持',
      assignee: optionalText(body.assignee, 40),
      rootCause: optionalText(body.rootCause, 3000),
      resolution: optionalText(body.resolution, 5000),
      nextAction: optionalText(body.nextAction, 2000)
    }));
  }

  const caseMatch = pathname.match(/^\/api\/cases\/(\d+)$/);
  if (caseMatch && method === 'GET') {
    const supportCase = getSupportCase(db, Number(caseMatch[1]));
    return supportCase ? sendJson(response, 200, supportCase) : sendJson(response, 404, { error: '问题单不存在' });
  }

  if (caseMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const supportCase = updateSupportCase(db, Number(caseMatch[1]), casePatch(body));
    return supportCase ? sendJson(response, 200, supportCase) : sendJson(response, 404, { error: '问题单不存在' });
  }

  const caseEventsMatch = pathname.match(/^\/api\/cases\/(\d+)\/events$/);
  if (caseEventsMatch && method === 'GET') {
    const supportCase = getSupportCase(db, Number(caseEventsMatch[1]));
    return supportCase
      ? sendJson(response, 200, { items: supportCase.events })
      : sendJson(response, 404, { error: '问题单不存在' });
  }

  if (caseEventsMatch && method === 'POST') {
    const caseId = Number(caseEventsMatch[1]);
    if (!getSupportCase(db, caseId)) return sendJson(response, 404, { error: '问题单不存在' });
    const body = await readJsonBody(request);
    return sendJson(response, 201, createCaseEvent(db, caseId, {
      eventType: enumValue(body.eventType, CASE_EVENT_TYPES, 'note'),
      title: requireText(body.title, '记录标题', 120),
      detail: optionalText(body.detail, 4000),
      metadata: objectValue(body.metadata)
    }));
  }

  const caseKnowledgeMatch = pathname.match(/^\/api\/cases\/(\d+)\/knowledge$/);
  if (caseKnowledgeMatch && method === 'POST') {
    const supportCase = getSupportCase(db, Number(caseKnowledgeMatch[1]));
    if (!supportCase) return sendJson(response, 404, { error: '问题单不存在' });
    if (!supportCase.resolution) return sendJson(response, 400, { error: '请先填写解决方案再沉淀知识库' });
    const article = createKnowledge(db, {
      title: supportCase.title,
      category: supportCase.category || '技术支持',
      symptom: supportCase.symptom || supportCase.title,
      solution: [
        supportCase.root_cause ? `根本原因：${supportCase.root_cause}` : '',
        `解决方案：${supportCase.resolution}`,
        supportCase.next_action ? `后续跟进：${supportCase.next_action}` : ''
      ].filter(Boolean).join('\n'),
      tags: [supportCase.category, supportCase.customer, '实施交付'].filter(Boolean).join(','),
      projectId: supportCase.project_id,
      caseId: supportCase.id
    });
    createCaseEvent(db, supportCase.id, {
      eventType: 'knowledge',
      title: '已沉淀知识库',
      detail: `知识文章《${article.title}》已创建。`,
      metadata: { articleId: article.id }
    });
    return sendJson(response, 201, article);
  }

  const handoverMatch = pathname.match(/^\/api\/handover\/(\d+)$/);
  if (handoverMatch && method === 'GET') {
    const projectId = Number(handoverMatch[1]);
    if (!getProject(db, projectId)) return sendJson(response, 404, { error: '实施项目不存在' });
    return sendJson(response, 200, { items: listHandoverItems(db, projectId) });
  }

  if (handoverMatch && method === 'POST') {
    const projectId = Number(handoverMatch[1]);
    if (!getProject(db, projectId)) return sendJson(response, 404, { error: '实施项目不存在' });
    const body = await readJsonBody(request);
    return sendJson(response, 201, createHandoverItem(db, projectId, {
      category: enumValue(body.category, HANDOVER_CATEGORIES, 'acceptance'),
      title: requireText(body.title, '交付事项', 120),
      status: enumValue(body.status, TASK_STATUSES, 'pending'),
      owner: optionalText(body.owner, 40),
      dueDate: optionalDate(body.dueDate),
      evidence: optionalText(body.evidence, 1000)
    }));
  }

  const handoverItemMatch = pathname.match(/^\/api\/handover\/(\d+)\/(\d+)$/);
  if (handoverItemMatch && method === 'PATCH') {
    const projectId = Number(handoverItemMatch[1]);
    const itemId = Number(handoverItemMatch[2]);
    if (!listHandoverItems(db, projectId).some((item) => item.id === itemId)) {
      return sendJson(response, 404, { error: '交付事项不存在' });
    }
    const body = await readJsonBody(request);
    return sendJson(response, 200, updateHandoverItem(db, itemId, {
      ...(body.category !== undefined ? { category: enumValue(body.category, HANDOVER_CATEGORIES) } : {}),
      ...(body.title !== undefined ? { title: requireText(body.title, '交付事项', 120) } : {}),
      ...(body.status !== undefined ? { status: enumValue(body.status, TASK_STATUSES) } : {}),
      ...(body.owner !== undefined ? { owner: optionalText(body.owner, 40) } : {}),
      ...(body.dueDate !== undefined ? { dueDate: optionalDate(body.dueDate) } : {}),
      ...(body.evidence !== undefined ? { evidence: optionalText(body.evidence, 1000) } : {})
    }));
  }

  if (method === 'GET' && pathname === '/api/knowledge') {
    return sendJson(response, 200, {
      items: listKnowledge(db, {
        q: requestUrl.searchParams.get('q') || '',
        category: requestUrl.searchParams.get('category') || ''
      })
    });
  }

  if (method === 'POST' && pathname === '/api/knowledge') {
    const body = await readJsonBody(request);
    return sendJson(response, 201, createKnowledge(db, {
      title: requireText(body.title, '标题', 120),
      category: optionalText(body.category, 50) || '技术支持',
      symptom: requireText(body.symptom, '问题现象', 3000),
      solution: requireText(body.solution, '解决方案', 6000),
      tags: optionalText(body.tags, 300),
      projectId: optionalId(body.projectId),
      caseId: optionalId(body.caseId)
    }));
  }

  const knowledgeMatch = pathname.match(/^\/api\/knowledge\/(\d+)$/);
  if (knowledgeMatch && method === 'GET') {
    const article = getKnowledge(db, Number(knowledgeMatch[1]));
    return article ? sendJson(response, 200, article) : sendJson(response, 404, { error: '知识文章不存在' });
  }

  const reportMatch = pathname.match(/^\/api\/reports\/(project|handover|check|case)\/(\d+)$/);
  if (reportMatch && method === 'GET') {
    const format = enumValue(requestUrl.searchParams.get('format'), ['html', 'md', 'csv'], 'html');
    const report = generateReport(db, reportMatch[1], Number(reportMatch[2]), format);
    return sendDownload(response, report.content, report.contentType, report.filename, format === 'html');
  }

  if (method === 'GET' && pathname === '/api/activities') {
    return sendJson(response, 200, { items: listActivities(db, boundedLimit(requestUrl.searchParams.get('limit'), 20, 100)) });
  }

  return sendJson(response, 404, { error: '接口不存在' });
}

function projectPatch(body) {
  return {
    ...(body.projectName !== undefined ? { projectName: requireText(body.projectName, '项目名称', 120) } : {}),
    ...(body.customer !== undefined ? { customer: requireText(body.customer, '客户', 100) } : {}),
    ...(body.productName !== undefined ? { productName: optionalText(body.productName, 100) } : {}),
    ...(body.environment !== undefined ? { environment: optionalText(body.environment, 60) } : {}),
    ...(body.phase !== undefined ? { phase: enumValue(body.phase, PROJECT_PHASES) } : {}),
    ...(body.status !== undefined ? { status: enumValue(body.status, PROJECT_STATUSES) } : {}),
    ...(body.owner !== undefined ? { owner: optionalText(body.owner, 40) } : {}),
    ...(body.customerContact !== undefined ? { customerContact: optionalText(body.customerContact, 100) } : {}),
    ...(body.goLiveDate !== undefined ? { goLiveDate: optionalDate(body.goLiveDate) } : {}),
    ...(body.notes !== undefined ? { notes: optionalText(body.notes, 2000) } : {})
  };
}

function casePatch(body) {
  return {
    ...(body.title !== undefined ? { title: requireText(body.title, '问题标题', 120) } : {}),
    ...(body.customer !== undefined ? { customer: optionalText(body.customer, 100) } : {}),
    ...(body.symptom !== undefined ? { symptom: requireText(body.symptom, '问题现象', 3000) } : {}),
    ...(body.impact !== undefined ? { impact: optionalText(body.impact, 1000) } : {}),
    ...(body.priority !== undefined ? { priority: enumValue(body.priority, CASE_PRIORITIES) } : {}),
    ...(body.status !== undefined ? { status: enumValue(body.status, CASE_STATUSES) } : {}),
    ...(body.category !== undefined ? { category: optionalText(body.category, 50) } : {}),
    ...(body.assignee !== undefined ? { assignee: optionalText(body.assignee, 40) } : {}),
    ...(body.rootCause !== undefined ? { rootCause: optionalText(body.rootCause, 3000) } : {}),
    ...(body.resolution !== undefined ? { resolution: optionalText(body.resolution, 5000) } : {}),
    ...(body.nextAction !== undefined ? { nextAction: optionalText(body.nextAction, 2000) } : {})
  };
}

async function runDatabaseCheck(db, dataDirectory, { projectId, connection }) {
  let check;
  try {
    const output = await withDatabaseAdapter(connection, { dataDirectory, readOnly: true }, async (adapter) => {
      const test = await adapter.test();
      const tables = await adapter.schema();
      return { kind: adapter.kind, label: adapter.label, test, tables };
    });
    const details = [
      {
        key: 'connection',
        label: '连接测试',
        expected: '连接成功且可读取版本',
        actual: output.test.detail,
        status: output.test.ok ? 'healthy' : 'failed',
        detail: `数据库类型：${output.kind}`
      },
      {
        key: 'schema',
        label: '数据对象读取',
        expected: '可读取数据库和表结构',
        actual: `读取到 ${output.tables.length} 个表或视图`,
        status: output.tables.length ? 'healthy' : 'warning',
        detail: output.tables.slice(0, 8).map((table) => table.name).join('、')
      }
    ];
    check = {
      type: 'database',
      target: connection.name || output.label,
      status: summarizeStatus(details),
      summary: `${output.test.detail}，可读取 ${output.tables.length} 个数据对象`,
      details
    };
  } catch (error) {
    check = {
      type: 'database',
      target: connection.name || connection.databaseName || connection.kind,
      status: 'failed',
      summary: `连接失败：${error.message}`,
      details: [{
        key: 'connection',
        label: '连接测试',
        expected: '连接成功且可读取版本',
        actual: error.message,
        status: 'failed',
        detail: '请检查地址、端口、账号、密码、防火墙和数据库监听状态。'
      }]
    };
  }
  return saveCheckRun(db, {
    projectId: optionalId(projectId),
    type: check.type,
    target: check.target,
    status: check.status,
    summary: check.summary,
    details: check.details
  });
}

async function runDataValidation(db, dataDirectory, body) {
  let validation = null;
  let connection;
  let sqlText;
  let expectedValue;
  if (body.validationId) {
    validation = getDataValidation(db, requirePositiveId(body.validationId, '数据校验'));
    if (!validation) throw httpError(404, '数据校验不存在');
    const profile = getDatabaseProfile(db, validation.profile_id);
    if (!profile) throw httpError(404, '校验所关联的数据库连接不存在');
    connection = mergeConnectionProfile(profile, body);
    sqlText = validation.sql_text;
    expectedValue = validation.expected_value;
  } else {
    connection = resolveConnectionProfile(db, body);
    sqlText = requireText(body.sqlText, '校验 SQL', 20000);
    expectedValue = requireText(body.expectedValue, '期望值', 100);
  }
  const output = await executeDatabaseQuery(connection, { dataDirectory }, { sqlText, allowWrite: false, limit: 1 });
  const actualValue = Object.values(output.rows[0] || {})[0] ?? '';
  const status = String(actualValue) === String(expectedValue) ? 'healthy' : 'failed';
  const result = {
    actualValue,
    expectedValue,
    status,
    rows: output.rows,
    message: status === 'healthy' ? '数据校验通过' : `期望 ${expectedValue}，实际 ${actualValue}`
  };
  if (validation) updateDataValidationResult(db, validation.id, result);
  return result;
}

function resolveConnectionProfile(db, body) {
  const connectionInput = objectValue(body.connection);
  const profileId = optionalId(body.profileId ?? connectionInput.profileId);
  const stored = profileId ? getDatabaseProfile(db, profileId) : null;
  if (profileId && !stored) throw httpError(404, '数据库连接不存在');
  const input = { ...connectionInput, ...pick(body, ['name', 'kind', 'host', 'port', 'databaseName', 'username', 'filePath', 'password']) };
  const profile = stored ? mergeConnectionProfile(stored, input) : {
    name: optionalText(input.name, 80) || '临时数据库连接',
    kind: enumValue(input.kind, DATABASE_KINDS),
    host: optionalText(input.host, 120),
    port: optionalPort(input.port),
    databaseName: optionalText(input.databaseName, 100),
    username: optionalText(input.username, 100),
    filePath: optionalText(input.filePath, 500),
    password: String(input.password || '')
  };
  if (profile.kind === 'sqlite' && !profile.filePath) throw httpError(400, 'SQLite 文件路径不能为空');
  if (profile.kind !== 'sqlite' && !profile.host) throw httpError(400, '数据库地址不能为空');
  return profile;
}

function mergeConnectionProfile(profile, input) {
  return {
    id: profile.id,
    name: optionalText(input.name, 80) || profile.name,
    kind: input.kind ? enumValue(input.kind, DATABASE_KINDS) : profile.kind,
    host: input.host !== undefined ? optionalText(input.host, 120) : profile.host,
    port: input.port !== undefined ? optionalPort(input.port) : profile.port,
    databaseName: input.databaseName !== undefined ? optionalText(input.databaseName, 100) : profile.database_name,
    username: input.username !== undefined ? optionalText(input.username, 100) : profile.username,
    filePath: input.filePath !== undefined ? optionalText(input.filePath, 500) : profile.file_path,
    password: String(input.password || '')
  };
}

function buildTableSelect(kind, table, limit) {
  const name = requireText(table, '数据表名称', 200);
  if (!/^[a-zA-Z0-9_.$]+$/.test(name)) throw httpError(400, '数据表名称格式不正确');
  if (kind === 'sqlite') return `SELECT * FROM "${name.replaceAll('"', '""')}" LIMIT ${limit}`;
  if (kind === 'mysql') return `SELECT * FROM \`${name.replaceAll('`', '``')}\` LIMIT ${limit}`;
  return `SELECT TOP ${limit} * FROM ${name.split('.').map((part) => `[${part.replaceAll(']', ']]')}]`).join('.')}`;
}

async function serveStatic({ request, response, pathname }) {
  if (!['GET', 'HEAD'].includes(request.method || 'GET')) return sendJson(response, 405, { error: '请求方法不支持' });
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  const normalizedPath = normalize(decodedPath).replace(/^([/\\])+/, '');
  const filePath = resolve(PUBLIC_DIR, normalizedPath);
  const publicRoot = resolve(PUBLIC_DIR).replaceAll('\\', '/');
  if (!filePath.replaceAll('\\', '/').startsWith(`${publicRoot}/`)) return sendJson(response, 403, { error: '禁止访问' });
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return sendJson(response, 404, { error: '资源不存在' });
  const body = await readFile(filePath);
  response.statusCode = 200;
  response.setHeader('Content-Type', CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Content-Length', body.length);
  if (request.method === 'HEAD') return response.end();
  return response.end(body);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw httpError(413, '请求内容过大');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw httpError(400, 'JSON 格式不正确');
  }
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Length', Buffer.byteLength(body));
  response.end(body);
}

function sendDownload(response, content, contentType, filename, inline = false) {
  const body = Buffer.from(content, 'utf8');
  response.statusCode = 200;
  response.setHeader('Content-Type', contentType);
  response.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(filename)}`);
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Length', body.length);
  response.end(body);
}

function requireText(value, label, maxLength = 255) {
  const text = String(value ?? '').trim();
  if (!text) throw httpError(400, `${label}不能为空`);
  if (text.length > maxLength) throw httpError(400, `${label}不能超过 ${maxLength} 个字符`);
  return text;
}

function optionalText(value, maxLength = 255) {
  const text = String(value ?? '').trim();
  if (text.length > maxLength) throw httpError(400, `内容不能超过 ${maxLength} 个字符`);
  return text;
}

function enumValue(value, allowed, fallback) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw httpError(400, '缺少必要参数');
  }
  if (!allowed.includes(value)) throw httpError(400, '参数值不在允许范围内');
  return value;
}

function optionalId(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw httpError(400, 'ID 参数不正确');
  return number;
}

function requirePositiveId(value, label) {
  const id = optionalId(value);
  if (!id) throw httpError(400, `缺少${label} ID`);
  return id;
}

function optionalPositiveInteger(value) {
  if (value === undefined || value === null || value === '') return 0;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw httpError(400, '排序值必须是非负整数');
  return number;
}

function optionalPort(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 65535) throw httpError(400, '端口必须在 1 到 65535 之间');
  return number;
}

function optionalDate(value) {
  const text = optionalText(value, 20);
  if (!text) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) throw httpError(400, '日期格式应为 YYYY-MM-DD');
  return text;
}

function boundedLimit(value, fallback, max) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw httpError(400, '数量参数不正确');
  return Math.min(number, max);
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function pick(source, keys) {
  return Object.fromEntries(keys.filter((key) => source?.[key] !== undefined).map((key) => [key, source[key]]));
}

function checkLabel(type) {
  return {
    system: '环境预检',
    dns: 'DNS 解析',
    port: 'TCP 端口',
    http: 'HTTP 响应',
    ping: 'Ping',
    app: '应用健康',
    service: '系统服务',
    database: '数据库连接'
  }[type] || type || '检查';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function httpError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

export { PUBLIC_DIR };
