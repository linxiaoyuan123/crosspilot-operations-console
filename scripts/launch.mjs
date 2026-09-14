import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverEntry = path.join(projectRoot, 'src', 'server.js');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3100);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`[CrossPilot] Invalid PORT value: ${process.env.PORT}`);
  process.exit(1);
}

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 24) {
  console.error(`[CrossPilot] Node.js 24 or newer is required. Current version: ${process.versions.node}`);
  process.exit(1);
}

const connectionHost = host === '0.0.0.0'
  ? '127.0.0.1'
  : host.includes(':') && !host.startsWith('[')
    ? `[${host}]`
    : host;
const appUrl = `http://${connectionHost}:${port}`;
const noOpen = process.argv.includes('--no-open');
let serverProcess = null;
let shuttingDown = false;

async function isServerReady() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 500);

  try {
    const response = await fetch(`${appUrl}/api/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function openBrowser() {
  if (noOpen) return;

  const commands = {
    win32: ['cmd.exe', ['/d', '/s', '/c', 'start', '', appUrl]],
    darwin: ['open', [appUrl]],
    linux: ['xdg-open', [appUrl]],
  };
  const command = commands[process.platform];

  if (!command) {
    console.log(`[CrossPilot] Open ${appUrl} in your browser.`);
    return;
  }

  const browser = spawn(command[0], command[1], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  browser.on('error', () => {
    console.log(`[CrossPilot] Could not open the browser automatically. Open ${appUrl} manually.`);
  });
  browser.unref();
}

function stopServer(signal = 'SIGTERM') {
  if (shuttingDown) return;
  shuttingDown = true;

  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill(signal);
  }
}

process.on('SIGINT', () => stopServer('SIGINT'));
process.on('SIGTERM', () => stopServer('SIGTERM'));
process.on('exit', () => stopServer());

if (await isServerReady()) {
  console.log(`[CrossPilot] Already running at ${appUrl}`);
  openBrowser();
  process.exit(0);
}

console.log('[CrossPilot] Starting the local service...');
serverProcess = spawn(process.execPath, [serverEntry], {
  cwd: projectRoot,
  env: {
    ...process.env,
    HOST: host,
    PORT: String(port),
  },
  stdio: 'inherit',
});

let startupError = '';
serverProcess.on('error', (error) => {
  startupError = error.message;
});

const deadline = Date.now() + 20_000;
let ready = false;

while (Date.now() < deadline) {
  if (serverProcess.exitCode !== null) {
    startupError ||= `The service exited with code ${serverProcess.exitCode}.`;
    break;
  }

  if (await isServerReady()) {
    ready = true;
    break;
  }

  await new Promise((resolve) => setTimeout(resolve, 250));
}

if (!ready) {
  stopServer();
  console.error(`[CrossPilot] Startup failed: ${startupError || 'the service did not become ready within 20 seconds.'}`);
  process.exit(1);
}

console.log(`[CrossPilot] Ready at ${appUrl}`);
console.log('[CrossPilot] Press Ctrl+C to stop the service.');
openBrowser();

if (serverProcess.exitCode !== null) {
  process.exit(serverProcess.exitCode ?? 0);
}

await new Promise((resolve) => {
  serverProcess.once('exit', resolve);
});
