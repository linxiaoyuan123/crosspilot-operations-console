import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.CROSSPILOT_URL || 'http://127.0.0.1:3100';
const outputDirectory = resolve('artifacts', 'guide-shots');
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});

await page.addInitScript(() => {
  document.documentElement.style.scrollBehavior = 'auto';
});

async function open(path, readySelector) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
}

async function captureViewport(name, selector) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: 'visible', timeout: 20000 });
  await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    for (const header of document.querySelectorAll('.app-header')) {
      header.style.position = 'static';
    }
  });
  await page.waitForTimeout(200);
  await page.screenshot({
    path: resolve(outputDirectory, `${name}.png`),
    animations: 'disabled',
  });
}

await open('/overview', '#app .view-head');
await page.locator('#global-store-toggle').click();
await page.screenshot({
  path: resolve(outputDirectory, 'guide-store-picker.png'),
  clip: { x: 0, y: 0, width: 1280, height: 300 },
  animations: 'disabled',
});

await open('/imports', '.cp-import-grid');
await captureViewport('guide-import-report', '.cp-import-grid');

await open('/overview', '.cp-dashboard-grid');
await captureViewport('guide-operations-overview', '#app > .metric-grid');
await captureViewport('guide-action-center', '.cp-dashboard-grid');

await open('/listings', '.cp-split-layout');
await captureViewport('guide-listing-score', '.cp-split-layout');

await open('/ads', '.cp-recommendation-grid');
await captureViewport('guide-ads-search-terms', '#app > .panel');

await open('/inventory', '.cp-risk-summary');
await captureViewport('guide-inventory-replenishment', '#app > .panel');

await open('/reviews', '.cp-report-hero');
await captureViewport('guide-operations-review', '.cp-report-hero');

await open('/studio?edit=8', '.cp-studio-workbench');
await captureViewport('guide-studio-review', '.cp-studio-editor');

await page.getByRole('button', { name: '评论审核' }).click();
await page.locator('.cp-studio-panel').waitFor({ state: 'visible', timeout: 20000 });
await captureViewport('guide-comment-review', '.cp-studio-panel');

await browser.close();
console.log(`Saved guide screenshots to ${outputDirectory}`);
