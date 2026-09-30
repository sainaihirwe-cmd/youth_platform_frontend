/**
 * Verifies that every static translation key used in src/ exists in each locale, and that
 * locales have the same key structure. Run: npm run check:i18n
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const locales = ['en', 'rw'];
const PLURAL = ['_one', '_other', '_zero', '_two', '_few', '_many'];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx?|tsx?)$/.test(name) && !/\.test\./.test(name)) out.push(p);
  }
  return out;
}

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

const used = new Set();
for (const file of walk(src)) {
  const code = readFileSync(file, 'utf8');
  for (const m of code.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) used.add(m[1]);
}

const dicts = Object.fromEntries(locales.map((l) => [l, flatten(JSON.parse(readFileSync(join(src, 'i18n', 'locales', `${l}.json`), 'utf8')))]));

const has = (dict, key) => key in dict || PLURAL.some((s) => `${key}${s}` in dict) || Object.keys(dict).some((k) => k.startsWith(`${key}.`));

let problems = 0;
for (const l of locales) {
  const missing = [...used].filter((k) => !has(dicts[l], k));
  if (missing.length) {
    problems += missing.length;
    console.log(`\n[${l}] missing ${missing.length} key(s):\n  ${missing.sort().join('\n  ')}`);
  }
}
const base = Object.keys(dicts.en);
for (const l of locales.filter((x) => x !== 'en')) {
  const missing = base.filter((k) => !(k in dicts[l]) && !(k.replace(/_(one|other)$/, '') + '_other' in dicts[l]));
  const extra = Object.keys(dicts[l]).filter((k) => !(k in dicts.en) && !(k.replace(/_(one|other)$/, '') + '_other' in dicts.en));
  if (missing.length) {
    problems += missing.length;
    console.log(`\n[${l}] keys present in en but missing:\n  ${missing.join('\n  ')}`);
  }
  if (extra.length) console.log(`\n[${l}] extra keys not in en (warning):\n  ${extra.join('\n  ')}`);
}

console.log(problems ? `\n${problems} translation problem(s) found.` : `All ${used.size} used keys are translated in: ${locales.join(', ')}`);
process.exit(problems ? 1 : 0);
