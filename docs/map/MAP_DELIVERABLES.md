# Map Surface — Deliverables, Journeys & Verification

Closing deliverable for the Map master implementation brief (§28). Summarises
what was built across Milestones 1–8, how it was verified, the user-journey
results, and the completion classification of each capability. Companion to
[MAP_GAP_MATRIX.md](MAP_GAP_MATRIX.md) and [MAP_BLOCKERS.md](MAP_BLOCKERS.md).

All work is fixtures-only demo. `BLOCKED_NOT_V22_CERTIFIED` is intact: no API,
DTO, schema, RLS policy, ranking formula, or real mutation was invented.

## Milestones delivered

| M   | Scope                      | Key output                                                                                                           |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Audit & traceability       | gap matrix + blocker/native-verify registers                                                                         |
| 2   | Full-screen foundation     | 6 discovery modes, floating preview card, map/list toggle, marker model + clustering, motion tokens, 6 feature hooks |
| 3   | Search & advanced filters  | full-screen search overlay (grouped results, recent searches), vibes/time/price-band filters                         |
| 4   | Preview → detail           | gallery/vibes/price-band polish, Save/Share actions across content                                                   |
| 5   | Motion & haptics           | central motion tokens, subtle haptic language (expo-haptics)                                                         |
| 6   | Location, guest & recovery | expo-location permission states + manual-area fallback, guest sign-in prompt, error/offline recovery                 |
| 7   | Mapbox & performance       | web-stub resolver fix, memoized markers + stable handlers + memoized components                                      |
| 8   | Quality & acceptance       | this document, a11y review, final gate                                                                               |

## Architecture (as built)

- Route `app/(tabs)/map.tsx` is a thin composition over feature hooks:
  `useMapFilters`, `useMapDiscovery`, `useMapSelection`, `useMapPresentation`,
  `useMapCamera`, `useMapLocation`, `useMapSaved`, `useGuestMode`,
  `useRecentSearches` (under `src/components/map/hooks/`).
- Presentation model `types/mapPresentation.ts` (`DiscoveryItem`) feeds markers,
  clusters, preview and list from one shape.
- Services: `mapFixtureAdapter` (mode → items, pure), `mapSearch` (grouped
  fixture search), `softClustering` (SoftMap projection + grid clustering).
- Map render: `MapCanvas` switches native `MapboxMap` (clustered `ShapeSource`)
  vs `SoftMap` fallback; Metro stubs `@rnmapbox/maps` on web / without the native
  flag. Motion tokens in `src/theme/motion.ts`; haptics in `src/lib/haptics.ts`.

## User-journey results (verified on Expo web / SoftMap path)

| Journey                                                         | Result                                            |
| --------------------------------------------------------------- | ------------------------------------------------- |
| A — Casual discovery (pin → preview → expand → detail → back)   | ✅ verified                                       |
| B — Search → grouped result → focus/open detail                 | ✅ verified                                       |
| C — Filter apply (category/vibe/price/time) narrows markers     | ✅ verified                                       |
| D — Live mode upcoming experiences                              | ✅ verified (mode swaps to experience items)      |
| E — Friends mode, demo-marked                                   | ✅ verified (non-personalized demo badge)         |
| F — Saved round-trip                                            | ✅ demo (in-memory; persistence contract-blocked) |
| G — Guest restricted action → sign-in prompt, context preserved | ✅ verified                                       |
| H — Permission denied → manual area                             | ✅ verified (manual Oslo-area fallback)           |
| I — Empty results → reset                                       | ✅ verified                                       |
| J — Offline → fallback → recover (retry)                        | ✅ verified (demo offline toggle)                 |
| K — Map/list switch preserves selection                         | ✅ verified                                       |
| L — Detail nav (drill in/back) preserves context                | ✅ verified (in-sheet stack)                      |

## Accessibility findings

- Roles/labels present on all interactive controls (markers, mode tabs
  `role="tab"`, chips, preview/list/detail buttons, toggles `role="switch"`).
- Reduced motion honored: Skeleton, swipe, preview entering animation, mode
  underline all gate on `useReducedMotion()`.
- The **list view is the non-gesture alternative** to map markers (discover +
  inspect without pinch/pan).
- Color is never the sole signal (open/closed and selection also use text/shape).
- Contrast: `muted` #6B6B6B on #F8F8F8 ≈ 5:1 (WCAG AA).
- Touch targets: primary controls are 48px; chips rely on padding + hitSlop.
  Recommend a device pass to confirm chip targets meet 44px (native-verify).

## Performance

- Marker GeoJSON and discovery results are memoized; map screen handlers passed
  to memoized children (`DiscoveryModeTabs`, `MapPreviewCard`, `MapResultsList`)
  are stabilized with `useCallback` over stable hook methods.
- No per-pan-frame work in JS (native Mapbox owns pan/zoom; SoftMap is static).
- Real-device 60fps, native clustering cost, and camera/gesture feel are
  **native-verification-outstanding** — measure on an Android/iOS dev build.

## Mapbox / native verification

- Web + Expo Go use the `SoftMap` fallback with `@rnmapbox/maps` stubbed; the
  web bundle and CI export (token-grep: no `sk.*` leak) pass.
- Outstanding on a native build (`EXPO_PUBLIC_USE_NATIVE_MAP=1` + tokens): tile
  load, native clustering, category pins + selected ring, camera transitions,
  native gestures, real GPS, haptics. See [MAP_BLOCKERS.md](MAP_BLOCKERS.md) §B.

## Completion classification

- **Frontend demonstration complete:** discovery modes, preview card, map/list,
  search + advanced filters, detail content (all kinds), motion/haptics,
  location permission + manual-area UX, guest journey, recovery states.
- **Contract-blocked:** personalization/For-You ranking, friend location, real
  mutations (join/save/follow/review/attendance), search backend, saved
  persistence, real auth (see MAP_BLOCKERS §A).
- **Native-verification-outstanding:** real GPS, native tile/clustering render,
  camera/gesture feel, haptics (see MAP_BLOCKERS §B).

This is a polished demonstration surface, **not** a production-ready Map. CI
(format/lint/typecheck/test + bundle/token-grep) passes; native-device
validation and the V2.2 contracts remain required before production.
