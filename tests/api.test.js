import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

let server;
let db;
let baseUrl;
let tempDirectory;

before(async () => {
  tempDirectory = join(tmpdir(), `supportops-${randomUUID()}`);
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

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
}

test('health endpoint reports the service version', async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'supportops-console');
  assert.equal(body.version, '1.0.0');
});

test('dashboard returns seeded operational data', async () => {
  const { response, body } = await request('/api/dashboard');
  assert.equal(response.status, 200);
  assert.ok(body.tickets.total >= 6);
  assert.ok(body.deployments.total >= 4);
  assert.ok(Array.isArray(body.recentTickets));
});

test('ticket lifecycle supports create and update', async () => {
  const created = await request('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '测试环境登录异常',
      customer: '测试客户',
      priority: 'high',
      category: '技术支持',
      assignee: '测试工程师'
    })
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.status, 'open');

  const updated = await request(`/api/tickets/${created.body.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'resolved',
      resolution: '检查授权配置后恢复登录。'
    })
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.status, 'resolved');
  assert.equal(updated.body.resolution, '检查授权配置后恢复登录。');
});

test('deployment progress can be created and updated', async () => {
  const created = await request('/api/deployments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName: '测试部署项目',
      customer: '测试客户',
      environment: '预发布环境',
      owner: '测试工程师',
      progress: 10,
      currentStep: '环境检查',
      dueDate: '2026-10-01'
    })
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.progress, 10);

  const updated = await request(`/api/deployments/${created.body.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress: 75, status: 'testing', currentStep: '用户培训' })
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.progress, 75);
  assert.equal(updated.body.status, 'testing');
});

test('validation rejects unsafe diagnostic targets', async () => {
  const { response, body } = await request('/api/diagnostics/network', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'dns', target: '--bad-target' })
  });

  assert.equal(response.status, 400);
  assert.match(body.error, /目标格式/);
});

test('static application shell is served', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /SupportOps Console/);
  assert.match(html, /id="app"/);
});
