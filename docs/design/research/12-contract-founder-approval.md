# 12 — Contract Compatibility & Founder-Approval Report

Reference date 2026-10-24. Governance state: **`BLOCKED_NOT_V22_CERTIFIED` — preserved.** TP-BLOCK-001…006 remain open.

## 1. Contract compatibility

| Check                                                       | Result                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| API endpoints / DTOs added or changed                       | **None**                                                                                    |
| DB tables, migrations, RLS policies                         | **None**                                                                                    |
| Auth entitlements / persona permissions                     | **None** — persona guidance in [05 §8](05-brand-recommendations.md) is visual only          |
| Ranking / matchmaking / scoring formulas                    | **None** — swipe spec is gesture physics only; no signal logging                            |
| Real counts, social proof, verification                     | **None invented** — all trust/social slots are designed for `DemoBadge`-marked fixtures     |
| Payment / booking rules                                     | **None**                                                                                    |
| Code, tokens, icons, deps changed in this slice             | **None** — docs only (`docs/design/research/`, one ledger line)                             |
| Honesty markers                                             | Kept and strengthened (DemoBadge/GuestLock restyled as intentional, read by screen readers) |
| 5-tab navigation (approved)                                 | Unchanged                                                                                   |
| Sheet-based detail architecture                             | Unchanged                                                                                   |
| Styling = NativeWind, motion = Reanimated + Gesture Handler | Unchanged and assumed by all proposals                                                      |

### Discrepancy recorded

The brief refers to "existing **Node.js** and Supabase contracts". Repository governance (`docs/PHASE0_BLOCKER_REPORT.json`, `docs/IMPLEMENTATION_BASELINE.md`) locks the backend as **Python/FastAPI** (separate `ThirdPlace-Backend` repo) and states an earlier Node.js direction must not silently replace it. Founder confirmed on 2026-10-24 that **FastAPI holds**. No Node.js contracts exist; Supabase is only a client boundary. This research has no backend impact either way.

## 2. Items that need approval before implementation

Mark each: **A** approve · **R** reject · **V** revise.

### Brand

| ID   | Decision                                                                                      | Doc | A/R/V |
| ---- | --------------------------------------------------------------------------------------------- | --- | ----- |
| D-01 | Brand idea "det tredje stedet — the local doorway", motion personality "steady, then a spark" | 05  |       |
| D-02 | Mark direction: A Spark (evolve current) / B Doorway / C Third dot                            | 05  |       |
| D-03 | Typeface: Plus Jakarta Sans (OFL) — or Figtree / Inter / Manrope                              | 05  |       |
| D-04 | Keep Ember `#D80000` as the single brand colour (confirm exact hex vs `#E00000` in Figma)     | 05  |       |
| D-05 | Dark-mode palette incl. split `ember` (fill) / `emberText`                                    | 07  |       |
| D-06 | Categorical palette `cat1–8`, separated from status colours                                   | 07  |       |
| D-07 | Confirm `danger` / `warning` hexes (low-confidence source)                                    | 07  |       |

### Tokens & components

| ID   | Decision                                                                                      | Doc | A/R/V |
| ---- | --------------------------------------------------------------------------------------------- | --- | ----- |
| D-08 | Elevation scale e0–e4 via `boxShadow`                                                         | 07  |       |
| D-09 | Radius `xl` 28; spacing `2xl` 32 / `3xl` 48                                                   | 07  |       |
| D-10 | Type scale with line height + tracking, exposed as Tailwind classes                           | 07  |       |
| D-11 | Motion additions (`micro`, `crossfade`, `card`, `spark`, swipe gestures, press scale)         | 07  |       |
| D-12 | Component specs: Card, Chip, Sheet, TabBar, GlassButton, SwipeCard, MapPin, DemoBadge restyle | 07  |       |

### Icons

| ID   | Decision                                                                                                     | Doc    | A/R/V |
| ---- | ------------------------------------------------------------------------------------------------------------ | ------ | ----- |
| D-13 | Two-tier system: T1 line + T2 dimensional objects                                                            | 02     |       |
| D-14 | T1 spec (24 grid, 1.75 stroke, round caps, outline→filled) and delivery as custom icon font                  | 02, 10 |       |
| D-15 | T2 rig (3/4 view ≈ 30°, soft key light, matte material, one Ember touch)                                     | 02     |       |
| D-16 | Families & order of production: Navigation → Map Utility → Category → Interest/Vibe → Business → Achievement | 02     |       |
| D-17 | Replace Ionicons gradually (per family, behind approval), never all at once                                  | 06     |       |

### UX

| ID   | Decision                                                                                  | Doc | A/R/V |
| ---- | ----------------------------------------------------------------------------------------- | --- | ----- |
| D-18 | Swipe rebuild per spec (stack, velocity commit, haptics, one-level Angre, reduced motion) | 03  |       |
| D-19 | Glass floating controls on Map (iOS 26 glass, opaque fallbacks)                           | 08  |       |
| D-20 | Keyword-to-filter search suggestions (fixture matching only)                              | 08  |       |
| D-21 | Add-tab wizard shell ending in a demo state                                               | 08  |       |
| D-22 | Profile layout with trust and "steder jeg har vært" slots (demo data)                     | 08  |       |

### Architecture / dependencies (each is a separate approval)

| ID   | Dependency                   | Purpose                                 | Native?                | A/R/V |
| ---- | ---------------------------- | --------------------------------------- | ---------------------- | ----- |
| D-23 | `expo-image`                 | Photos, T2 WebP, blurhash               | Yes                    |       |
| D-24 | `expo-glass-effect`          | iOS 26 Liquid Glass                     | Yes                    |       |
| D-25 | `expo-blur`                  | Blur where glass unavailable            | Yes                    |       |
| D-26 | `react-native-svg`           | Only if SVG icons chosen over icon font | Yes                    |       |
| D-27 | `lottie-react-native`        | Flat vector motion                      | Yes                    |       |
| D-28 | `rive-react-native`          | Interactive achievements (later)        | Yes                    |       |
| D-29 | Font files + licence in repo | Chosen typeface                         | No (expo-font present) |       |

Native deps need a fresh dev build (`expo run:android`) and must use the lazy guarded require pattern.

## 3. Explicitly out of scope until the V2.2 contract is imported

Join/approval/invite-only behaviour, real social graph and Friends map, verification and trust data, achievements earning rules, persona entitlements, publishing/moderation, chat types and delivery, any ranking or personalisation. Designs exist only as demo-honest slots.

## 4. Suggested implementation slices (after approval)

1. Tokens: colour (light+dark), elevation, radius, type, motion — no visual redesign yet.
2. Swipe rebuild on tokens.
3. Glass/elevation on Map floating controls.
4. Font load + type classes.
5. T1 icon font, Navigation + Map Utility first.
6. `expo-image` + photo-first cards.
7. T2 Category family.

Each slice: one PR, one ledger line, full local gate.
