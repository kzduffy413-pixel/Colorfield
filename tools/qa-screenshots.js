#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8000';
const OUT_DIR = path.join(__dirname, '../.qa-screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1194 },
  mobile: { width: 390, height: 844 }
};

const pages = [
  'index.html',
  'residence-201.html', 'residence-202.html', 'residence-203.html', 'residence-204.html',
  'residence-301.html', 'residence-302.html', 'residence-303.html', 'residence-304.html'
];

(async () => {
  const browser = await chromium.launch();
  for (const [vpName, vp] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage();
    for (const p of pages) {
      await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
        await page.goto(`${BASE}/${p}`, { waitUntil: 'load', timeout: 30000 });
      });
      // check horizontal scroll
      const scrollInfo = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      if (scrollInfo.scrollWidth > scrollInfo.clientWidth + 2) {
        console.log(`⚠️  HORIZONTAL SCROLL on ${p} @ ${vpName}: scrollWidth=${scrollInfo.scrollWidth} clientWidth=${scrollInfo.clientWidth}`);
      }
      const filename = `${p.replace('.html','')}-${vpName}.png`;
      await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: true });
      console.log(`✓ ${filename}`);
    }
    await context.close();
  }
  await browser.close();
})();
