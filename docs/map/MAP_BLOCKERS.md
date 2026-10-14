# Map Surface — Blocker & Native-Verification Registers

Companion to [MAP_GAP_MATRIX.md](MAP_GAP_MATRIX.md). Tracks what cannot be safely
completed as frontend demo work and what needs a real device build to verify.
`BLOCKED_NOT_V22_CERTIFIED` is preserved: nothing here invents a canonical
endpoint, DTO, schema, RLS policy, permission, or ranking formula.

## A. Contract-blocked (needs a canonical V2.2 / founder decision)

| ID    | Capability                                              | Why blocked                                              | Interim behavior (safe)                                                    | Needs                          |
| ----- | ------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------ |
| CB-1  | Personalization / "For You" ranking                     | No approved ranking/matchmaking formula                  | Non-personalized demo list + visible DemoBadge "ikke personalisert (demo)" | V2.2 ranking contract          |
| CB-2  | Friends mode — friend activity/presence                 | No privacy/eligibility contract; no live friend location | Demo-marked eligible content only; never real friend location              | privacy + eligibility contract |
| CB-3  | Social-location privacy (freshness, anti-triangulation) | No contract                                              | No people-tracking built                                                   | privacy contract               |
| CB-4  | Real join / waitlist / attendance                       | No mutation contract                                     | Local demo state only; never fake success                                  | experiences/attendance API     |
| CB-5  | Real save / follow                                      | No persistence contract                                  | In-memory demo (`useMapSaved`); cleared on reload                          | saved-content API              |
| CB-6  | Real review submit                                      | No contract                                              | WriteReviewSheet is demo-only                                              | reviews API                    |
| CB-7  | Real chat entry                                         | No contract                                              | Entry points demo/guest-gated                                              | messaging contract             |
| CB-8  | Real search backend                                     | No contract                                              | Deterministic fixture search; no network, no history persistence           | search API                     |
| CB-9  | Real counts / social proof / availability               | No authoritative data                                    | Mock values flagged non-contract                                           | content API                    |
| CB-10 | Business claim/verification                             | No contract                                              | Demo state machine, GuestLock-gated                                        | business contract              |

## B. Native-verification-outstanding (needs Android/iOS dev build)

Expo Go and web use the `SoftMap` fallback + stubbed `@rnmapbox/maps`; the items
below cannot be proven in this environment. They are implemented against the
native API but marked unverified until a device build runs
(`EXPO_PUBLIC_USE_NATIVE_MAP=1`).

| ID   | Capability                      | Verify on device                                  |
| ---- | ------------------------------- | ------------------------------------------------- |
| NV-1 | Real Mapbox tile load           | tiles render with `pk.*` token                    |
| NV-2 | Native marker rendering         | category pins + selected highlight                |
| NV-3 | Native clustering (ShapeSource) | numeric clusters, zoom transitions                |
| NV-4 | Camera transitions / recenter   | smooth, no abrupt jumps                           |
| NV-5 | Native map gestures             | pan/pinch vs sheet/preview gesture handoff        |
| NV-6 | Real GPS (expo-location)        | permission prompt, precise/approximate, revoke    |
| NV-7 | Haptics (expo-haptics)          | marker/filter/mode/snap feedback, device support  |
| NV-8 | 60fps under load                | marker/camera stability on representative devices |

## C. Founder-approval-required (visual/product deviations)

| ID   | Item                                            | Note                                                     |
| ---- | ----------------------------------------------- | -------------------------------------------------------- |
| FA-1 | Provisional tokens/typography                   | `src/theme/*` marked provisional; system fonts temporary |
| FA-2 | For You / Friends mode presence                 | even demo-marked, confirm these modes should appear      |
| FA-3 | Mock vibe/time/price-NOK filter fields          | added to fixtures as non-contract; confirm UX bands      |
| FA-4 | Any deviation from `ThirdPlace_All_Screens.pdf` | documented per milestone with screenshots                |
