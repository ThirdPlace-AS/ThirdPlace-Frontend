# Map Surface — Gap & Traceability Matrix

Source: master Map implementation brief + `DESIGN/ThirdPlace_All_Screens.pdf`
(**visual reference only**, not an API/data authority). This matrix traces every
Map capability to its current implementation and status. It is the Milestone-1
deliverable and is updated as later milestones land.

**Authority** — `approved` (founder/contract), `provisional` (in repo, not
founder-approved), `historical` (prior doc, not V2.2-certified), `blocked`
(needs a canonical contract decision).
**Status** — `complete`, `partial`, `missing`, `blocked`.
**Completion class** — `verified`, `demo-complete` (fixtures, no backend),
`partial`, `contract-blocked`, `native-verify-outstanding`.

## Legend of current paths

- Route: [app/(tabs)/map.tsx](<../../app/(tabs)/map.tsx>)
- Map render: [MapCanvas.tsx](../../src/components/map/MapCanvas.tsx), [MapboxMap.tsx](../../src/components/map/MapboxMap.tsx)
- Detail sheet: [MapDetailSheet.tsx](../../src/components/map/MapDetailSheet.tsx) + [content/\*](../../src/components/map/content)
- Filters: [MapFilterSheet.tsx](../../src/components/map/MapFilterSheet.tsx)
- Fixtures: [fixtures/index.ts](../../src/fixtures/index.ts)

## Matrix

