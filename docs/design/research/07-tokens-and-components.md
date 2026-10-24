# 07 — Proposed Design Tokens & Component Specifications

Reference date 2026-10-24. **PROPOSAL — not applied.** Current files are untouched: `src/theme/tokens.js`, `src/theme/motion.ts`, `src/theme/typography.ts`, `tailwind.config.js`. Each block shows **current → proposed**. Applying them is a separate, approved slice.

## 1. Colour (semantic, light + dark)

Existing names are kept so no call site breaks; new names are additive.

| Token           | Current light | Proposed light           | Proposed dark         | Change                              |
| --------------- | ------------- | ------------------------ | --------------------- | ----------------------------------- |
| `background`    | `#F8F8F8`     | `#F8F8F8`                | `#121212`             | + dark                              |
| `surface`       | `#FFFFFF`     | `#FFFFFF`                | `#1E1E1E`             | + dark                              |
| `surfaceRaised` | —             | `#FFFFFF`                | `#282828`             | new                                 |
| `surfaceMuted`  | `#F0F0F0`     | `#F0F0F0`                | `#2A2A2A`             | + dark                              |
| `line`          | `#E0E0E0`     | `#E0E0E0`                | `#333333`             | + dark                              |
| `ink`           | `#202020`     | `#202020`                | `#F2F2F2`             | + dark                              |
| `onInk`         | `#FFFFFF`     | `#FFFFFF`                | `#121212`             | + dark                              |
| `muted`         | `#6B6B6B`     | `#6B6B6B`                | `#A3A3A3`             | + dark                              |
| `ember`         | `#D80000`     | `#D80000`                | `#D80000`             | fill only                           |
| `onEmber`       | `#FFFFFF`     | `#FFFFFF`                | `#FFFFFF`             | —                                   |
| `emberText`     | —             | `#D80000`                | `#FF4D4D`             | new                                 |
| `emberPressed`  | —             | `#B00000`                | `#B00000`             | new                                 |
| `success`       | `#387850`     | `#387850`                | `#5FB37E`             | + dark                              |
| `danger`        | `#B5342B`     | `#B5342B`                | `#FF6B5E`             | + dark (confirm source)             |
| `warning`       | `#B05008`     | `#B05008`                | `#F0A040`             | + dark (confirm source)             |
| `scrim`         | —             | `rgba(0,0,0,0.45)`       | `rgba(0,0,0,0.6)`     | new (photo overlays)                |
| `glassFallback` | —             | `rgba(255,255,255,0.86)` | `rgba(30,30,30,0.86)` | new (Android / Reduce Transparency) |

Computed contrast (WCAG 2.x formula): ember/white 5.36 · ink/bg 15.34 · muted/bg 5.02 · success/white 5.29 · danger/white 6.02 · warning/white 5.25 · dark: emberText/surface 5.10 · ink/bg 16.73 · muted/surface 6.61 · success 6.54 · danger 5.97 · warning 7.79. **White on `#FF4D4D` = 3.27 → forbidden pairing.**

**Categorical (map pins, category chips) — separate from status:**

| Token  | Hex       | vs white | vs light basemap `#E8E4DC` |
| ------ | --------- | -------- | -------------------------- |
| `cat1` | `#C2410C` | 5.18     | 4.08                       |
| `cat2` | `#15803D` | 5.02     | 3.96                       |
| `cat3` | `#B91C8C` | 5.82     | 4.59                       |
| `cat4` | `#1D4ED8` | 6.70     | 5.29                       |
| `cat5` | `#7C3AED` | 5.70     | 4.49                       |
| `cat6` | `#0F766E` | 5.47     | 4.32                       |
| `cat7` | `#A16207` | 4.92     | 3.88                       |
| `cat8` | `#475569` | 7.58     | 5.98                       |

All ≥ 3:1 against a light basemap (WCAG 1.4.11 non-text). On dark basemaps several drop below 3:1, so pins keep the existing **3-pt white ring** (already in `MapboxMap.tsx`), which supplies the contrast. Category must never be colour-only: the pin carries a T1 glyph or a title label. Ember is deliberately **not** a category colour (reserved for selection/brand).

## 2. Radius

| Token  | Current | Proposed | Use                              |
| ------ | ------- | -------- | -------------------------------- |
| `sm`   | 8       | 8        | Small chips, inputs inner        |
| `md`   | 12      | 12       | Buttons, inputs, list tiles      |
| `lg`   | 20      | 20       | Cards                            |
| `xl`   | —       | 28       | Sheets (top corners), swipe card |
| `full` | 9999    | 9999     | Pills, FABs                      |

## 3. Spacing

Keep `xs 4 · sm 8 · md 12 · gutter 16 · lg 20 · xl 24`; add `2xl 32` (section) and `3xl 48` (hero). 4-pt base grid.

## 4. Elevation (new)

Uses React Native's `boxShadow` style (available on the New Architecture in RN 0.76+; ThirdPlace is on RN 0.86 with New Arch on — verify on Android before adoption). Dark scheme replaces shadow with `surfaceRaised` + 1-pt `line` border.

| Token | Light `boxShadow`                                            | Use                                             |
| ----- | ------------------------------------------------------------ | ----------------------------------------------- |
| `e0`  | none                                                         | Flat content                                    |
| `e1`  | `0 1px 2px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)`     | Cards, list tiles                               |
| `e2`  | `0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)`    | Floating map controls, preview card, swipe card |
| `e3`  | `0 -2px 8px rgba(0,0,0,0.06), 0 -12px 32px rgba(0,0,0,0.10)` | Bottom sheets                                   |
| `e4`  | `0 12px 40px rgba(0,0,0,0.18)`                               | Modals, menus                                   |

