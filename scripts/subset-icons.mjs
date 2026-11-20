#!/usr/bin/env node
// Builds public/fonts/material-symbols-outlined-subset.woff2 from the icon names
// in scripts/icons.json, using the Google Fonts CSS2 API `icon_names` subsetting.
// This runs at dev time only: the generated woff2 is committed and self-hosted,
// so visitors never contact Google. The request carries a generic UA only.
//
//   node scripts/subset-icons.mjs          regenerate the font
//   node scripts/subset-icons.mjs --check  exit 1 if source uses icons missing from icons.json
//
// --check is a heuristic: it finds (1) text inside `material-symbols-outlined`
// elements (plain text, or quoted snake_case strings in {{ }} expressions) and
// (2) `icon: 'name'` properties. It cannot see icon names built from other
// variables or stored in unrelated keys; add those to icons.json by hand.
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = join(root, 'scripts/icons.json');
const out = join(root, 'public/fonts/material-symbols-outlined-subset.woff2');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const listed = () => JSON.parse(readFileSync(manifest, 'utf8'));

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(vue|ts)$/.test(name)) yield p;
  }
}

function usedIcons() {
  const found = new Set();
  const dirs = [
    'pages',
    'components',
    'layouts',
    'utils',
    'composables',
    'stores',
  ];
  const files = [
    join(root, 'app.vue'),
    ...dirs.flatMap((d) => [...walk(join(root, d))]),
  ];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/material-symbols-outlined[^>]*>([^<]*)</g)) {
      const text = m[1];
      for (const q of text.matchAll(/'([a-z][a-z0-9_]*)'/g)) found.add(q[1]);
      const plain = text.replace(/\{\{[\s\S]*?\}\}/g, '').trim();
      if (/^[a-z][a-z0-9_]*$/.test(plain)) found.add(plain);
    }
    for (const m of src.matchAll(/\bicon:\s*'([a-z][a-z0-9_]*)'/g))
      found.add(m[1]);
  }
  return [...found].sort();
}

if (process.argv.includes('--check')) {
  const have = new Set(listed());
  const missing = usedIcons().filter((n) => !have.has(n));
  if (missing.length) {
    console.error(
      `Icons used but missing from scripts/icons.json:\n  ${missing.join('\n  ')}`,
    );
    process.exit(1);
  }
  console.log('icons.json covers all detected icons');
} else {
  const names = [...new Set(listed())].sort().join(',');
  // FILL stays a 0..1 axis: main.css toggles it via the `.fill` class.
  const cssUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&icon_names=${names}&display=block`;
  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!cssRes.ok) throw new Error(`CSS request failed: ${cssRes.status}`);
  const fontUrl = (await cssRes.text()).match(
    /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/,
  )?.[1];
  if (!fontUrl) throw new Error('No fonts.gstatic.com url in CSS response');
  const fontRes = await fetch(fontUrl, { headers: { 'User-Agent': UA } });
  if (!fontRes.ok) throw new Error(`Font request failed: ${fontRes.status}`);
  mkdirSync(dirname(out), { recursive: true });
  const buf = Buffer.from(await fontRes.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`wrote ${out} (${buf.length} bytes)`);
}
