# 03 — Tinder 2026 Swipe Interaction Audit

Reference date 2026-10-24. Tags and sources: see [README](README.md).

## 1. Two separate 2026 events

| Event                                  | Date        | Scope                                                                                                                                                                                                                      | Tag / source                      |
| -------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Tinder Sparks 2026** product keynote | 12 Mar 2026 | "Sleek redesign": **edge-to-edge profile photos**, **subtle blur effect**, **Liquid Glass aesthetic for the Like and Nope bar**; new Events tab; Music/Astrology modes. Visual redesign said to be coming "soon"; no date. | `REPORTED` S6, `OBSERVED` S7      |
| **Brand refresh** with Porto Rocha     | Jul 2026    | All-caps wordmark; refined flame; serif _Society_ (AllCaps) + _FT Regola_ (Formula Type); red "Flame" palette plus blue/green; **motion system built on the swipe** — swiping reveals type, logo or imagery underneath.    | `OBSERVED` S8, `REPORTED` S9, S10 |

Core matching mechanics are reported as unchanged (S6). No App Store release note tying the visual redesign to a specific version was found, so **rollout status per region is unknown**.

## 2. Interaction audit

The swipe card has been public for over a decade; its general behaviour is well known. Exact numbers (thresholds, springs) are **not published** and were **not measured** (public sources only), so they are labelled `HYPOTHESIS`.

| Aspect                         | Tinder (2026)                                                                                                            | Tag           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------- |
| Card presentation              | Photo fills the card edge to edge; name/details overlaid at the bottom on a blur/gradient.                               | `REPORTED` S6 |
| Action controls                | Like / Nope bar rendered as translucent "Liquid Glass" buttons floating over the photo.                                  | `REPORTED` S6 |
| Drag                           | Card follows the finger 1:1 in x and y.                                                                                  | `HYPOTHESIS`  |
| Rotation                       | Rotation grows with horizontal distance, roughly up to 10–20° near the edge; pivot below the card centre so it "swings". | `HYPOTHESIS`  |
| Commit threshold               | Commits past a distance threshold (a sizeable fraction of screen width) **or** on a fast flick regardless of distance.   | `HYPOTHESIS`  |
| Feedback while dragging        | "LIKE" / "NOPE" stamp fades in proportionally to drag distance; buttons react.                                           | `HYPOTHESIS`  |
| Spring-back                    | Released below threshold → springs back to centre with slight overshoot.                                                 | `HYPOTHESIS`  |
| Off-screen dismissal           | Continues in the flick direction, keeping release velocity, then removed.                                                | `HYPOTHESIS`  |
| Stacking / depth               | Next card sits behind, slightly smaller; it scales up as the top card leaves.                                            | `HYPOTHESIS`  |
| Photos                         | Tap left/right half to move between photos; segmented progress indicator at top.                                         | `HYPOTHESIS`  |
| Info expansion                 | Tap/swipe up on the info area to open the full profile.                                                                  | `HYPOTHESIS`  |
| Undo                           | "Rewind" exists as a paid feature.                                                                                       | `HYPOTHESIS`  |
| Haptics                        | Light haptics on threshold and on match (iOS).                                                                           | `HYPOTHESIS`  |
| Brand motion                   | The swipe gesture is used as a reveal transition across the brand.                                                       | `OBSERVED` S8 |
| Accessibility / reduced motion | No public Tinder documentation found.                                                                                    | `GAP`         |

### Platform notes for glass controls

- iOS 26 Liquid Glass has system settings for Reduce Transparency and Increase Contrast; apps should honour them (S15).
- Expo's `expo-glass-effect` `GlassView` works on **iOS 26+ only** and falls back to a plain `View` elsewhere; Android needs a hand-made translucent fallback (S14).

## 3. ThirdPlace semantics (preserve)

From `app/(tabs)/swipe.tsx` today:

- Right = **"Bli med"** (join — demo), left = **"Hopp over"** (pass). Card shows tag, title, host, time, spots, `DemoBadge`.
- No scoring, interest registration, group matching or GPS join exists (`BLOCKED_CONTRACT_GAP`).
- Accessible button alternatives already exist (close + heart).

ThirdPlace swipes on **experiences/places**, not people. The design must not import dating cues (no "match" celebration with faces, no super-like) unless the product contract defines them.

## 4. Gaps in ThirdPlace's current swipe

| Current (`swipe.tsx`)                             | Issue                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Local `THRESHOLD = 110` px, distance only         | Ignores `motion.gesture.dragCommitPx` / `flingVelocity`; a fast flick under 110 px springs back. |
| Exit uses fixed `withTiming` 180 ms to ±600 px    | Doesn't carry release velocity; feels abrupt on fast flicks and slow on gentle ones.             |
| Rotation `x / 20` deg, unclamped, pivot at centre | Can over-rotate; no swing feel.                                                                  |
| Single card, no stack                             | No depth; next card pops in.                                                                     |
| No haptics                                        | `src/lib/haptics.ts` exists but is unused here.                                                  |
| No undo                                           | Accidental swipes are unrecoverable (demo state).                                                |
| Card not full-bleed; media placeholder 192 px     | Not immersive.                                                                                   |
| Buttons plain circles                             | No glass treatment; fine for now.                                                                |
| Reduced motion only removes rotation              | Fling still animates across screen.                                                              |

## 5. Proposed ThirdPlace swipe specification

`PROPOSAL` — numbers are ThirdPlace's own, tuned for a 375-pt-wide phone, not Tinder's. Full motion tables in [09](09-prototypes-and-motion.md).

| Parameter        | Value                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------ |
| Commit distance  | `                                                                                                                   | dx  | > 0.28 × cardWidth` (≈ 96 pt on 343-pt card)           |
| Commit velocity  | `                                                                                                                   | vx  | > 800 pt/s` in the drag direction (overrides distance) |
| Rotation         | `dx / cardWidth × 14°`, clamped ±14°, `transformOrigin` bottom-centre                                               |
| Vertical drag    | Follows finger × 0.35 (damped); never commits on its own                                                            |
| Feedback overlay | "BLI MED" / "HOPP OVER" opacity = `clamp(                                                                           | dx  | / commitDistance, 0, 1)`                               |
| Spring-back      | `withSpring(0, { damping: 18, stiffness: 200, mass: 1 })`                                                           |
| Exit             | `withDecay`-like: `withTiming` to `±1.4 × screenWidth` over `clamp(260 −                                            | vx  | /10, 140, 260)`ms, ease-out; carry`vy`                 |
| Stack            | Render top 3; card _n_ at scale `1 − 0.04n`, translateY `10n`; next card interpolates to scale 1 as top card moves  |
| Haptics          | `selection` once when crossing the commit line (reset if dragged back); `light` on commit; none on spring-back      |
| Undo ("Angre")   | Single-level, local demo state; card re-enters from its exit side with spring `snappy`                              |
| Info expansion   | Tap info area / chevron → existing `Sheet` detail (sheet, not route)                                                |
| Photos           | Tap left/right 30% zones to step photos; segmented indicator; only when the card has >1 photo                       |
| Reduced motion   | No rotation, no stack parallax, exit = 150 ms crossfade; haptics kept                                               |
| Accessibility    | Buttons always visible; card exposes `accessibilityActions` "Bli med", "Hopp over", "Angre"; web: ← / → / Backspace |