Replaces the inline shadows in `MapCanvas.tsx`, `MapFilterSheet.tsx`, `RangeSlider.tsx` (later slice).

## 5. Typography

Family per [05 §4](05-brand-recommendations.md) (recommendation: Plus Jakarta Sans; system fallback). Adds line height + tracking; sizes unchanged except display.

| Style        | Size | Line | Weight | Tracking         |
| ------------ | ---- | ---- | ------ | ---------------- |
| `display`    | 32   | 38   | 700    | −0.5             |
| `h1`         | 24   | 30   | 700    | −0.3             |
| `h2`         | 20   | 26   | 600    | −0.2             |
| `title`      | 18   | 24   | 600    | 0                |
| `body`       | 16   | 24   | 400    | 0                |
| `bodyStrong` | 16   | 24   | 600    | 0                |
| `caption`    | 13   | 18   | 500    | 0                |
| `micro`      | 11   | 14   | 600    | +0.4 (uppercase) |

Expose in `tailwind.config.js` `fontSize` as `[size, { lineHeight, letterSpacing, fontWeight }]` so `className="text-title"` works.

## 6. Motion (extends `src/theme/motion.ts`)

| Group    | Token               | Current     | Proposed                                                 |
| -------- | ------------------- | ----------- | -------------------------------------------------------- |
| duration | `micro`             | —           | 90 (press in)                                            |
| duration | `fast/base/slow`    | 150/220/320 | unchanged                                                |
| duration | `fling`             | 180         | 180 (fallback; swipe uses velocity-based)                |
| duration | `crossfade`         | —           | 150 (reduced-motion substitute)                          |
| spring   | `snappy`            | 20/220/1    | unchanged                                                |
| spring   | `gentle`            | 26/160/1    | unchanged                                                |
| spring   | `card`              | —           | damping 18, stiffness 200, mass 1 (swipe spring-back)    |
| spring   | `spark`             | —           | damping 12, stiffness 260, mass 0.8 (icon select / save) |
| gesture  | `flingVelocity`     | 600         | unchanged (map/preview)                                  |
| gesture  | `dragCommitPx`      | 72          | unchanged (preview)                                      |
| gesture  | `swipeCommitRatio`  | —           | 0.28 × card width                                        |
| gesture  | `swipeVelocity`     | —           | 800 pt/s                                                 |
| gesture  | `swipeMaxRotateDeg` | —           | 14                                                       |
| gesture  | `stackScaleStep`    | —           | 0.04                                                     |
| press    | `pressScale`        | —           | 0.97 (buttons), 0.94 (icons)                             |

## 7. Component specifications

All components: NativeWind `className`; imperative `colors` only for native colour props; honour `useReducedMotion()`; no nested `Pressable`.

### Card

- Radius `lg`, surface, elevation `e1` (dark: `surfaceRaised` + border). Media top, 4:3 or 16:10, `expo-image` with blurhash placeholder (when added). Save heart top-right on a 36-pt glass circle.
- Press: scale `pressScale` 0.97, `micro` in / `fast` out.

### Chip

- Height 36, radius `full`, `caption` style. Idle: `surface` + `line` border. Selected: `ink` fill, `onInk` text (current ThirdPlace rule — ink for selection). Optional leading T1 icon 16 pt, or T2 object 24 pt in category pickers.

### Sheet (both `Sheet.tsx` and `@gorhom/bottom-sheet`)

- Top radius `xl` 28, elevation `e3`, grabber 36×5 `line` colour, 8 pt from top. Backdrop `scrim`. Same visual spec for both implementations. Keep the "backdrop is a sibling behind the card" rule.

### TabBar

- 5 approved tabs. Height 56 + safe area. Idle glyph `muted` outline; active glyph `ink` filled + label `ink` 600. Tab change → `spark` spring scale 0.9 → 1 on the new icon (none under reduced motion). Keeps the existing collapse-with-map-sheet behaviour.

### GlassButton (new, floating map controls and swipe actions)

- 44–64 pt circle. iOS 26+: `GlassView` (`expo-glass-effect`) when `isLiquidGlassAvailable()`; else `glassFallback` fill + `e2`. Honour Reduce Transparency (→ opaque `surface`). Icon T1 24 pt.

### SwipeCard (new)

- Full-bleed media, radius `xl`, `e2`. Info block bottom-aligned over a `scrim` gradient; white text (contrast vs scrim ≥ 4.5:1 must be verified on real photos). `DemoBadge` top-right. Gesture per [03 §5](03-tinder-swipe-audit.md). Action row below the card: Hopp over (GlassButton, `danger` icon), Angre (small, `muted`), Bli med (Ember fill, white heart).

### MapPin

- 32-pt circle in `catN`, 3-pt white ring, T1 glyph 16 pt white. Selected: ring becomes `ink` 3 pt + scale 1.15 with `spark`. Cluster: `ink` circle with count. Title label below (existing behaviour).

### DemoBadge / GuestLock (restyle only)

- DemoBadge: `micro` style, `surfaceMuted` fill, `muted` text, radius `full` — reads as an intentional label, not an error. GuestLock: lock T1 icon + `caption`. **Behaviour unchanged.**
