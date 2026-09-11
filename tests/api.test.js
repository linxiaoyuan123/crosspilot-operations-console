import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { DANGEROUS_CONFIRMATION } from '../src/database.js';

let server;
let db;
let baseUrl;
let tempDirectory;

before(async () => {
  tempDirectory = join(tmpdir(), `deploymate-${randomUUID()}`);
  const app = createApp({ dbPath: join(tempDirectory, 'test.db') });
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
    headers: options.body ? { 'Content-Type': 'application/json', ...options.headers } : options.headers
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();
  return { response, body };
}

async function jsonRequest(path, method, body) {
  return request(path, { method, body: JSON.stringify(body) });
}

test('health endpoint identifies DeployMate 2.0', async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'deploymate');
  assert.equal(body.version, '2.0.0');
});

test('workbench returns an implementation project with staged tasks', async () => {
  const projects = await request('/api/projects');
  assert.equal(projects.response.status, 200);
  assert.equal(projects.body.items.length, 1);
  assert.equal(projects.body.items[0].code, 'DM-2601');
  assert.equal(projects.body.items[0].total_tasks, 8);

  const { response, body } = await request(`/api/workbench?projectId=${projects.body.items[0].id}`);
  assert.equal(response.status, 200);
  assert.equal(body.project.project_name, '华南零售 ERP 门店上线');
  assert.equal(body.nextTasks.length, 5);
  assert.ok(body.recentChecks.length >= 2);
  assert.ok(body.openCases.length >= 2);
});

test('project tasks can be updated and persist', async () => {
  const projects = await request('/api/projects');
  const projectId = projects.body.items[0].id;
  const taskList = await request(`/api/projects/${projectId}/tasks`);
  const task = taskList.body.items.find((item) => item.status !== 'done');

  const updated = await jsonRequest(`/api/tasks/${task.id}`, 'PATCH', {
    status: 'done',
    evidence: '自动化测试完成'
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.status, 'done');
  assert.equal(updated.body.evidence, '自动化测试完成');

  const persisted = await request(`/api/projects/${projectId}`);
  const persistedTask = persisted.body.tasks.find((item) => item.id === task.id);
  assert.equal(persistedTask.status, 'done');
});

test('system and network checks are executed and archived', async () => {
  const projectId = 1;
  const system = await jsonRequest('/api/checks/system', 'POST', {
    projectId,
    memoryMaxPercent: 100,
    diskMinFreeGb: 1,
    cpuMaxLoadPerCore: 999
  });
  assert.equal(system.response.status, 201);
  assert.equal(system.body.check_type, 'system');
  assert.ok(system.body.results.length >= 5);

  const port = Number(new URL(baseUrl).port);
  const network = await jsonRequest('/api/checks/network', 'POST', {
    projectId,
    type: 'app',
    port
  });
  assert.equal(network.response.status, 201);
  assert.equal(network.body.status, 'healthy');

  const history = await request(`/api/checks/history?projectId=${projectId}&limit=20`);
  assert.equal(history.response.status, 200);
  assert.ok(history.body.items.some((item) => item.check_type === 'system'));
  assert.ok(history.body.items.some((item) => item.check_type === 'network'));
});

test('network checks reject unsafe target input', async () => {
  const { response, body } = await jsonRequest('/api/checks/network', 'POST', {
    projectId: 1,
    type: 'dns',
    target: '--bad-target'
  });
  assert.equal(response.status, 400);
  assert.match(body.error, /目标格式/);
});

test('SQLite connection, schema, read-only query and CSV export work', async () => {
  const profiles = await request('/api/db/profiles?projectId=1');
  assert.equal(profiles.response.status, 200);
  const profile = profiles.body.items.find((item) => item.kind === 'sqlite');
  assert.ok(profile);

  const connection = await jsonRequest('/api/db/test', 'POST', { profileId: profile.id });
  assert.equal(connection.response.status, 200);
  assert.equal(connection.body.ok, true);
  assert.ok(connection.body.tableCount >= 4);

  const schema = await jsonRequest('/api/db/schema', 'POST', { profileId: profile.id });
  assert.equal(schema.response.status, 200);
  assert.ok(schema.body.items.some((table) => table.name === 'stores'));

  const query = await jsonRequest('/api/db/query', 'POST', {
    profileId: profile.id,
    sqlText: 'SELECT store_code, store_name FROM stores ORDER BY store_code LIMIT 3'
  });
  assert.equal(query.response.status, 200);
  assert.equal(query.body.mode, 'read');
  assert.equal(query.body.rows.length, 3);

  const exported = await request('/api/db/export', {
    method: 'POST',
    body: JSON.stringify({ profileId: profile.id, table: 'stores', limit: 5 })
  });
  assert.equal(exported.response.status, 200);
  assert.match(exported.body, /store_code/);
  assert.match(exported.body, /天河旗舰店/);
});

test('SQL safety blocks writes in read-only mode and requires confirmation for DDL', async () => {
  const profiles = await request('/api/db/profiles?projectId=1');
  const profile = profiles.body.items.find((item) => item.kind === 'sqlite');

  const readOnlyWrite = await jsonRequest('/api/db/query', 'POST', {
    profileId: profile.id,
    sqlText: "DELETE FROM sync_log WHERE status = 'warning'"
  });
  assert.equal(readOnlyWrite.response.status, 400);
  assert.match(readOnlyWrite.body.error, /只读模式/);

  const dangerousWithoutConfirmation = await jsonRequest('/api/db/query', 'POST', {
    profileId: profile.id,
    sqlText: 'CREATE TABLE audit_probe (id INTEGER PRIMARY KEY)',
    allowWrite: true
  });
  assert.equal(dangerousWithoutConfirmation.response.status, 400);
  assert.match(dangerousWithoutConfirmation.body.error, new RegExp(DANGEROUS_CONFIRMATION));

  const dangerousWithConfirmation = await jsonRequest('/api/db/query', 'POST', {
    profileId: profile.id,
    sqlText: 'CREATE TABLE audit_probe (id INTEGER PRIMARY KEY)',
    allowWrite: true,
    confirmPhrase: DANGEROUS_CONFIRMATION
  });
  assert.equal(dangerousWithConfirmation.response.status, 200);
  assert.equal(dangerousWithConfirmation.body.mode, 'dangerous');
});

test('data validation executes a saved template', async () => {
  const validations = await request('/api/db/validations?projectId=1');
  assert.equal(validations.response.status, 200);
  const validation = validations.body.items.find((item) => item.name === '门店区域编码完整性');

  const result = await jsonRequest('/api/db/validate', 'POST', { validationId: validation.id });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.status, 'failed');
  assert.equal(String(result.body.actualValue), '2');
});

