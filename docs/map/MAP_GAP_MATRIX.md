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

| Feature                                            | Brief § | Authority   | Current path                                | Status                       | Deps             | Priority | Tests                | Founder approval     |
| -------------------------------------------------- | ------- | ----------- | ------------------------------------------- | ---------------------------- | ---------------- | -------- | -------------------- | -------------------- |
| Full-screen map canvas                             | 5, 20   | provisional | MapCanvas `fill`                            | complete                     | —                | critical | render               | no                   |
| Native Mapbox + SoftMap fallback                   | 20      | provisional | MapboxMap / SoftMap / stub                  | demo-complete                | native build     | critical | bundle smoke         | no                   |
| Floating search bar                                | 8       | provisional | map.tsx + SearchBar                         | partial (no overlay/results) | —                | high     | interaction          | no                   |
| Discovery-mode selector (6)                        | 6       | provisional | —                                           | missing                      | fixtures         | critical | mode switch          | For You/Friends: yes |
| Notifications control + unread                     | 5       | provisional | map.tsx + NotificationsSheet                | complete                     | —                | medium   | render               | no                   |
| Floating filter button + badge                     | 5, 9    | provisional | map.tsx                                     | complete                     | —                | high     | render               | no                   |
| Current-location control                           | 5, 13   | provisional | map.tsx (demo recenter)                     | partial (no GPS)             | expo-location    | high     | interaction          | no                   |
| Category pins                                      | 7       | provisional | MapboxMap pins                              | partial (places only)        | —                | high     | render               | no                   |
| Marker clustering                                  | 7       | provisional | —                                           | missing                      | native build     | high     | —                    | no                   |
| Selected-marker highlight                          | 7       | provisional | MapboxMap `isSelected`                      | complete                     | —                | high     | render               | no                   |
| Floating preview card                              | 10      | provisional | — (opens sheet directly)                    | missing                      | —                | critical | preview sync         | no                   |
| Expandable detail sheet                            | 10, 11  | provisional | MapDetailSheet (16/50/92%)                  | complete                     | —                | critical | render               | no                   |
| Map/list toggle + results list                     | 5, 18K  | provisional | —                                           | missing                      | —                | high     | switch preserves ctx | no                   |
| Loading / empty states                             | 19      | provisional | map.tsx overlays                            | partial                      | —                | medium   | empty results        | no                   |
| Error / offline / recovery                         | 19      | provisional | —                                           | missing                      | —                | medium   | recovery             | no                   |
| 5-tab navigation                                   | 5       | approved    | app/(tabs)/\_layout.tsx                     | complete                     | —                | —        | —                    | no                   |
| Advanced filters: category/distance/price/open-now | 9       | provisional | MapFilterSheet                              | complete                     | —                | high     | each filter          | no                   |
| Advanced filters: vibes                            | 9       | provisional | —                                           | missing                      | mock field       | high     | vibe select          | fields: flagged mock |
| Advanced filters: time                             | 9       | provisional | —                                           | missing                      | mock field       | high     | time select          | fields: flagged mock |
| Price bands (Gratis/<100/100–300/300+)             | 9       | provisional | priceLevel kr tiers only                    | partial                      | mock field       | medium   | band select          | fields: flagged mock |
| Place detail                                       | 11      | provisional | content/PlaceContent                        | demo-complete                | —                | high     | open                 | no                   |
| Business detail                                    | 11      | provisional | content/BusinessContent                     | demo-complete                | —                | high     | open                 | no                   |
| Experience detail + lifecycle                      | 11      | provisional | content/ExperienceContent                   | demo-complete                | —                | high     | open/states          | no                   |
| Group detail                                       | 11      | provisional | content/GroupContent                        | demo-complete                | —                | medium   | open                 | no                   |
| Host / attendees / reviews / write-review          | 11      | provisional | content/\* + WriteReviewSheet               | demo-complete                | —                | medium   | open                 | no                   |
| GPS check-in + verification                        | 11      | provisional | content/CheckinContent, VerificationContent | demo-complete                | expo-location    | medium   | open                 | no                   |
| Personalization / recommendation presentation      | 12      | blocked     | —                                           | contract-blocked             | V2.2 ranking     | later    | —                    | yes                  |
| Location permission states + manual area           | 13      | provisional | —                                           | missing                      | expo-location    | high     | denied fallback      | no                   |
| Social-location privacy                            | 13      | blocked     | —                                           | contract-blocked             | privacy contract | later    | —                    | yes                  |
| Guest mode + context preservation                  | 14      | provisional | GuestLock                                   | partial                      | auth state       | high     | guest restriction    | no                   |
| Motion system (central tokens)                     | 15      | provisional | inline literals                             | missing                      | —                | medium   | reduced-motion       | no                   |
| Haptics                                            | 16      | provisional | —                                           | missing                      | expo-haptics     | low      | —                    | no                   |
| Accessibility pass                                 | 22      | provisional | partial labels/roles                        | partial                      | —                | high     | a11y                 | no                   |
| Map test coverage                                  | 24      | provisional | none (0 map tests)                          | missing                      | —                | high     | —                    | no                   |

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

See [MAP_BLOCKERS.md](MAP_BLOCKERS.md) for the blocker + native-verify registers
and [MAP_DELIVERABLES.md](MAP_DELIVERABLES.md) for journeys + completion classes.
