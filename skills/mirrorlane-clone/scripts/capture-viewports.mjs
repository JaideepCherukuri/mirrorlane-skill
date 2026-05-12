#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const [url, outDir] = process.argv.slice(2);

if (!url || !outDir) {
  console.error("Usage: node capture-viewports.mjs <url> <out-dir>");
  process.exit(2);
}

const viewports = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "tablet", width: 768, height: 900 },
  { label: "mobile", width: 390, height: 844 },
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(outDir, `${viewport.label}.png`),
      fullPage: false,
      animations: "disabled",
    });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ ok: true, url, outDir, viewports }, null, 2));
