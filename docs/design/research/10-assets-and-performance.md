# 10 — Asset Production & Performance Recommendations

Reference date 2026-10-24. All `PROPOSAL`. **Every new dependency below is an architecture change and needs founder approval** (see [12](12-contract-founder-approval.md)). Current state: none of `react-native-svg`, `expo-image`, `expo-blur`, `expo-glass-effect`, `lottie-react-native`, `rive-react-native` is installed.

## 1. Format choice per asset type

| Asset                                  | Recommended format                                                                                                               | Why                                                                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1 line icons                          | **Custom icon font** built from SVG masters (loaded via `@expo/vector-icons` `createIconSet`) — or `react-native-svg` components | Icon font: zero new runtime dependency (expo-font + vector-icons already present), one draw call per glyph, tintable. SVG: easier multicolour, needs `react-native-svg`. |
| T2 dimensional stills                  | **WebP (lossless or q90) with alpha**, @1x/@2x/@3x, via `expo-image`                                                             | Small, alpha-capable, cached, fast decode on both platforms                                                                                                              |
| T2 one-shot motion (category select)   | Still + **Reanimated transform** (scale/tilt/bounce)                                                                             | No extra asset; runs on UI thread; trivially respects reduced motion                                                                                                     |
| T2 frame sequences (achievements)      | **Sprite sheet WebP** stepped by Reanimated, or **animated WebP** via `expo-image`                                               | No proprietary format; predictable size                                                                                                                                  |
| Interactive 2.5D (state machines)      | **Rive** (`rive-react-native`, needs dev build)                                                                                  | Vector, small, interactive; only if an icon truly needs input-driven states                                                                                              |
| Flat vector motion (loaders, confetti) | **Lottie** (`lottie-react-native`)                                                                                               | Mature, designer tooling via After Effects/Bodymovin (S18)                                                                                                               |
| Video-with-alpha (Lava-like)           | **Not recommended** for v1                                                                                                       | iOS HEVC-alpha vs Android VP9/WebM-alpha split, decoder cost per icon, no gain over sprites at icon size                                                                 |
| Photography                            | JPEG/WebP/AVIF from a CDN, `expo-image` with blurhash/thumbhash placeholder                                                      | Caching, progressive placeholder, memory-efficient                                                                                                                       |
| App icon / splash                      | 1024 PNG master + adaptive layers (Android) + monochrome layer                                                                   | Platform requirements                                                                                                                                                    |

## 2. Production pipeline for T2 objects

1. Brief per family (object list, story, one Ember touch).
2. Block-out in Blender (or equivalent) using **one shared scene file**: fixed camera (≈ 30° elevation, 3/4 view, ~35 mm equivalent), fixed 3-light rig + soft HDRI, shared matte/satin material library, shadow-catcher plane.
3. Silhouette test at 24 pt (flat black) before materials.
4. Render 512 × 512 PNG with alpha → export WebP @1x (64), @2x (128), @3x (192).
5. For motion: render 24 fps sequence ≤ 900 ms, pack into a sprite sheet, or prefer a transform on the still.
6. Optimise (cwebp / squoosh), check size budget, commit to `assets/icons/<family>/`.
7. Review on device, light and dark, at 1× / 2× / 3×.

AI image generation may be used for exploration only; final assets must be original and owned, with no prompts referencing Airbnb or any brand.

## 3. Performance budgets

| Item                                  | Budget                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| T2 still @3x (192 px) WebP            | ≤ 14 KB each                                                                 |
| Achievement sprite sheet              | ≤ 120 KB each                                                                |
| Total T2 assets shipped in the bundle | ≤ 1.5 MB (others lazy/CDN)                                                   |
| T1 icon font                          | ≤ 40 KB                                                                      |
| Custom UI font (variable)             | ≤ 250 KB per family                                                          |
| Swipe gesture                         | 60 fps on a mid-range Android; no JS-thread work during drag (worklets only) |
| Card stack                            | Render ≤ 3 cards; images pre-fetched for next 2                              |
| Simultaneous animated icons on screen | ≤ 3                                                                          |
| Blur/glass views on screen            | ≤ 4 (blur is GPU-expensive, especially on Android)                           |

## 4. Platform notes

- **Glass:** `expo-glass-effect` is iOS 26+ only and falls back to a plain View; check `isLiquidGlassAvailable()` before use (S14). Android → `glassFallback` translucent fill. Respect Reduce Transparency (S15).
- **Blur:** `expo-blur` on Android has historically required an opt-in experimental blur method and is costly — treat Android blur as optional and verify on a dev build.
- **Native-module guard:** new native deps (blur, glass, image, Rive) must follow the repo's lazy + guarded require pattern (`src/lib/haptics.ts`) so the existing dev build degrades instead of crashing.
- **Expo Go / web:** Rive and glass need a dev build; web falls back to CSS-equivalent or plain views. CI's web/android export must still pass on the stub path.
