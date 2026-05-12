#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const [actualPath, expectedPath, diffPath] = process.argv.slice(2);

if (!actualPath || !expectedPath || !diffPath) {
  console.error("Usage: node pixel-diff.mjs <actual.png> <expected.png> <diff.png>");
  process.exit(2);
}

const actual = PNG.sync.read(fs.readFileSync(actualPath));
const expected = PNG.sync.read(fs.readFileSync(expectedPath));

if (actual.width !== expected.width || actual.height !== expected.height) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "image-size-mismatch",
        actual: { width: actual.width, height: actual.height },
        expected: { width: expected.width, height: expected.height },
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const diff = new PNG({ width: actual.width, height: actual.height });
const mismatchedPixels = pixelmatch(
  actual.data,
  expected.data,
  diff.data,
  actual.width,
  actual.height,
  { threshold: 0.1 },
);

fs.mkdirSync(path.dirname(path.resolve(diffPath)), { recursive: true });
fs.writeFileSync(diffPath, PNG.sync.write(diff));

const totalPixels = actual.width * actual.height;
const mismatchRatio = mismatchedPixels / totalPixels;
const result = {
  ok: mismatchRatio < 0.01,
  mismatchedPixels,
  totalPixels,
  mismatchRatio,
  mismatchPercent: Number((mismatchRatio * 100).toFixed(4)),
  actualPath,
  expectedPath,
  diffPath,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
