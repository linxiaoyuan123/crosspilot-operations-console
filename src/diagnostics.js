import { execFile } from 'node:child_process';
import { promises as dns } from 'node:dns';
import { statfsSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import { parse } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function collectSystemInfo() {
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
      used: total - free,
      usedPercent: total ? Math.round(((total - free) / total) * 100) : 0
    };
  } catch {
    disk = null;
  }

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuModel: os.cpus()[0]?.model || '',
    cpuCount: os.cpus().length,
    loadAverage: os.loadavg().map((value) => Number(value.toFixed(2))),
    memory: {
      total: totalMemory,
      free: freeMemory,
      used: totalMemory - freeMemory,
      usedPercent: totalMemory ? Math.round(((totalMemory - freeMemory) / totalMemory) * 100) : 0
    },
    disk,
    uptimeSeconds: Math.round(os.uptime()),
    processUptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
    pid: process.pid,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    checkedAt: new Date().toISOString()
  };
}

export function runSystemCheck(input = {}) {
  const info = collectSystemInfo();
  const thresholds = {
    memoryMaxPercent: clampPercent(input.memoryMaxPercent, 85),
    diskMinFreeGb: positiveNumber(input.diskMinFreeGb, 10),
    cpuMaxLoadPerCore: positiveNumber(input.cpuMaxLoadPerCore, 2.5)
  };
  const loadOne = Number(info.loadAverage[0] || 0);
  const loadPerCore = info.cpuCount ? loadOne / info.cpuCount : 0;
  const diskFreeGb = info.disk ? info.disk.free / 1024 / 1024 / 1024 : 0;

  const details = [
    resultItem(
      'platform',
      '操作系统',
      'Windows 或 Linux',
      `${info.platform} ${info.release} (${info.arch})`,
      info.platform ? 'healthy' : 'failed',
      `${info.hostname} · ${info.cpuModel || 'CPU 信息不可用'}`
    ),
    resultItem(
      'cpu',
      'CPU 与负载',
      `单核负载 <= ${thresholds.cpuMaxLoadPerCore}`,
      `${loadPerCore.toFixed(2)} / ${info.cpuCount} 核`,
      loadPerCore <= thresholds.cpuMaxLoadPerCore ? 'healthy' : 'warning',
      `5 分钟负载 ${info.loadAverage[1] ?? 0}，15 分钟负载 ${info.loadAverage[2] ?? 0}`
    ),
    resultItem(
      'memory',
      '内存',
      `使用率 <= ${thresholds.memoryMaxPercent}%`,
      `${info.memory.usedPercent}%`,
      info.memory.usedPercent <= thresholds.memoryMaxPercent ? 'healthy' : 'warning',
      `已用 ${formatBytes(info.memory.used)} / 总计 ${formatBytes(info.memory.total)}`
    ),
    resultItem(
      'disk',
      '磁盘',
      `可用空间 >= ${thresholds.diskMinFreeGb} GB`,
      info.disk ? `${diskFreeGb.toFixed(1)} GB 可用` : '不可读取',
      !info.disk ? 'warning' : diskFreeGb >= thresholds.diskMinFreeGb ? 'healthy' : 'warning',
      info.disk ? `${info.disk.path} 已用 ${info.disk.usedPercent}%` : '当前平台无法读取磁盘统计'
    ),
    resultItem(
      'runtime',
      '运行环境',
      'Node.js 可正常运行',
      `Node.js ${info.nodeVersion}`,
      'healthy',
      `时区 ${info.timezone || '未知'}，进程 PID ${info.pid}`
    )
  ];

  return {
    type: 'system',
    target: info.hostname,
    status: summarizeStatus(details),
    summary: `${info.platform} ${info.release} · CPU ${info.cpuCount} 核 · 内存使用 ${info.memory.usedPercent}%`,
    details,
    raw: info
  };
}

