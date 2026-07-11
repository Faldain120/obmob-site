# DESIGN.md — ObMob marketing site (obmob.ai)

Authoritative visual system for the single-page marketing site (`index.html`). Extracted from the site's own `:root` tokens (OBMOB DESIGN.md v1.1) and the `obmob-brand` system. **DESIGN.md wins on visual decisions.**

## Identity in one sentence

A premium-clinical landing page on a light canvas (`#F6F8FB`) with deep-navy full-bleed bands (`#13314C`→`#0E2740`) and a single teal accent (`#2FA89B`), setting a Newsreader serif display against Inter body, arranged as full-bleed color bands with content capped at 1080px — confident, exact, and unmistakably medical without being cold.

## Palette (exact tokens — use these, never new hues)

Grounds & ink
- `--canvas #F6F8FB` — page background (light sections)
- `--surface #FFFFFF` — cards, panels
- `--navy #13314C` / `--navy-deep #0E2740` — dark bands (hero, cta-band, footer); primary brand color
- `--navy-mid #2A547C`, `--navy-soft #EAF0F6`, `--navy-line #22456A`
- `--ink #14283A` (headings via `--navy`), `--ink-2 #41566B` (body), `--muted #626F7B` (captions/eyebrows), `--line #E4E9EF` (hairlines/dividers)

Accent (teal is the ONLY accent)
- `--teal #2FA89B` — accent
- `--teal-deep #1F7A70` — accent-as-text / `em` emphasis
- `--teal-cta #1E8377` — button fill (AA-safe under white text)
- `--teal-bright #3FB9AD` — accent on navy (eyebrows, `em` on dark)
- `--teal-soft #E4F3F1` — faint tint fills

Restrained flourishes (never a second accent)
- `--gold #C29A4A` / `--gold-soft #F6EFDD` — seal/monogram/"save ~5%" pill only
- Content-area hues (used only in product/case imagery): `--ob #D26079`, `--gyn #8A6FD0`, `--office #2FA89B`

## Type

- Display / headings: **Newsreader** (serif), weight 500, `letter-spacing:-.5px`, `line-height:1.12`, color `--navy`. `em` inside headings → italic `--teal-deep` (`--teal-bright` on navy).
- Body / UI: **Inter** (sans), 400–700. Body color `--ink-2`, `line-height:1.6`.
- Eyebrow: 11px, `letter-spacing:1.4px`, uppercase, weight 600, `--muted` (`.on-navy` → `--teal-bright`).
- Hero H1 ~58px (40px ≤880px); section H2 large-serif.
- Pair on the contrast axis (serif display + sans body). Never introduce a third family.

## Layout topology (the core law)

- **Full-bleed colored bands + content capped at `--col:1080px`, centered** (`.wrap{max-width:1080px;margin:0 auto;padding:0 28px}`). The color fills the monitor; the text stays a readable width. A capped column on a bare background (grey side margins) is the anti-pattern.
- Section rhythm: `section{padding:72px 0}`. Stacked light sections that share the canvas are separated by a **hairline divider** `border-top:1px solid var(--line)` (as `#product`, `#faq`, `#pricing` do). Dark↔light boundaries need no divider — the color change is the divider.
- Responsive grids: `repeat(auto-fit,minmax(224px,1fr))` for card/stat rows; collapse to one column on mobile.

## Surface treatment

- Corners: cards/panels `border-radius:12–16px`; pills/buttons `border-radius:9px`; full-round `999px` for tags/toggles.
- Borders: 1px `--line`. Shadows: soft and restrained (`0 10px 26px rgba(47,168,155,.28)` glow only on the primary button). Do not pair a 1px border with a heavy shadow on the same element.
- Density: comfortable, airy — this is a premium page, not a dashboard.

## Motion

- Transitions `.18s ease`. Primary button hover: `translateY(-1px)` + background `--teal-cta`→`--teal-deep`; trailing arrow `.arr` nudges `translateX(3px)`.
- Scroll reveals via `.reveal` (already visible by default; enhancement only).
- Ease-out only; no bounce/elastic. Honor `prefers-reduced-motion`.

## Components

- `.btn-primary` teal-cta fill + white text + glow; `.btn-ghost` transparent + `--line` border (`.on-navy` variant for dark bands).
- Cards: white surface, 1px `--line`, radius 14–16.
- `.eyebrow` micro-label above section heads. `.sec-head` (max 680px) = eyebrow + serif H2 + optional lede.
- Pricing tiers, FAQ `<details>` accordions, stat row, compare table, step cards (`.step` numbered 1-2-3), CTA band, footer.

## Voice (read off the copy)

Confident, precise, physician-to-physician. Short declaratives. "The room should be the second time it happens." / "Walk in already knowing how it feels." No hype, no exclamation. Independent — "not affiliated with, sponsored by, or endorsed by ABOG or ACOG."

## Canonical source

Live tokens are the `:root` block of `index.html`. If they change, re-sync this file.
