import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.CROSSPILOT_WEB_URL || 'http://127.0.0.1:4321';
const apiUrl = process.env.CROSSPILOT_API_URL || 'http://127.0.0.1:3100';
const outputDirectory = resolve('public', 'assets', 'readme');

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1.25
});

await page.addInitScript(() => {
  document.documentElement.style.scrollBehavior = 'auto';
});

await page.route(/\/(api|uploads)\//, async (route) => {
  const source = new URL(route.request().url());
  const target = new URL(apiUrl);
  target.pathname = source.pathname.replace(/\/$/, '');
  target.search = source.search;
  const response = await route.fetch({ url: target.toString() });
  await route.fulfill({ response });
});

async function prepare(path, readySelector) {
  await page.goto(new URL(path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
  await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(500);
}

async function capture(name, path, readySelector, focusSelector) {
  await prepare(path, readySelector);
  if (focusSelector) {
    await page.locator(focusSelector).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  }

  const artifactPath = resolve('artifacts', 'readme-shots', `${name}.jpg`);
  await mkdir(resolve('artifacts', 'readme-shots'), { recursive: true });
  await page.screenshot({ path: artifactPath, type: 'jpeg', quality: 88, animations: 'disabled' });

  await copyFile(artifactPath, resolve(outputDirectory, `${name}.jpg`));
}

await capture('current-home', '/', '.home-library .home-story');
await capture('current-articles', '/articles/', '.article-list .article', '.page-head');
await capture('current-studio', '/studio/', '.studio-layout', '.studio-head');
await capture('current-gallery', '/gallery/', '.content-grid, .cp-empty', '.page-head');

await browser.close();
console.log('Saved README screenshots to public/assets/readme');
