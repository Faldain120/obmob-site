# PRODUCT.md — ObMob marketing site

## What this is

The public marketing landing page for **ObMob** (obmob.ai) — an AI voice-examiner for the **ABOG OB/GYN oral certifying exam**. The site's job is to convert OB/GYN residents, fellows, and recent graduates into early-access signups. It is a **marketing / brand surface** (design IS the product here), single-page, currently `noindex` pre-launch.

Register: **brand** (landing page). Not app UI.

## Product in one line

Rehearse the ABOG oral out loud on your own de-identified case list with an AI examiner that drills you one question at a time — and walk into the real room already knowing how it feels.

## Audience

Board-eligible OB/GYN physicians preparing for the ABOG oral (Certifying) exam. Time-pressured, clinically expert, skeptical of hype. They respond to precision and realism, not marketing gloss.

## Brand personality

- **Specific, earned, unmistakable** — physician-to-physician, not consumer-app peppy.
- **Calm authority** — the confidence of someone who has been in the room.
- **Clinical warmth** — serious about the exam, humane about the anxiety.

Voice words: confident · exact · rehearsed-calm · independent.

## Positioning

- The only prep that drills the candidate's **own real cases** (the half of the oral no other tool covers) plus structured ABOG-style cases.
- **Independent** — aligned to ABOG's published blueprint, but not affiliated with, sponsored by, or endorsed by ABOG or ACOG. Always state this.

## Anti-references (what to avoid)

- Generic SaaS-landing tropes: gradient-text headlines, hero-metric template, identical icon-card grids, tiny tracked eyebrow on every section by reflex.
- Consumer-app hype: exclamation marks, "revolutionary," countdown-timer urgency.
- Cold/sterile medical-device aesthetic — this is prep for anxious humans, keep the warmth.
- These are general guards; they do **not** mean the current site is a failure. Default to preserving the existing navy+teal identity (live mode = variation within identity, not a rebrand).

## Key pages / sections (single file, index.html)

Hero → difference/compare → product pillars (`#product`) → how-it-works 3 steps (`#how`) → FAQ (`#faq`) → pricing (`#pricing`) → CTA band → footer.

## Constraints

- Fonts: Newsreader + Inter (Google Fonts). No third family.
- Palette: navy + teal + a whisper of gold. No new hues.
- Deploys via `vercel --prod` (working tree). Pre-launch `noindex`.
