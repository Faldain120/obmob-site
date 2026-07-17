// ============================================================================
// launch-flip — flip obmob.ai from pre-launch noindex to publicly indexable,
// correctly, in ONE shot.   (obmob-site launch readiness)
//
//   node scripts/launch-flip.mjs             Dry run — show exactly what changes. DEFAULT.
//   node scripts/launch-flip.mjs --check     Report current state; exit 1 if half-flipped.
//   node scripts/launch-flip.mjs --apply     Make the site indexable.
//   node scripts/launch-flip.mjs --revert    Put noindex back (fully reversible).
//
// WHY THIS EXISTS
// ---------------
// The noindex lives in TWO independent systems, and either one alone keeps the whole site invisible
// to search:
//   1. `X-Robots-Tag: noindex, nofollow` — an HTTP header in vercel.json (applies to every path).
//   2. `<meta name="robots" content="noindex,nofollow">` — in the <head> of the HTML pages.
// A hand-done flip is 12 edits across those two systems. Miss the header and every page is still
// deindexed by the header; miss a meta tag and that page stays invisible. Worst of all, a partial
// flip LOOKS done — the diff is green — while the site ranks for nothing. This script does all of it
// atomically, or reports precisely which surfaces are inconsistent.
//
// ⚠️ KEEP-NOINDEX INVARIANT. privacy-update.html and terms-update.html are transient legal-notice
// pages: no canonical, deliberately absent from sitemap.xml, never meant to be indexed. The flip
// MUST leave their noindex in place. A blanket find-and-replace would index them. This script
// asserts they stay noindex after --apply and aborts if they wouldn't.
//
// Nothing here deploys. After --apply, deploy the site the normal way (npx vercel --cwd C:/obmob/site
// --prod --yes) — and remember that command ships the WORKING TREE, so run this, review the diff,
// then deploy.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODE = process.argv.includes("--apply") ? "apply"
  : process.argv.includes("--revert") ? "revert"
  : process.argv.includes("--check") ? "check"
  : "dry";

// The 9 pages that become PUBLIC at launch.
const FLIP_PAGES = [
  "index.html", "about.html", "contact.html", "faq.html", "privacy.html", "terms.html",
  "guide/abog-oral-exam.html", "guide/build-defend-case-list.html", "guide/ob-gyn-mock-orals.html",
];
// The 2 pages that STAY noindex forever. The invariant this script protects.
const KEEP_NOINDEX = ["privacy-update.html", "terms-update.html"];

// Matches the robots meta line (tolerant of the two quoting styles in this repo: ` />` vs `/>`), and
// eats the whole line including its trailing newline so removal leaves no blank line.
const ROBOTS_META_RE = /^[ \t]*<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/?>[ \t]*\r?\n/im;
const CANON_META = '<meta name="robots" content="noindex,nofollow"/>';
// Re-insert (revert) right after the viewport meta, matching its indentation.
const VIEWPORT_RE = /^([ \t]*)<meta\s+name="viewport"[^>]*>[ \t]*\r?\n/im;

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const write = (rel, s) => fs.writeFileSync(path.join(ROOT, rel), s);
const hasMeta = (rel) => ROBOTS_META_RE.test(read(rel));

// --- vercel.json: the X-Robots-Tag header ----------------------------------
// Vercel's header shape is {"key":"X-Robots-Tag","value":"noindex, nofollow"} — key and value are
// SEPARATE fields, not a JSON key:value pair. Detect it structurally, not with a text regex that
// assumes `"X-Robots-Tag":"noindex"` (that false-negative would report the header already gone and
// silently ship a half-flip — the exact failure this tool prevents).
const VERCEL = "vercel.json";
const headerPresent = () =>
  (JSON.parse(read(VERCEL)).headers || []).some((rule) =>
    (rule.headers || []).some((h) => String(h.key).toLowerCase() === "x-robots-tag" && /noindex/i.test(h.value)));

// The noindex header block, in the repo's exact formatting. Used to re-add on --revert and to
// recognise the "headers exists only for noindex" case for a surgical removal.
const HEADERS_BLOCK =
  '  "headers": [\n' +
  '    {\n' +
  '      "source": "/(.*)",\n' +
  '      "headers": [\n' +
  '        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }\n' +
  "      ]\n" +
  "    }\n" +
  "  ]";

