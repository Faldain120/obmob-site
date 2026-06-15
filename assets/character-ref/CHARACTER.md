# Character Bible — "The Walking Woman" (obmob-site protagonist)

Reference identity for generating consistent videos of the woman who walks into the
building in the obmob-site hero. Face was designed fresh; silhouette matches the
original walk-in shot (`assets/hero-walk-loop.mp4`).

## Asset index (all in this folder)
| File | Purpose |
|---|---|
| `master-front.png` | Full-body front master — the anchor every other asset is built from. |
| `turnaround.png` | Multi-angle sheet: front / 3-4 / profile / back. |
| `expressions-locked.png` | Expression sheet: neutral / warm smile / serious / surprised. |
| `face-closeup.png` | Front face close-up, even beauty lighting — anchor for tight shots. |
| `hands-detail.png` | Hands reference: one relaxed at side, one pushing a door. No rings/watch. |
| `building-plate.png` | Environment plate — modern glass lobby, navy + ivory, no people. |
| `panels/turn-1-front.png` … `turn-4-back.png` | Individual turnaround crops (front / 3-4 / profile / back). |
| `panels/expr-1-neutral.png` … `expr-4-surprised.png` | Individual expression crops (from `expressions-locked.png`). |

All panels are cropped from the current sheets; nothing references a superseded version.

## Locked physical description
- Woman, mid-30s, slim athletic build, ~5'7".
- Warm light-olive skin, dark brown eyes, oval face with defined cheekbones.
- Natural well-groomed eyebrows, minimal natural makeup.
- Dark near-black hair pulled into a smooth, sleek low bun with a clean center part.
- Small silver stud earrings only. Poised, intelligent, approachable.

## Locked wardrobe (hero look)
- Navy-blue single-breasted tailored blazer.
- Ivory V-neck shell top underneath.
- Matching navy slim-fit trousers.
- Black pointed-toe heels.

## Locked lighting & background (for studio/reference shots)
- Soft, even, warm-neutral studio light.
- Plain light-grey seamless background.
- Photoreal, sharp focus, neutral color grade.

## Copy-paste character block for Kling / Veo prompts
> A woman in her mid-30s with a slim build, warm light-olive skin, dark brown eyes,
> and dark near-black hair pulled into a smooth sleek low bun with a center part.
> She wears a navy-blue single-breasted tailored blazer over an ivory V-neck shell,
> matching navy slim-fit trousers, and black pointed-toe heels, with small silver
> stud earrings. Poised, intelligent, and professional.

## Consistency tips
- In Kling 3.0, add the relevant reference image as the **start frame**, then paste
  the character block above into the prompt.
  - Face-forward / reveal shot → `panels/turn-1-front.png` or `face-closeup.png`.
  - Three-quarter shot → `panels/turn-2-threequarter.png`.
  - Walk-away / walk-in shot → `panels/turn-4-back.png`.
  - Door / hand-on-glass shot → `hands-detail.png`.
  - Need an empty set to composite into → `building-plate.png`.
- Keep lighting and wardrobe wording identical across prompts to avoid drift.
- Do NOT: change hair color/style, show loose or down hair, add glasses, change eye
  color, change the outfit, or add other people.

## How these were generated
- `master-front.png` — GPT Image 2 text-to-image (media-gen `image_generate`).
- All identity-locked assets — GPT Image 2 `image_edit` anchored to `master-front.png`.
- `building-plate.png` — `image_generate` (no identity needed, no people).
- Panels — cropped from the sheets with ffmpeg (even 4-way vertical split).
