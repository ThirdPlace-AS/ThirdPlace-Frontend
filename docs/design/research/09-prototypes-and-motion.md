# 09 — Visual Prototypes & Motion Specifications

Reference date 2026-10-24. All `PROPOSAL`.

## Interactive prototype

- **Private artifact:** <https://claude.ai/artifact/FpZTxXHiKwKvBAAn7sxnvn> (owner-only until shared from its Share menu).
- **Source:** [prototype/index.html](prototype/index.html) (self-contained HTML; open in a browser).

Contents: swipe stack with the proposed physics (drag, flick, buttons, keyboard, undo, haptic indicator, reduced-motion toggle); map with glass controls, categorical pins and a bottom sheet; colour roles with live contrast in light and dark; typeface comparison on Norwegian copy; mark directions A/B/C; T1 line icons (outline/filled) and T2 dimensional sketches with the select motion; elevation and radius scales; motion token table.

The prototype is a web approximation. Springs use the same physical parameters as Reanimated's `withSpring` (damping, stiffness, mass) via a small integrator, so the feel carries over; native rendering, real haptics, Liquid Glass and font rendering must be verified on device.

## Motion specifications

### Global

| Token                | Value          | Use                                          |
| -------------------- | -------------- | -------------------------------------------- |
| `duration.micro`     | 90 ms          | Press-in                                     |
| `duration.fast`      | 150 ms         | Press-out, fades, chip select                |
| `duration.base`      | 220 ms         | Sheet content, tab content swap              |
| `duration.slow`      | 320 ms         | Large layout changes                         |
| `duration.crossfade` | 150 ms         | Reduced-motion substitute for spatial motion |
| `spring.snappy`      | 20 / 220 / 1   | Sheet settle, preview, undo re-entry         |
| `spring.gentle`      | 26 / 160 / 1   | Content settle                               |
| `spring.card`        | 18 / 200 / 1   | Swipe spring-back                            |
| `spring.spark`       | 12 / 260 / 0.8 | Icon select, save, tab change, pin select    |
| `press.scale`        | 0.97 / 0.94    | Buttons / icon buttons                       |

Easing for timed motion: ease-out cubic for exits and entrances; linear only for opacity crossfades.

### Swipe (Sveip)

| Phase            | Spec                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Drag             | translateX = dx; translateY = dy × 0.35; rotate = clamp(dx / w × 14°, ±14°); origin bottom-centre                |
| Feedback         | Stamp opacity = clamp(\|dx\| / (0.28w), 0, 1); next card scale 0.96 → 1 and y 10 → 0 by the same progress        |
| Threshold haptic | `selection`, once per crossing; re-arms when dragged back                                                        |
| Commit           | \|dx\| > 0.28w **or** \|vx\| > 800 pt/s in drag direction                                                        |
| Exit             | to ±1.4 × screen width over clamp(260 − \|vx\| / 10, 140, 260) ms, ease-out; y continues with vy; `light` haptic |
| Spring-back      | `spring.card` on x and y with release velocity                                                                   |
| Undo             | Card re-enters from its exit side with `spring.snappy`                                                           |
| Reduced motion   | No rotation, no stack interpolation; exit and undo are 150-ms crossfades; haptics kept                           |

Implementation notes for React Native: drive all of this from `Gesture.Pan()` worklets with shared values (`onChange` / `onEnd` with `e.velocityX`); use `withSpring(0, { ...spring.card, velocity })` for spring-back and `withTiming` for exit; trigger haptics with `runOnJS` into `src/lib/haptics.ts`; render at most 3 cards.

### Icons

| Event          | Motion                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| T1 select      | Glyph swaps outline → filled; scale 0.9 → 1 with `spring.spark`                                                |
| Tab change     | New tab icon scale 0.88 → 1 with `spring.spark`; label weight 500 → 600 (no animation)                         |
| T2 select      | Squash/stretch bounce from the base (impulse into `spring.spark`), or the object's own ≤ 900 ms frame sequence |
| Save (heart)   | Filled Ember + `spring.spark` scale 0.9 → 1; `light` haptic                                                    |
| Pin select     | Scale 1 → 1.15 with `spring.spark`; ring white → ink                                                           |
| Reduced motion | Final state immediately; no scale, no bounce                                                                   |

### Map & sheets

| Event                    | Motion                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Preview → detail sheet   | Sheet rises with `spring.snappy`; preview image morphs into the header (layout transition, `duration.base`) |
| Sheet dismiss            | Follows finger; commits past 25% of height or 600 pt/s (existing `flingVelocity`)                           |
| Glass controls on scroll | No motion; they stay put (avoid parallax on controls)                                                       |
| Reduced motion           | Sheets fade + slide 16 pt only                                                                              |
