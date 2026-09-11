import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promises as dns } from 'node:dns';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { statfsSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import { dirname, extname, normalize, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  createDatabase,
  createDeployment,
  createKnowledge,
  createTicket,
  getDashboard,
  getKnowledge,
  getTicket,
  listDeployments,
  listDiagnostics,
  listKnowledge,
  listTickets,
  saveDiagnostic,
  updateDeployment,
  updateTicket
} from './db.js';

const execFileAsync = promisify(execFile);
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(MODULE_DIR, '..', 'public');
const MAX_BODY_BYTES = 1024 * 1024;
const VERSION = '1.0.0';

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

export function createApp({ dbPath } = {}) {
  const db = createDatabase(dbPath);

  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');

    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      if (requestUrl.pathname.startsWith('/api/')) {
        await handleApi({ db, request, response, requestUrl });
      } else {
        await serveStatic({ request, response, pathname: requestUrl.pathname });
      }
    } catch (error) {
      const status = error.statusCode || 500;
      if (status >= 500) console.error(error);
      sendJson(response, status, { error: error.publicMessage || '服务器内部错误' });
    }
  });

  return { server, db };
}

async function handleApi({ db, request, response, requestUrl }) {
  const { pathname } = requestUrl;
  const method = request.method || 'GET';

  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(response, 200, {
      status: 'ok',
      service: 'supportops-console',
      version: VERSION,
      timestamp: new Date().toISOString()
    });
  }

  if (method === 'GET' && pathname === '/api/dashboard') {
    return sendJson(response, 200, getDashboard(db));
  }

  if (method === 'GET' && pathname === '/api/tickets') {
    return sendJson(response, 200, {
      items: listTickets(db, {
        status: requestUrl.searchParams.get('status') || '',
        priority: requestUrl.searchParams.get('priority') || '',
        q: requestUrl.searchParams.get('q') || ''
      })
    });
  }

  if (method === 'POST' && pathname === '/api/tickets') {
    const body = await readJsonBody(request);
    const ticket = createTicket(db, {
      title: requireText(body.title, '标题', 120),
      customer: requireText(body.customer, '客户', 80),
      priority: enumValue(body.priority, ['low', 'medium', 'high', 'critical'], 'medium'),
      status: enumValue(body.status, ['open', 'in_progress', 'waiting', 'resolved', 'closed'], 'open'),
      category: optionalText(body.category, 40),
      assignee: optionalText(body.assignee, 40),
      description: optionalText(body.description, 2000),
      resolution: optionalText(body.resolution, 2000)
    });
    return sendJson(response, 201, ticket);
  }

  const ticketMatch = pathname.match(/^\/api\/tickets\/(\d+)$/);
  if (ticketMatch && method === 'GET') {
    const ticket = getTicket(db, Number(ticketMatch[1]));
    if (!ticket) return sendJson(response, 404, { error: '工单不存在' });
    return sendJson(response, 200, ticket);
  }

  if (ticketMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const ticket = updateTicket(db, Number(ticketMatch[1]), {
      ...(body.title !== undefined ? { title: requireText(body.title, '标题', 120) } : {}),
      ...(body.customer !== undefined ? { customer: requireText(body.customer, '客户', 80) } : {}),
      ...(body.priority !== undefined ? { priority: enumValue(body.priority, ['low', 'medium', 'high', 'critical']) } : {}),
      ...(body.status !== undefined ? { status: enumValue(body.status, ['open', 'in_progress', 'waiting', 'resolved', 'closed']) } : {}),
      ...(body.category !== undefined ? { category: optionalText(body.category, 40) } : {}),
      ...(body.assignee !== undefined ? { assignee: optionalText(body.assignee, 40) } : {}),
      ...(body.description !== undefined ? { description: optionalText(body.description, 2000) } : {}),
      ...(body.resolution !== undefined ? { resolution: optionalText(body.resolution, 2000) } : {})
    });
    if (!ticket) return sendJson(response, 404, { error: '工单不存在' });
    return sendJson(response, 200, ticket);
  }

  if (method === 'GET' && pathname === '/api/deployments') {
    return sendJson(response, 200, { items: listDeployments(db) });
  }

  if (method === 'POST' && pathname === '/api/deployments') {
    const body = await readJsonBody(request);
    const deployment = createDeployment(db, {
      projectName: requireText(body.projectName, '项目名称', 120),
      customer: requireText(body.customer, '客户', 80),
      environment: optionalText(body.environment, 60),
      owner: optionalText(body.owner, 40),
      status: enumValue(body.status, ['planning', 'deploying', 'testing', 'live', 'at_risk'], 'planning'),
      progress: numberInRange(body.progress, 0, 100, 0),
      currentStep: optionalText(body.currentStep, 120),
      dueDate: optionalIsoDate(body.dueDate)
    });
    return sendJson(response, 201, deployment);
  }

  const deploymentMatch = pathname.match(/^\/api\/deployments\/(\d+)$/);
  if (deploymentMatch && method === 'PATCH') {
    const body = await readJsonBody(request);
    const deployment = updateDeployment(db, Number(deploymentMatch[1]), {
      ...(body.projectName !== undefined ? { projectName: requireText(body.projectName, '项目名称', 120) } : {}),
      ...(body.customer !== undefined ? { customer: requireText(body.customer, '客户', 80) } : {}),
      ...(body.environment !== undefined ? { environment: optionalText(body.environment, 60) } : {}),
      ...(body.owner !== undefined ? { owner: optionalText(body.owner, 40) } : {}),
      ...(body.status !== undefined ? { status: enumValue(body.status, ['planning', 'deploying', 'testing', 'live', 'at_risk']) } : {}),
      ...(body.progress !== undefined ? { progress: numberInRange(body.progress, 0, 100) } : {}),
      ...(body.currentStep !== undefined ? { currentStep: optionalText(body.currentStep, 120) } : {}),
      ...(body.dueDate !== undefined ? { dueDate: optionalIsoDate(body.dueDate) } : {})
    });
    if (!deployment) return sendJson(response, 404, { error: '实施项目不存在' });
    return sendJson(response, 200, deployment);
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
    const article = createKnowledge(db, {
      title: requireText(body.title, '标题', 120),
      category: optionalText(body.category, 40),
      symptom: requireText(body.symptom, '问题现象', 2000),
      solution: requireText(body.solution, '解决方案', 4000),
      tags: optionalText(body.tags, 200)
    });
    return sendJson(response, 201, article);
  }

  const knowledgeMatch = pathname.match(/^\/api\/knowledge\/(\d+)$/);
  if (knowledgeMatch && method === 'GET') {
    const article = getKnowledge(db, Number(knowledgeMatch[1]));
    if (!article) return sendJson(response, 404, { error: '知识条目不存在' });
    return sendJson(response, 200, article);
  }

  if (method === 'GET' && pathname === '/api/diagnostics/system') {
    return sendJson(response, 200, collectSystemInfo());
  }

  if (method === 'GET' && pathname === '/api/diagnostics/history') {
    return sendJson(response, 200, { items: listDiagnostics(db) });
  }

  if (method === 'POST' && pathname === '/api/diagnostics/network') {
    const body = await readJsonBody(request);
    const result = await runNetworkDiagnostic(body);
    saveDiagnostic(db, result);
    return sendJson(response, 200, result);
  }

  return sendJson(response, 404, { error: '接口不存在' });
}