// Remove the noindex header with a SURGICAL string edit, not JSON parse+reserialize — reserializing
// expands the compact `redirects` one-liners and buries the real change in reformatting noise, which
// defeats the point of a reviewable one-shot flip. The whole `headers` block exists solely for
// noindex today, so when it holds nothing else we drop the block cleanly (comma + block), leaving
// `redirects` untouched. If a future non-noindex header is added, fall back to structural editing and
// warn that the diff will be noisier. Either way, JSON.parse-validate the result before returning.
function stripHeader(src) {
  const cfg = JSON.parse(src);
  const others = (cfg.headers || []).flatMap((r) => r.headers || []).filter((h) => !(String(h.key).toLowerCase() === "x-robots-tag" && /noindex/i.test(h.value)));
  let out;
  if (others.length === 0) {
    // `headers` is the last top-level key; greedy match runs to the final `]` before the closing `}`.
    out = src.replace(/,\s*"headers"\s*:\s*\[[\s\S]*\](\s*\n\}\s*)$/, "$1");
    if (out === src) throw new Error("stripHeader: could not locate the headers block to remove");
  } else {
    console.warn("launch-flip: vercel.json has non-noindex headers — using structural edit (noisier diff).");
    cfg.headers = cfg.headers
      .map((rule) => ({ ...rule, headers: (rule.headers || []).filter((h) => !(String(h.key).toLowerCase() === "x-robots-tag" && /noindex/i.test(h.value))) }))
      .filter((rule) => (rule.headers || []).length > 0);
    if (cfg.headers.length === 0) delete cfg.headers;
    out = JSON.stringify(cfg, null, 2) + "\n";
  }
  JSON.parse(out); // validate
  return out;
}
// Re-add the noindex header for --revert, restoring the repo's exact block right before the root `}`.
function addHeader(src) {
  const out = src.replace(/(\n\}\s*)$/, `,\n${HEADERS_BLOCK}$1`);
  if (out === src) throw new Error("addHeader: could not find the closing brace to insert before");
  JSON.parse(out); // validate
  return out;
}

// --- report helpers --------------------------------------------------------
const c = { g: (s) => `\x1b[32m${s}\x1b[0m`, r: (s) => `\x1b[31m${s}\x1b[0m`, y: (s) => `\x1b[33m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m` };

function report() {
  const header = headerPresent();
  const flip = FLIP_PAGES.map((p) => ({ p, noindex: hasMeta(p) }));
  const keep = KEEP_NOINDEX.map((p) => ({ p, noindex: hasMeta(p) }));
  console.log(`\nX-Robots-Tag header (vercel.json) : ${header ? c.y("noindex PRESENT") : c.g("removed — public")}`);
  console.log(`\nPublic-at-launch pages (${flip.length}):`);
  for (const { p, noindex } of flip) console.log(`  ${noindex ? c.y("noindex") : c.g("public ")}  ${p}`);
  console.log(`\nStay-noindex notice pages (${keep.length}) — MUST remain noindex:`);
  for (const { p, noindex } of keep) console.log(`  ${noindex ? c.g("noindex") : c.r("PUBLIC — INVARIANT BROKEN")}  ${p}`);
  return { header, flip, keep };
}

// --- modes -----------------------------------------------------------------
function preflight() {
  const missing = [...FLIP_PAGES, ...KEEP_NOINDEX, VERCEL].filter((p) => !fs.existsSync(path.join(ROOT, p)));
  if (missing.length) {
    console.error(c.r(`ABORT — expected file(s) not found (did the site structure change?):\n  ${missing.join("\n  ")}`));
    console.error("Update FLIP_PAGES / KEEP_NOINDEX in this script to match the current site before flipping.");
    process.exit(2);
  }
}

