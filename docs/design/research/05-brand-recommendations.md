# 05 — ThirdPlace Brand Recommendations (Original Identity)

Reference date 2026-10-24. All items are `PROPOSAL` unless noted. Nothing in the current brand is approved; the current Ember mark is treated as the **working baseline** to evolve, not replace, so the founder keeps continuity.

## 1. Brand idea

**"Det tredje stedet"** — the place that is neither home nor work, where people show up for each other. The identity should feel **warm, local, physical and present-tense**: real places, real people, now.

How this differs from the references:

- Airbnb = travel, belonging away from home, dimensional toy-like polish.
- Tinder (2026) = editorial serif voice, flirtatious, swipe as reveal.
- **ThirdPlace = the local doorway.** Nordic clarity, an Ember "spark" of activity, map-native.

## 2. Mark, app icon, wordmark

| Item        | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Symbol      | Evolve the current **Ember rounded square + white dot** into "the lit window / the spark on the map": the dot sits slightly above centre (a pin head seen from above, or a lamp in a window). Keep the rounded square — it already doubles as an app-icon shape. Three explorations for the founder: **A. Spark** (current, refined proportions), **B. Doorway** (square with an arch cut-out and the dot as a light inside), **C. Third dot** (three dots, the third in Ember, for "the third place"). Recommend **A** for continuity. |
| App icon    | Ember field, white symbol, no wordmark. iOS 26 provides clear/tinted icon modes — supply a monochrome symbol layer. Android adaptive icon: symbol within 66 dp safe zone; themed (monochrome) layer.                                                                                                                                                                                                                                                                                                                                    |
| Wordmark    | "ThirdPlace" in the chosen UI family at semibold with tightened tracking (−1%); custom-drawn "P" or "a" only after the family is approved. Never all-caps (Tinder's 2026 wordmark is all-caps — stay distinct).                                                                                                                                                                                                                                                                                                                         |
| Clear space | Minimum = height of the dot on all sides. Minimum size: symbol 16 pt, wordmark 72 pt wide.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Don't       | Recolour the symbol outside Ember / white / ink; add gradients or 3D to the master mark; place on busy photos without a scrim.                                                                                                                                                                                                                                                                                                                                                                                                          |

## 3. Colour roles

Ember stays the single brand colour (current rule: CTA, favourite, badges, dots, progress, logo). Ink drives selection/navigation/confirm.

| Role                                | Light                       | Dark (proposed)                 | Notes                                                                                                  |
| ----------------------------------- | --------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ember (fill: CTA, badge)            | `#D80000`                   | `#D80000`                       | White on `#D80000` = 5.36:1 in both schemes — keep the fill constant                                   |
| emberText (links, Ember text/icons) | `#D80000` (5.36:1 on white) | `#FF4D4D` (5.10:1 on `#1E1E1E`) | Separate token: white on `#FF4D4D` is only 3.27:1, so `#FF4D4D` must never be a fill behind white text |
| ink (primary text)                  | `#202020`                   | `#F2F2F2`                       |                                                                                                        |
| muted text                          | `#6B6B6B`                   | `#A3A3A3`                       |                                                                                                        |
| background                          | `#F8F8F8`                   | `#121212`                       |                                                                                                        |
| surface                             | `#FFFFFF`                   | `#1E1E1E`                       |                                                                                                        |
| surfaceRaised                       | `#FFFFFF` + elevation       | `#282828`                       | Dark mode shows elevation by lighter surface, not shadow                                               |
| line                                | `#E0E0E0`                   | `#333333`                       |                                                                                                        |
| success                             | `#387850`                   | `#5FB37E`                       |                                                                                                        |
| danger                              | `#B5342B`                   | `#FF6B5E`                       | Low-confidence source value — confirm                                                                  |
| warning                             | `#B05008`                   | `#F0A040`                       | Low-confidence source value — confirm                                                                  |
| **categorical 1–8**                 | separate set                | separate set                    | Map/category hues **must not reuse status colours** (today `warning` = Kafé pin)                       |

Contrast ratios were computed with the WCAG 2.x relative-luminance formula (all text pairs ≥ 4.5:1; table in [07 §1](07-tokens-and-components.md)). They are still proposals and need visual review on device.

## 4. Typography (licensed families only)

| Option                              | Licence     | Character                                | Fit                                                      |
| ----------------------------------- | ----------- | ---------------------------------------- | -------------------------------------------------------- |
| **Plus Jakarta Sans** (recommended) | SIL OFL 1.1 | Warm geometric, open apertures, friendly | Distinct from Airbnb Cereal and Tinder's serif; good æøå |
| Figtree                             | SIL OFL 1.1 | Clean geometric, slightly rounded        | Very legible at small sizes                              |
| Inter                               | SIL OFL 1.1 | Neutral, highly hinted UI workhorse      | Safest; least distinctive                                |
| Manrope                             | SIL OFL 1.1 | Semi-condensed modern                    | Good for dense data (Business dashboards)                |

- **Recommendation:** Plus Jakarta Sans for everything (weights 400/500/600/700, variable file), system font as fallback while loading. No serif display face (Tinder now owns editorial serif; ThirdPlace should read Nordic and clear).
- Confirm Norwegian glyphs (Æ Ø Å æ ø å) render and that `expo-font` loading doesn't flash. Licence files kept in-repo next to fonts.
- **Never** use Airbnb Cereal, Society, FT Regola, or any font without a verified licence.

## 5. Photography and illustration

- **Photography:** real Norwegian places, natural light, people mid-activity rather than posing, warm grade, slight grain allowed. Avoid stock-travel clichés. All fixture imagery must be licensed or self-shot and labelled demo.
- **Illustration:** the T2 dimensional object family ([02](02-dimensional-iconography.md)) doubles as illustration for empty states, onboarding and achievements — one visual language instead of two.

## 6. Surfaces and motion personality

- Surfaces: flat white/near-black, generous radius (20–28 on hero surfaces), soft layered elevation, glass only on floating controls over the map or photos.
- Motion personality: **"steady, then a spark."** Navigation and layout motion is quick and calm (150–220 ms, no bounce); moments of meaning (join, save, check-in, achievement) get a single springy spark with an Ember accent.

## 7. Brand expression by moment (Norwegian copy samples)

| Moment       | Expression                                                           | Sample copy                                            |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------ |
| Onboarding   | Large dimensional objects for interests; one decision per screen     | «Hva får deg ut døra?»                                 |
| Empty state  | Single object, short line, one action                                | «Ingen planer ennå. Finn noe å bli med på i nærheten.» |
| Notification | Plain and specific; no fake urgency or invented counts               | «Quiz-kvelden på Kafé Lys starter om en time.» (demo)  |
| Demo honesty | `DemoBadge` styled as an intentional neutral chip, never as an error | «Demo — ingen reell påmelding»                         |

## 8. Personas: one brand, four tones

| Persona    | Accent use                                 | Density | Notes                                                             |
| ---------- | ------------------------------------------ | ------- | ----------------------------------------------------------------- |
| Explorer   | Ember for CTAs, photography-first          | Low     | Default app                                                       |
| Creator    | Ember + success for publishing states      | Medium  | Hosting tools, calendars                                          |
| Business   | Ink-led, Ember reserved for primary action | High    | Dashboards: Manrope-like density via same family at smaller sizes |
| Enterprise | Neutral ink, Ember only on brand mark      | High    | Multi-location admin; calm, data-first                            |

All four share tokens; personas change **density and accent frequency**, not the palette. Persona entitlements are contract-blocked — this is visual guidance only.

## 9. Light and dark

Both appearances from day one of the token system ([07](07-tokens-and-components.md)): semantic tokens resolve per scheme; elevation in dark = lighter surface + faint border instead of shadow; photography gets a subtle bottom scrim in both.
