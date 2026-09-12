import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = join(process.cwd(), 'dist', 'assets');

try {
  statSync(DIST);
} catch {
  console.log('ℹ  dist/ not found — skipping size check. Run `npm run build` first.');
  process.exit(0);
}

const JS_BUDGET = 250 * 1024; // 250 KB gzip
const CSS_BUDGET = 60 * 1024; // 60 KB gzip
const TOTAL_BUDGET = 600 * 1024; // 600 KB gzip

const files = readdirSync(DIST).filter((f) => /\.(js|css)$/.test(f));

if (files.length === 0) {
  console.log('ℹ  No .js or .css files found in dist/assets/.');
  process.exit(0);
}

let totalJs = 0;
let totalCss = 0;
const rows = [];

for (const file of files) {
  const buf = readFileSync(join(DIST, file));
  const gz = gzipSync(buf).length;
  const ext = extname(file);
  if (ext === '.js') totalJs += gz;
  else totalCss += gz;
  rows.push({ file, raw: buf.length, gzip: gz, ext });
}

rows.sort((a, b) => b.gzip - a.gzip);

// ── table ──
const pad = (s, n) => String(s).padStart(n);
const hr = '─'.repeat(50);

console.log(`\n📦  Bundle size report (gzip)\n${hr}`);
console.log(
  `  ${'File'.padEnd(28)} ${'Raw'.padStart(8)} ${'Gzip'.padStart(8)}`
);
console.log(hr);

for (const r of rows) {
  console.log(
    `  ${r.file.padEnd(28)} ${pad((r.raw / 1024).toFixed(1) + ' KB', 8)} ${pad((r.gzip / 1024).toFixed(1) + ' KB', 8)}`
  );
}

console.log(hr);
console.log(
  `  ${'Total JS'.padEnd(28)} ${''.padStart(8)} ${pad((totalJs / 1024).toFixed(1) + ' KB', 8)}`
);
console.log(
  `  ${'Total CSS'.padEnd(28)} ${''.padStart(8)} ${pad((totalCss / 1024).toFixed(1) + ' KB', 8)}`
);
console.log(
  `  ${'Total'.padEnd(28)} ${''.padStart(8)} ${pad(((totalJs + totalCss) / 1024).toFixed(1) + ' KB', 8)}`
);
console.log(hr);

// ── budget check ──
let fail = false;

function check(label, actual, budget) {
  const ok = actual <= budget;
  const status = ok ? '✅' : '❌';
  const msg = `${status} ${label}: ${(actual / 1024).toFixed(1)} KB gzip (budget ${(budget / 1024).toFixed(0)} KB)`;
  console.log(msg);
  if (!ok) fail = true;
}

check('JS', totalJs, JS_BUDGET);
check('CSS', totalCss, CSS_BUDGET);
check('Total', totalJs + totalCss, TOTAL_BUDGET);
console.log();

if (fail) {
  console.error('⛔  Bundle size over budget.');
  process.exit(1);
} else {
  console.log('✅  All within budget.');
  process.exit(0);
}