export async function runNetworkDiagnostic(body = {}) {
  const type = enumValue(body.type, ['dns', 'port', 'http', 'ping', 'app', 'service']);
  const startedAt = performance.now();
  const target = type === 'app' ? '127.0.0.1' : requireText(body.target, '检查目标', 253);

  if (type === 'app') {
    const port = numberInRange(body.port ?? process.env.PORT ?? 3100, 1, 65535);
    const result = await checkPort(target, port, 3000);
    return networkResult(type, `${target}:${port}`, result.ok ? 'healthy' : 'failed', result.latencyMs, result.detail);
  }

  assertSafeTarget(target, type);

  if (type === 'dns') {
    try {
      const addresses = await dns.lookup(target, { all: true });
      return networkResult(
        type,
        target,
        'healthy',
        Math.round(performance.now() - startedAt),
        addresses.map((item) => `${item.address} (IPv${item.family})`).join(', ')
      );
    } catch (error) {
      return networkResult(type, target, 'failed', Math.round(performance.now() - startedAt), error.code || error.message);
    }
  }

  if (type === 'port') {
    const port = numberInRange(body.port, 1, 65535);
    const result = await checkPort(target, port, 5000);
    return networkResult(type, `${target}:${port}`, result.ok ? 'healthy' : 'failed', result.latencyMs, result.detail);
  }

  if (type === 'http') {
    const url = normalizeHttpUrl(target);
    try {
      const apiResponse = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(6000)
      });
      return networkResult(
        type,
        url.toString(),
        apiResponse.ok ? 'healthy' : 'warning',
        Math.round(performance.now() - startedAt),
        `HTTP ${apiResponse.status} ${apiResponse.statusText}`.trim()
      );
    } catch (error) {
      return networkResult(type, url.toString(), 'failed', Math.round(performance.now() - startedAt), error.name || error.message);
    }
  }

  if (type === 'ping') {
    const args = os.platform() === 'win32' ? ['-n', '3', target] : ['-c', '3', target];
    try {
      const { stdout } = await execFileAsync('ping', args, { timeout: 8000, maxBuffer: 64 * 1024 });
      return networkResult(type, target, 'healthy', Math.round(performance.now() - startedAt), stdout.trim().slice(0, 1600));
    } catch (error) {
      return networkResult(
        type,
        target,
        'failed',
        Math.round(performance.now() - startedAt),
        String(error.stdout || error.stderr || error.message || 'Ping 失败').trim().slice(0, 1600)
      );
    }
  }

  if (type === 'service') {
    const command = os.platform() === 'win32' ? 'sc' : 'systemctl';
    const args = os.platform() === 'win32'
      ? ['query', target]
      : ['is-active', target];
    try {
      const { stdout, stderr } = await execFileAsync(command, args, { timeout: 6000, maxBuffer: 64 * 1024 });
      const detail = String(stdout || stderr || '').trim();
      const healthy = os.platform() !== 'win32' ? detail === 'active' : /RUNNING/i.test(detail);
      return networkResult(type, target, healthy ? 'healthy' : 'warning', Math.round(performance.now() - startedAt), detail);
    } catch (error) {
      return networkResult(
        type,
        target,
        'failed',
        Math.round(performance.now() - startedAt),
        String(error.stdout || error.stderr || error.message || '服务检查失败').trim().slice(0, 1600)
      );
    }
  }

  throw diagnosticError('不支持的检查类型');
}

export function networkResult(type, target, status, latencyMs, detail, extras = {}) {
  return {
    type,
    target,
    status,
    latencyMs,
    detail,
    summary: detail,
    details: [{
      key: type,
      label: networkLabel(type),
      expected: type === 'dns' ? '可以解析' : type === 'port' ? 'TCP 可连接' : type === 'http' ? 'HTTP 2xx/3xx' : type === 'service' ? '服务运行中' : '网络可达',
      actual: detail,
      status,
      detail: ''
    }],
    checkedAt: new Date().toISOString(),
    ...extras
  };
}

export function checkPort(host, port, timeoutMs) {
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
    socket.once('connect', () => finish(true, 'TCP 连接成功'));
    socket.once('timeout', () => finish(false, `连接超时（${timeoutMs}ms）`));
    socket.once('error', (error) => finish(false, error.code || error.message));
  });
}

export function summarizeStatus(items) {
  if (items.some((item) => item.status === 'failed')) return 'failed';
  if (items.some((item) => item.status === 'warning')) return 'warning';
  return 'healthy';
}

function resultItem(key, label, expected, actual, status, detail = '') {
  return { key, label, expected, actual, status, detail };
}

function networkLabel(type) {
  return {
    dns: 'DNS 解析',
    port: 'TCP 端口',
    http: 'HTTP 响应',
    ping: 'Ping 延迟',
    app: '应用健康',
    service: '系统服务'
  }[type] || type;
}

function assertSafeTarget(target, type) {
  if (target.startsWith('-')) throw diagnosticError('目标格式不正确');
  if (type === 'service') {
    if (!/^[a-zA-Z0-9_.\-]+$/.test(target)) throw diagnosticError('服务名称格式不正确');
    return;
  }
  if (!/^[a-zA-Z0-9.:\-_/]+$/.test(target)) throw diagnosticError('目标格式不正确');
}

function normalizeHttpUrl(target) {
  try {
    return new URL(/^https?:\/\//.test(target) ? target : `https://${target}`);
  } catch {
    throw diagnosticError('请输入有效 URL');
  }
}

function clampPercent(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(1, Math.min(100, Math.round(number)));
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function formatBytes(value) {
  if (!Number.isFinite(Number(value))) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let number = Number(value);
  let index = 0;
  while (number >= 1024 && index < units.length - 1) {
    number /= 1024;
    index += 1;
  }
  return `${number.toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function requireText(value, label, maxLength) {
  const text = String(value || '').trim();
  if (!text) throw diagnosticError(`${label}不能为空`);
  if (text.length > maxLength) throw diagnosticError(`${label}不能超过 ${maxLength} 个字符`);
  return text;
}

function enumValue(value, allowed) {
  if (!allowed.includes(value)) throw diagnosticError('检查类型不正确');
  return value;
}

function numberInRange(value, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw diagnosticError(`端口必须在 ${min} 到 ${max} 之间`);
  }
  return number;
}

function diagnosticError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.publicMessage = message;
  return error;
}
