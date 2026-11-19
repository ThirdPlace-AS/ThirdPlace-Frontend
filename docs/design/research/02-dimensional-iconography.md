# 02 — Dimensional Iconography: Airbnb Analysis & ThirdPlace Recommendations

Reference date 2026-10-24. Tags and sources: see [README](README.md).

## 1. What is actually known about Airbnb's icons

| Claim                                                                              | Tag        | Source   |
| ---------------------------------------------------------------------------------- | ---------- | -------- |
| The 2025 app has a "dimensional and beautifully animated interface"                | `OBSERVED` | S1       |
| The new icons are 3D-rendered with transparent backgrounds                         | `REPORTED` | S11      |
| They ship in an Airbnb format called "Lava", described as a micro video with alpha | `REPORTED` | S11, S13 |
| Lava supports 32-bit colour with transparency (soft shadows, glows)                | `REPORTED` | S11      |
| Lava's binary structure is undisclosed; encoding details are inference             | `REPORTED` | S11, S13 |
| Lava is not publicly available                                                     | `REPORTED` | S11      |
| Airbnb previously open-sourced Lottie (After Effects → JSON vector animation)      | `REPORTED` | S18      |

No Airbnb engineering post on Lava was found. Anything more specific is inference.

## 2. Visual characteristics (analysis)

These are `HYPOTHESIS` — derived from widely circulated public screenshots and the third-party analyses (S11, S12), not from Airbnb.

| Dimension              | Characteristic                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Construction           | Single recognisable everyday object per icon (house, balloon, bell…). Simplified silhouettes, few parts, chunky volumes. |
| Silhouette             | Readable as a flat shape at 24–32 pt; detail is secondary.                                                               |
| Materials              | Soft matte/satin surfaces, clay- or toy-like; light speculars only on curved edges. No heavy texture.                    |
| Colour                 | Muted, warm natural colours per object; brand colour is not forced into every icon.                                      |
| Lighting               | One soft key light from upper-left/front, broad fill; gentle ambient occlusion where parts meet.                         |
| Shadows                | Small, soft contact shadow under the object; no long cast shadows.                                                       |
| Perspective            | Slight three-quarter view from above (roughly 20–35° elevation); consistent camera across the family.                    |
| Proportions            | Objects fill ~80% of the square; slightly oversized "hero" parts (roof, flame) for character.                            |
| Background             | Transparent; works on white and photo backgrounds.                                                                       |
| States                 | Idle still frame; on selection the object animates once (bounce, open, wobble) then settles on a final frame.            |
| Timing                 | Short one-shot plays (well under ~1.5 s) with ease-out settle; not looping in idle.                                      |
| Object-specific motion | Motion matches the object's physics: a balloon floats, a bell rings, a door opens.                                       |
| Performance            | Pre-rendered frames (video-like) rather than real-time 3D — cheap at runtime, heavy to author.                           |

## 3. Principles ThirdPlace can use (without Airbnb artwork or Lava)

1. **Family camera and light rig.** Every dimensional icon is rendered from the same camera angle with the same lights, so the set reads as one family.
2. **Silhouette first.** Each icon must pass a flat black silhouette test at 24 pt before any material work.
3. **One brand touch.** _PROPOSAL:_ each ThirdPlace object carries one small Ember element (a dot, a flame, a pin head) — a signature Airbnb doesn't use, linked to the existing ThirdPlace mark (Ember square + white dot).
4. **Still by default, motion on meaning.** Idle = still image. Animate only on select / save / achieve.
5. **Motion without a proprietary format.** Achievable with: a still image + Reanimated transforms (scale/tilt/bounce, very cheap); sprite-sheet or animated WebP for short frame sequences; Rive for interactive 2.5D vector; Lottie for flat vector motion. See [10](10-assets-and-performance.md).
6. **Two tiers, not one.** Dimensional objects are expressive and heavy; they don't belong in dense UI. Utility controls stay as line icons.

## 4. ThirdPlace icon system — proposed two-tier structure

| Tier                         | Style                                                                                           | Used for                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **T1 — Line (utility)**      | 24-pt grid, 1.75-pt stroke, round caps/joins, 2-pt corner radius; outline idle, filled selected | Navigation, map utility, actions, form controls, status                  |
| **T2 — Dimensional objects** | Pre-rendered 3D objects, family rig, transparent background, one Ember touch                    | Categories, interests, vibes, achievements, business types, empty states |

## 5. Recommendations per family

All `PROPOSAL`. None replaces an approved icon (only the 5-tab **structure** is approved; see [06](06-icon-inventory.md)).

| Family          | Tier              | Recommendation                                                                                                                                                                                                                                                                   |
| --------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Navigation**  | T1                | Keep the 5 approved tabs and their meaning. Redraw glyphs in the T1 style with outline → filled on select and a 1-shot "settle" (scale 0.9 → 1.0, spring) on tab change. Optional later: dimensional tab icons — only if they pass legibility at 24 pt and the founder approves. |
| **Map Utility** | T1                | Locate, layers, filters, search, notifications, recentre, zoom. Must sit on glass/blurred or white floating buttons; 44 × 44 touch target; never colour-only state.                                                                                                              |
| **Category**    | T2 (+T1 fallback) | One object per experience type (25 today in `src/fixtures/index.ts`). Dimensional object at 48–64 pt in chips/cards; a matching T1 glyph for dense contexts (map pins, list rows). Categories are mock taxonomy — final list waits for the contract.                             |
| **Interest**    | T2                | Same rig as Category, smaller set, used in onboarding and profile. Mock until contract.                                                                                                                                                                                          |
| **Vibe**        | T2-lite           | Abstract "mood objects" (e.g. candle = cosy, speaker = lively) rendered in the same rig but with softer, more ambient lighting. Avoid faces/emoji to stay distinct.                                                                                                              |
| **Achievement** | T2 hero           | Larger (96–160 pt) objects on a medallion/plinth with a celebratory one-shot animation (Rive or frame sequence). Locked state = desaturated + lock line icon. Achievement rules are contract-blocked: design only, no earning logic.                                             |
| **Business**    | T2 + T1           | Business-type objects (café cup, workshop tools, bar glass) for business profiles; T1 badges for verified/claimed — badges must be `DemoBadge`-honest until verification exists.                                                                                                 |

## 6. States and motion spec (proposal)

| State          | T1 line                            | T2 dimensional                                                                      |
| -------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Idle           | Outline, `ink` / `muted`           | Still render                                                                        |
| Pressed        | Scale 0.94, 90 ms                  | Scale 0.96, 90 ms                                                                   |
| Selected       | Filled glyph, `ink`; settle spring | One-shot object motion ≤ 900 ms (or scale/tilt bounce on a still), then final frame |
| Disabled       | 40% opacity                        | Desaturated 100%, 50% opacity                                                       |
| Reduced motion | No scale                           | Swap to final frame instantly; no bounce                                            |

## 7. Must not copy

Airbnb's icon artwork, its specific objects in its specific poses, its colours, or the Lava format. ThirdPlace's set must be commissioned or created from scratch with the ThirdPlace rig and Ember signature.