| Feature                                                                       | Brief § | Authority   | Current path                                    | Status                      | Deps             | Priority | Tests                | Founder approval                                    |
| ----------------------------------------------------------------------------- | ------- | ----------- | ----------------------------------------------- | --------------------------- | ---------------- | -------- | -------------------- | --------------------------------------------------- |
| Full-screen map canvas                                                        | 5, 20   | provisional | MapCanvas `fill`                                | complete                    | —                | critical | render               | no                                                  |
| Native Mapbox + SoftMap fallback                                              | 20      | provisional | MapboxMap / SoftMap / stub                      | demo-complete               | native build     | critical | bundle smoke         | no                                                  |
| Floating search bar + grouped overlay                                         | 8       | provisional | map.tsx + MapSearchOverlay + mapSearch          | demo-complete               | fixtures         | high     | mapSearch            | no                                                  |
| Search suggestions (autocomplete)                                             | 8       | provisional | MapSearchOverlay chips + suggestFixtures        | demo-complete (titles only) | mock             | medium   | mapSearch            | no                                                  |
| Unified query matcher (overlay = map = adapter)                               | 8, 9    | provisional | mapSearch.placeMatchesQuery/experience…         | complete                    | —                | high     | mapSearch/mapFilters | no                                                  |
| Discovery-mode selector (6)                                                   | 6       | provisional | DiscoveryModeTabs                               | demo-complete               | fixtures         | critical | mode switch          | For You/Friends: yes                                |
| Notifications control + unread                                                | 5       | provisional | map.tsx + NotificationsSheet                    | complete                    | —                | medium   | render               | no                                                  |
| Notifications: IG restyle + swipe/menu actions                                | 5, 11   | provisional | NotificationsSheet + SwipeableRow               | demo-complete               | fixtures         | medium   | visibleNotifications | demo-only (see note)                                |
| Floating filter button + badge                                                | 5, 9    | provisional | map.tsx                                         | complete                    | —                | high     | render               | no                                                  |
| Current-location control                                                      | 5, 13   | provisional | map.tsx + useMapLocation                        | demo-complete (NV-6)        | expo-location    | high     | interaction          | no                                                  |
| Category pins                                                                 | 7       | provisional | MapboxMap pins                                  | demo-complete               | —                | high     | render               | no                                                  |
| Marker clustering                                                             | 7       | provisional | MapboxMap ShapeSource + softClustering          | demo-complete               | native build     | high     | —                    | no                                                  |
| Selected-marker highlight                                                     | 7       | provisional | MapboxMap `isSelected`                          | complete                    | —                | high     | render               | no                                                  |
| Floating preview card                                                         | 10      | provisional | MapPreviewCard                                  | demo-complete               | —                | critical | preview sync         | no                                                  |
| Expandable detail sheet                                                       | 10, 11  | provisional | MapDetailSheet (16/50/92%)                      | complete                    | —                | critical | render               | no                                                  |
| Map/list toggle + results list                                                | 5, 18K  | provisional | MapBrowseSheet (peek list, Airbnb rows)         | demo-complete               | fixtures         | high     | switch preserves ctx | no                                                  |
| Browse peek sheet + weather/city header                                       | 5       | provisional | MapBrowseSheet (city label + mock weather)      | demo-complete               | mock weather     | medium   | peek/expand          | weather: mock (CB-9)                                |
| Loading / empty states                                                        | 19      | provisional | map.tsx overlays + StateView                    | demo-complete               | —                | medium   | empty results        | no                                                  |
| Error / offline / recovery                                                    | 19      | provisional | map.tsx + StateView                             | demo-complete               | —                | medium   | recovery             | no                                                  |
| 5-tab navigation                                                              | 5       | approved    | app/(tabs)/\_layout.tsx                         | complete                    | —                | —        | —                    | no                                                  |
| Advanced filters: category/distance/open-now                                  | 9       | provisional | MapFilterSheet (Opplevelsestype/Avstand/Tilgj.) | complete                    | —                | high     | each filter          | no                                                  |
| Advanced filters: vibes                                                       | 9       | provisional | MapFilterSheet (Vibe section, `vibes`)          | demo-complete               | mock field       | high     | vibe select          | fields: flagged mock                                |
| Advanced filters: time                                                        | 9       | provisional | MapFilterSheet (Når section, `time`)            | demo-complete               | mock field       | high     | time select          | fields: flagged mock                                |
| Price: histogram + dual-range slider                                          | 9       | provisional | MapFilterSheet + PriceHistogram/RangeSlider     | demo-complete               | mock field       | high     | drag range           | fields: flagged mock                                |
| Filters: Opplevelsestype/Passer for/Varighet/Tid på dagen/Språk/Tilgj.funksj. | 9       | provisional | MapFilterSheet (Airbnb "Filtre" redesign)       | demo-complete               | mock taxonomies  | high     | each section         | fields: flagged mock                                |
| Search header: Where/When/Who (collapsible)                                   | 9, 25   | provisional | MapFilterSheet + WhereField/Calendar/Stepper    | demo-complete               | demo-only axes   | high     | expand/select        | Where recenters; dates+guests demo-only (no filter) |
| Rating: star thresholds + sort                                                | 9       | provisional | MapFilterSheet + RatingStars + sortPlaces       | demo-complete               | mock field       | medium   | threshold/sort       | fields: flagged mock                                |
| Place detail                                                                  | 11      | provisional | content/PlaceContent                            | demo-complete               | —                | high     | open                 | no                                                  |
| Business detail                                                               | 11      | provisional | content/BusinessContent                         | demo-complete               | —                | high     | open                 | no                                                  |
| Experience detail + lifecycle                                                 | 11      | provisional | content/ExperienceContent                       | demo-complete               | —                | high     | open/states          | no                                                  |
| Group detail                                                                  | 11      | provisional | content/GroupContent                            | demo-complete               | —                | medium   | open                 | no                                                  |
| Host / attendees / reviews / write-review                                     | 11      | provisional | content/\* + WriteReviewSheet                   | demo-complete               | —                | medium   | open                 | no                                                  |
| GPS check-in + verification                                                   | 11      | provisional | content/CheckinContent, VerificationContent     | demo-complete               | expo-location    | medium   | open                 | no                                                  |
| Personalization / recommendation presentation                                 | 12      | blocked     | —                                               | contract-blocked            | V2.2 ranking     | later    | —                    | yes                                                 |
| Location permission states + manual area                                      | 13      | provisional | MapLocationSheet + useMapLocation               | demo-complete               | expo-location    | high     | denied fallback      | no                                                  |
| Social-location privacy                                                       | 13      | blocked     | —                                               | contract-blocked            | privacy contract | later    | —                    | yes                                                 |
| Guest mode + context preservation                                             | 14      | provisional | GuestLock + SignInPrompt + useGuestMode         | demo-complete               | auth state       | high     | guest restriction    | no                                                  |
| Motion system (central tokens)                                                | 15      | provisional | src/theme/motion.ts                             | complete                    | —                | medium   | reduced-motion       | no                                                  |
| Haptics                                                                       | 16      | provisional | src/lib/haptics.ts                              | demo-complete (NV)          | expo-haptics     | low      | —                    | no                                                  |
| Accessibility pass                                                            | 22      | provisional | partial labels/roles                            | partial                     | —                | high     | a11y                 | no                                                  |
| Map test coverage                                                             | 24      | provisional | tests/map\*.test.ts                             | complete                    | —                | high     | —                    | no                                                  |