async function serveStatic({ request, response, pathname }) {
  if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
    return sendJson(response, 405, { error: '请求方法不支持' });
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  const normalizedPath = normalize(decodedPath).replace(/^([/\\])+/, '');
  const filePath = resolve(PUBLIC_DIR, normalizedPath);
  const publicRoot = resolve(PUBLIC_DIR).replaceAll('\\', '/');
  const comparablePath = filePath.replaceAll('\\', '/');

  if (!comparablePath.startsWith(`${publicRoot}/`)) {
    return sendJson(response, 403, { error: '禁止访问' });
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return sendJson(response, 404, { error: '资源不存在' });
  }

  const body = await readFile(filePath);
  response.statusCode = 200;
  response.setHeader('Content-Type', CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Content-Length', body.length);
  if (request.method === 'HEAD') return response.end();
  return response.end(body);
}

async function runNetworkDiagnostic(body) {
  const type = enumValue(body.type, ['dns', 'port', 'http', 'ping', 'app']);
  const startedAt = performance.now();

  if (type === 'app') {
    const target = '127.0.0.1';
    const port = Number(process.env.PORT || 3100);
    const result = await checkPort(target, port, 3000);
    return { type, target: `${target}:${port}`, status: result.ok ? 'healthy' : 'failed', latencyMs: result.latencyMs, detail: result.detail };
  }

  const target = requireText(body.target, '检查目标', 253);
  if (target.startsWith('-') || !/^[a-zA-Z0-9.:\-_/]+$/.test(target)) {
    throw httpError(400, '目标格式不正确');
  }

  if (type === 'dns') {
    try {
      const addresses = await dns.lookup(target, { all: true });
      return {
        type,
        target,
        status: 'healthy',
        latencyMs: Math.round(performance.now() - startedAt),
        detail: addresses.map((item) => `${item.address} (${item.family})`).join(', ')
      };
    } catch (error) {
      return { type, target, status: 'failed', latencyMs: Math.round(performance.now() - startedAt), detail: error.code || error.message };
    }
  }

  if (type === 'port') {
    const port = numberInRange(body.port, 1, 65535);
    const result = await checkPort(target, port, 5000);
    return { type, target: `${target}:${port}`, status: result.ok ? 'healthy' : 'failed', latencyMs: result.latencyMs, detail: result.detail };
  }

  if (type === 'http') {
    let url;
    try {
      url = new URL(/^https?:\/\//.test(target) ? target : `https://${target}`);
    } catch {
      throw httpError(400, '请输入有效URL');
    }
    try {
      const apiResponse = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(6000) });
      return {
        type,
        target: url.toString(),
        status: apiResponse.ok ? 'healthy' : 'warning',
        latencyMs: Math.round(performance.now() - startedAt),
        detail: `HTTP ${apiResponse.status} ${apiResponse.statusText}`.trim()
      };
    } catch (error) {
      return { type, target: url.toString(), status: 'failed', latencyMs: Math.round(performance.now() - startedAt), detail: error.name || error.message };
    }
  }

  if (type === 'ping') {
    const args = os.platform() === 'win32' ? ['-n', '3', target] : ['-c', '3', target];
    try {
      const { stdout } = await execFileAsync('ping', args, { timeout: 8000, maxBuffer: 64 * 1024 });
      return {
        type,
        target,
        status: 'healthy',
        latencyMs: Math.round(performance.now() - startedAt),
        detail: stdout.trim().slice(0, 1600)
      };
    } catch (error) {
      const detail = (error.stdout || error.stderr || error.message || 'Ping失败').trim().slice(0, 1600);
      return { type, target, status: 'failed', latencyMs: Math.round(performance.now() - startedAt), detail };
    }
  }

  throw httpError(400, '不支持的检查类型');
}