if (MODE === "check") {
  preflight();
  const { header, flip, keep } = report();
  const flippedCount = flip.filter((x) => !x.noindex).length;
  const allPublic = !header && flippedCount === flip.length;
  const allQuiet = header && flippedCount === 0;
  const invariantOk = keep.every((x) => x.noindex);
  console.log("");
  if (!invariantOk) { console.log(c.r("🔴 INVARIANT BROKEN — a notice page is public. Run --revert or fix by hand.")); process.exit(1); }
  if (allPublic) console.log(c.g("✓ Fully launched — every public page is indexable, notice pages stay noindex."));
  else if (allQuiet) console.log(c.dim("• Pre-launch — the whole site is noindex. Run --apply at go-live."));
  else { console.log(c.r(`🔴 HALF-FLIPPED — header ${header ? "present" : "removed"}, ${flippedCount}/${flip.length} pages public. The site looks live but ranks for nothing. Run --apply to finish (or --revert).`)); process.exit(1); }
  process.exit(0);
}

if (MODE === "dry" || MODE === "apply") {
  preflight();
  const changes = [];
  const nextVercel = headerPresent() ? stripHeader(read(VERCEL)) : null;
  if (nextVercel) changes.push({ rel: VERCEL, next: nextVercel, note: "remove X-Robots-Tag noindex header" });
  for (const p of FLIP_PAGES) {
    if (hasMeta(p)) changes.push({ rel: p, next: read(p).replace(ROBOTS_META_RE, ""), note: "strip <meta robots noindex>" });
  }

  // Prove the invariant BEFORE writing: the 2 notice pages must still be noindex in the post-state.
  const brokenKeep = KEEP_NOINDEX.filter((p) => !hasMeta(p));
  if (brokenKeep.length) {
    console.error(c.r(`ABORT — a stay-noindex page is ALREADY public, refusing to proceed:\n  ${brokenKeep.join("\n  ")}`));
    process.exit(2);
  }

  console.log(`\nLaunch flip — ${MODE === "apply" ? c.g("APPLY") : c.dim("DRY RUN")}`);
  if (!changes.length) { console.log(c.g("\nNothing to do — the site is already public. (Notice pages remain noindex.)")); process.exit(0); }
  for (const ch of changes) console.log(`  ${MODE === "apply" ? "✎" : "·"} ${ch.rel.padEnd(36)} ${c.dim(ch.note)}`);
  if (MODE === "apply") {
    for (const ch of changes) write(ch.rel, ch.next);
    // Post-write assertion — never trust, verify.
    const stillNoindex = KEEP_NOINDEX.every((p) => hasMeta(p));
    const nowPublic = !headerPresent() && FLIP_PAGES.every((p) => !hasMeta(p));
    if (!stillNoindex || !nowPublic) { console.error(c.r("\n🔴 POST-CHECK FAILED — flip is inconsistent. Inspect the diff.")); process.exit(1); }
    console.log(c.g(`\n✓ Applied. Site is public; ${KEEP_NOINDEX.length} notice pages remain noindex.`));
    console.log(c.dim("Next: review `git diff`, then deploy: npx vercel --cwd C:/obmob/site --prod --yes"));
  } else {
    console.log(c.dim(`\n${changes.length} file(s) would change. Re-run with --apply, then deploy.`));
  }
  process.exit(0);
}

if (MODE === "revert") {
  preflight();
  const changes = [];
  if (!headerPresent()) changes.push({ rel: VERCEL, next: addHeader(read(VERCEL)), note: "restore X-Robots-Tag noindex header" });
  for (const p of FLIP_PAGES) {
    if (!hasMeta(p)) {
      const src = read(p);
      if (!VIEWPORT_RE.test(src)) { console.error(c.r(`cannot revert ${p} — no viewport meta to anchor the re-insert`)); process.exit(2); }
      changes.push({ rel: p, next: src.replace(VIEWPORT_RE, (m, indent) => `${m}${indent}${CANON_META}\n`), note: "restore <meta robots noindex>" });
    }
  }
  console.log(`\nRevert to pre-launch noindex`);
  if (!changes.length) { console.log(c.dim("Nothing to do — the site is already fully noindex.")); process.exit(0); }
  for (const ch of changes) { write(ch.rel, ch.next); console.log(`  ✎ ${ch.rel.padEnd(36)} ${c.dim(ch.note)}`); }
  console.log(c.g(`\n✓ Reverted. Whole site is noindex again. Deploy to make it take effect.`));
  console.log(c.dim("Note: the re-inserted <meta robots> is normalized (position/quotes may differ from the original). For a byte-exact undo before deploy, use `git checkout -- <files>` instead."));
  process.exit(0);
}
