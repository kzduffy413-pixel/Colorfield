#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8000';
const OUT_DIR = path.join(__dirname, '../.qa-screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1194 },
  mobile: { width: 390, height: 844 }
};

// selector list per page: [name, selector]
const homeSections = [
  ['header', 'header'],
  ['hero', '.hero'],
  ['residences', '.residences'],
  ['design', '.arch'],
  ['details-amenities', 'body > section:nth-of-type(4)'], // details + arch/dev/recog
  ['amenities', 'body > section:nth-of-type(5)'],
  ['history', 'body > section:nth-of-type(6)'],
  ['neighborhood', '.neighborhood'],
  ['sales', '#sales'],
  ['contact', '.contact'],
  ['footer', 'footer']
];

const residenceSections = [
  ['hero', 'body > section:nth-of-type(1)'],
  ['facts', 'body > section:nth-of-type(2)'],
  ['gallery', 'body > section:nth-of-type(3)'],
  ['floorplan', 'body > section:nth-of-type(4)'],
  ['discover', 'body > section:nth-of-type(5)'],
  ['amenities', 'body > section:nth-of-type(6)'],
  ['contact', '#contact'],
  ['explore', 'body > section:nth-of-type(8)'],
  ['footer', 'footer']
];

const residencePages = ['residence-201.html','residence-202.html','residence-203.html','residence-204.html','residence-301.html','residence-302.html','residence-303.html','residence-304.html'];

(async () => {
  const browser = await chromium.launch();
  const target = process.argv[2] || 'all'; // 'home', 'res', or 'all'
  const vpFilter = process.argv[3]; // optional viewport filter

  for (const [vpName, vp] of Object.entries(viewports)) {
    if (vpFilter && vpFilter !== vpName) continue;
    const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 0.5 });
    const page = await context.newPage();

    if (target === 'home' || target === 'all') {
      await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 30000 });
      for (const [name, sel] of homeSections) {
        try {
          const el = page.locator(sel).first();
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1200);
          await el.screenshot({ path: path.join(OUT_DIR, `home-${name}-${vpName}.png`) });
          console.log(`✓ home-${name}-${vpName}.png`);
        } catch (e) {
          console.log(`✗ home-${name}-${vpName}: ${e.message}`);
        }
      }
    }

    if (target === 'res' || target === 'all') {
      for (const p of residencePages) {
        await page.goto(`${BASE}/${p}`, { waitUntil: 'load', timeout: 30000 });
        const base = p.replace('.html','');
        for (const [name, sel] of residenceSections) {
          try {
            const el = page.locator(sel).first();
            await el.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1200);
            await el.screenshot({ path: path.join(OUT_DIR, `${base}-${name}-${vpName}.png`) });
          } catch (e) {
            console.log(`✗ ${base}-${name}-${vpName}: ${e.message}`);
          }
        }
        console.log(`✓ ${base} sections captured (${vpName})`);
      }
    }

    await context.close();
  }
  await browser.close();
})();