function checkPort(host, port, timeoutMs) {
  const startedAt = performance.now();
  return new Promise((resolveResult) => {
    const socket = net.createConnection({ host, port });
    let settled = false;
    const finish = (ok, detail) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolveResult({ ok, detail, latencyMs: Math.round(performance.now() - startedAt) });
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true, 'TCP连接成功'));
    socket.once('timeout', () => finish(false, `连接超时（${timeoutMs}ms）`));
    socket.once('error', (error) => finish(false, error.code || error.message));
  });
}

function collectSystemInfo() {
  const root = parse(process.cwd()).root;
  let disk = null;
  try {
    const stats = statfsSync(root);
    const total = Number(stats.blocks) * Number(stats.bsize);
    const free = Number(stats.bavail) * Number(stats.bsize);
    disk = {
      path: root,
      total,
      free,
      usedPercent: total ? Math.round(((total - free) / total) * 100) : 0
    };
  } catch {
    disk = null;
  }

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuCount: os.cpus().length,
    loadAverage: os.loadavg().map((value) => Number(value.toFixed(2))),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      usedPercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
    },
    uptimeSeconds: Math.round(os.uptime()),
    processUptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
    pid: process.pid,
    disk
  };
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
    throw httpError(400, 'JSON格式不正确');
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

function requireText(value, label, maxLength = 255) {
  const text = String(value || '').trim();
  if (!text) throw httpError(400, `${label}不能为空`);
  if (text.length > maxLength) throw httpError(400, `${label}不能超过${maxLength}个字符`);
  return text;
}

function optionalText(value, maxLength = 255) {
  const text = String(value || '').trim();
  if (text.length > maxLength) throw httpError(400, `内容不能超过${maxLength}个字符`);
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

function numberInRange(value, min, max, fallback) {
  if ((value === undefined || value === null || value === '') && fallback !== undefined) return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw httpError(400, `数值必须在${min}到${max}之间`);
  }
  return Math.round(number);
}

function optionalIsoDate(value) {
  const text = optionalText(value, 20);
  if (!text) return new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) {
    throw httpError(400, '日期格式应为 YYYY-MM-DD');
  }
  return text;
}

function httpError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

export { PUBLIC_DIR };