## Completion summary (after M1–M8)

- **Demo-complete:** map canvas + fallback, detail sheet + 9 content views,
  6 discovery modes, floating preview card, map/list toggle + results list,
  marker model + clustering, full search overlay (grouped results + recent),
  base + vibes/time/price-band filters, notifications, selected-marker highlight,
  central motion tokens, haptics, location permission UX + manual-area fallback,
  guest sign-in journey, error/offline recovery, 53 unit/interaction tests.
- **Contract-blocked:** personalization/ranking, social-location privacy, real
  counts/social proof, real mutations (join/save/follow/review/attendance),
  real search backend, saved persistence, real auth.
- **Native-verification-outstanding:** real GPS, native tile load + clustering,
  category pins/selected ring on tiles, camera/gesture feel, haptics, 60fps.

## Notifications — gaps vs the V2.2 contract

The `NotificationsSheet` is a fixtures-only demo re-skinned Instagram-style
(swipe-to-reveal •••/trash, per-item action sheet, type-mute, unread filter,
thumbnail placeholders — all in-memory, `DemoBadge`-marked, reset on reload).

Honesty note: per the V2.2 Notifications contract the per-item actions
("Ikke interessert" / "Slå av varsler som dette" / delete) are **not contract
behavior** — deletion via API is explicitly prohibited and per-item mute is
unspecified. They are Instagram-parity **demo** UI only.

Still unimplemented / contract-blocked: real `/notifications*` API, mark-all-read,
preferences + quiet hours (field-gated `DTO_LOCK`), push + delivery lifecycle,
cross-device sync, category taxonomy, deep-link target resolution, and a
read-state-driven unread badge (the map bell count is still static). The nearest
demo-safe unbuilt items are **mark-all-read** and a read-state-driven badge.

See [MAP_BLOCKERS.md](MAP_BLOCKERS.md) for the blocker + native-verify registers
and [MAP_DELIVERABLES.md](MAP_DELIVERABLES.md) for journeys + completion classes.

## Phase 9–10 changes (2026-11-06)

- Android back steps back / closes the detail sheet before leaving the map (0193).
- Experience detail pins its join bar through gorhom `footerComponent` (PDF p6); join state is a shared demo store (`useExperienceJoin`) (0204).
- `/map?focus=<kind>:<id>&at=<stamp>` opens a detail from Steder "Vis på kartet", Lagret and Mine planer (0199, 0208).
- Browse heart asks guests to sign in, like every other save (0208).
- Map tools sit 12 dp above the measured browse peek (0204).
- Map search shows "Nylig sett" (founder-approved; `useRecentlyViewed`, in-memory) (0209).
- Filtre mounts every section with the sheet; the 400 ms deferral made the lower half settle 1.2–1.4 s on the production bundle (0212).
- The map no longer fakes a 500 ms load on open; loading/error stay reachable via the offline toggle and "Prøv igjen" (0206).
