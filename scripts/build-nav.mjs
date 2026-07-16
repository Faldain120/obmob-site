/**
 * Stamp the shared nav into every page.
 *
 * WHY THIS EXISTS: the site is static HTML with no build step, so the nav used to
 * be copy-pasted into all 11 pages. It drifted — index.html linked `#difference`
 * while every sub-page linked `/#difference`, and each carried its own nav CSS.
 * Edit partials/nav.html, run this, and every page agrees.
 *
 *   node scripts/build-nav.mjs           # write
 *   node scripts/build-nav.mjs --check   # exit 1 if any page is out of date (CI/pre-deploy)
 *
 * Replaced later by a real SSG (roadmap p2-24) — this is the bridge, not the destination.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

const PAGES = [
  'index.html', 'about.html', 'contact.html', 'faq.html',
  'privacy.html', 'terms.html', 'privacy-update.html', 'terms-update.html',
  'guide/abog-oral-exam.html', 'guide/build-defend-case-list.html', 'guide/ob-gyn-mock-orals.html',
  // Stamped too, so the preview harness always shows the nav that actually ships.
  // design/ is in .vercelignore, so this never reaches production.
  'design/nav-frame.html',
];

const START = '<!--NAV:START-->';
const END = '<!--NAV:END-->';
const WARNING = '<!-- Generated from partials/nav.html by scripts/build-nav.mjs. Do not edit here. -->';
const CSS_LINK = '<link rel="stylesheet" href="/assets/nav.css" />';
const JS_TAG = '<script src="/assets/nav.js" defer></script>';

const partial = readFileSync(join(ROOT, 'partials/nav.html'), 'utf8').trim();
const block = `${START}\n${WARNING}\n${partial}\n${END}`;

let changed = [], stale = [], skipped = [];

for (const page of PAGES) {
  const path = join(ROOT, page);
  const before = readFileSync(path, 'utf8');
  let after = before;

  // 1. Nav markup — replace the marked block, or adopt the legacy <header class="nav"> on first run.
  if (after.includes(START) && after.includes(END)) {
    after = after.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => block);
  } else {
    const legacy = /<header class="nav">[\s\S]*?<\/header>/;
    if (!legacy.test(after)) { skipped.push(`${page} (no nav found)`); continue; }
    after = after.replace(legacy, () => block);
  }

  // 2. nav.css goes last in <head> — after index.html's inline <style>, which would
  //    otherwise win the cascade at equal specificity and silently re-hide the mobile
  //    nav. Not "after the last </style>": index has a second <style> in the BODY, and
  //    targeting that put a stylesheet link outside the head.
  if (!after.includes('href="/assets/nav.css"')) {
    after = after.replace('</head>', `${CSS_LINK}\n</head>`);
  }

  // 3. nav.js
  if (!after.includes('/assets/nav.js')) {
    after = after.replace('</head>', `${JS_TAG}\n</head>`);
  }

  if (after === before) continue;
  stale.push(page);
  if (!CHECK) { writeFileSync(path, after); changed.push(page); }
}

if (CHECK) {
  if (stale.length) {
    console.error(`✗ ${stale.length} page(s) out of date with partials/nav.html:`);
    stale.forEach(p => console.error(`    ${p}`));
    console.error('  Run: node scripts/build-nav.mjs');
    process.exit(1);
  }
  console.log(`✓ all ${PAGES.length} pages match partials/nav.html`);
} else {
  console.log(changed.length ? `✓ stamped nav into ${changed.length} page(s):` : '✓ all pages already current');
  changed.forEach(p => console.log(`    ${p}`));
}
if (skipped.length) { console.warn('⚠ skipped:'); skipped.forEach(p => console.warn(`    ${p}`)); }