test('support case lifecycle, timeline and knowledge conversion work', async () => {
  const created = await jsonRequest('/api/cases', 'POST', {
    projectId: 1,
    title: '测试客户无法登录门店后台',
    customer: '测试客户',
    symptom: '用户输入正确账号后提示授权失败。',
    impact: '门店管理员无法查看日报。',
    priority: 'high',
    status: 'open',
    category: '账号角色',
    assignee: '测试工程师',
    rootCause: '账号未绑定门店组织。',
    resolution: '补充组织关系后重新登录成功。',
    nextAction: '观察一个运行日。'
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.events.length, 1);

  const event = await jsonRequest(`/api/cases/${created.body.id}/events`, 'POST', {
    eventType: 'diagnostic',
    title: '检查账号组织关系',
    detail: '确认账号存在但未绑定门店。'
  });
  assert.equal(event.response.status, 201);

  const resolved = await jsonRequest(`/api/cases/${created.body.id}`, 'PATCH', {
    status: 'resolved'
  });
  assert.equal(resolved.response.status, 200);
  assert.equal(resolved.body.status, 'resolved');
  assert.ok(resolved.body.resolved_at);
  assert.ok(resolved.body.events.some((item) => item.title === '问题解决'));

  const knowledge = await jsonRequest(`/api/cases/${created.body.id}/knowledge`, 'POST', {});
  assert.equal(knowledge.response.status, 201);
  assert.equal(knowledge.body.title, '测试客户无法登录门店后台');
  assert.match(knowledge.body.solution, /账号未绑定门店组织/);
});

test('handover checklist items can be created and completed', async () => {
  const created = await jsonRequest('/api/handover/1', 'POST', {
    category: 'document',
    title: '确认测试交付文档',
    status: 'pending',
    owner: '测试工程师',
    dueDate: '2026-09-30',
    evidence: '测试文档草稿'
  });
  assert.equal(created.response.status, 201);

  const completed = await jsonRequest(`/api/handover/1/${created.body.id}`, 'PATCH', {
    status: 'done',
    evidence: '客户已确认'
  });
  assert.equal(completed.response.status, 200);
  assert.equal(completed.body.status, 'done');
  assert.equal(completed.body.evidence, '客户已确认');
});

test('reports support HTML, Markdown, CSV and omit sensitive fields', async () => {
  const html = await request('/api/reports/project/1?format=html');
  assert.equal(html.response.status, 200);
  assert.match(html.body, /华南零售 ERP 门店上线实施交付报告/);
  assert.doesNotMatch(html.body, /password|secret|token/i);

  const markdown = await request('/api/reports/handover/1?format=md');
  assert.equal(markdown.response.status, 200);
  assert.match(markdown.body, /培训验收报告/);

  const csv = await request('/api/reports/check/1?format=csv');
  assert.equal(csv.response.status, 200);
  assert.match(csv.body, /检查类型/);
});

test('static application shell is branded as DeployMate', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /DeployMate 实施交付工作台/);
  assert.match(html, /今日工作台/);
  assert.match(html, /\/pig\.png/);
  assert.doesNotMatch(html, /SupportOps Console/);
});
