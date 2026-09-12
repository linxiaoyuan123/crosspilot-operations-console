import { createApp } from './app.js';

const port = Number(process.env.PORT || 3100);
const host = process.env.HOST || '127.0.0.1';
const { server, db } = createApp();

server.listen(port, host, () => {
  console.log(`CrossPilot cross-border operations console running at http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received, closing server...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
