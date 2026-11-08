# Map Surface — Blocker & Native-Verification Registers

Companion to [MAP_GAP_MATRIX.md](MAP_GAP_MATRIX.md). Tracks what cannot be safely
completed as frontend demo work and what needs a real device build to verify.
`BLOCKED_NOT_V22_CERTIFIED` is preserved: nothing here invents a canonical
endpoint, DTO, schema, RLS policy, permission, or ranking formula.

## A. Contract-blocked (needs a canonical V2.2 / founder decision)

| ID    | Capability                                              | Why blocked                                              | Interim behavior (safe)                                                                        | Needs                          |
| ----- | ------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| CB-1  | Personalization / "For You" ranking                     | No approved ranking/matchmaking formula                  | Non-personalized list, same for everyone; no personalization claimed (markers removed in 0215) | V2.2 ranking contract          |
| CB-2  | Friends mode — friend activity/presence                 | No privacy/eligibility contract; no live friend location | Eligible fixture content only; never real friend location                                      | privacy + eligibility contract |
| CB-3  | Social-location privacy (freshness, anti-triangulation) | No contract                                              | No people-tracking built                                                                       | privacy contract               |
| CB-4  | Real join / waitlist / attendance                       | No mutation contract                                     | Local demo state only; never fake success                                                      | experiences/attendance API     |
| CB-5  | Real save / follow                                      | No persistence contract                                  | In-memory demo (`useMapSaved`); cleared on reload                                              | saved-content API              |
| CB-6  | Real review submit                                      | No contract                                              | `/review/[kind]/[id]` page confirms locally; nothing is sent (0240)                            | reviews API                    |
| CB-7  | Real chat entry                                         | No contract                                              | Entry points demo/guest-gated                                                                  | messaging contract             |
| CB-8  | Real search backend                                     | No contract                                              | Deterministic fixture search; no network, no history persistence                               | search API                     |
| CB-9  | Real counts / social proof / availability               | No authoritative data                                    | Mock values flagged non-contract                                                               | content API                    |
| CB-10 | Business claim/verification                             | No contract                                              | Demo state machine, GuestLock-gated                                                            | business contract              |

## B. Native-verification-outstanding (needs Android/iOS dev build)

Expo Go and web use the `SoftMap` fallback + stubbed `@rnmapbox/maps`; the items
below cannot be proven in this environment. They are implemented against the
native API but marked unverified until a device build runs
(`EXPO_PUBLIC_USE_NATIVE_MAP=1`).

| ID   | Capability                      | Status                                                                                                                                                                               |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NV-1 | Real Mapbox tile load           | ✅ verified on Android emulator (dev build + Metro)                                                                                                                                  |
| NV-2 | Native marker rendering         | ✅ category pins + selected ring verified on emulator                                                                                                                                |
| NV-3 | Native clustering (ShapeSource) | ✅ verified on the emulator: overlapping pins cluster at the fitted city zoom and split when zooming in (0231)                                                                       |
| NV-4 | Camera transitions / recenter   | ✅ verified on the emulator: the first view fits every pin (0231); Posisjon flies to the user (0223)                                                                                 |
| NV-5 | Native map gestures             | pending (pan/pinch vs sheet/preview handoff)                                                                                                                                         |
| NV-6 | Real GPS (expo-location)        | in the dev build since 0227/0229; the emulator's GPS (geo fix) drives Posisjon (0223). Not checked on a real phone                                                                   |
| NV-7 | Haptics (expo-haptics)          | in the dev build since 0227/0229; since 0322 only on drag gestures (Sveip's commit line, chat swipe-to-reply), taps are silent (founder 2026-11-09); how it feels needs a real phone |
| NV-8 | 60fps under load                | pending                                                                                                                                                                              |

> The dev client was rebuilt in 0227/0229 with expo-location and expo-haptics.
> Both still load lazily and guarded, so a build without them degrades instead
> of crashing.

## C. Founder-approval-required (visual/product deviations)

| ID   | Item                                            | Note                                                                                                                                             |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| FA-1 | Provisional tokens/typography                   | Palette (Airbnb, 0227) and DM Sans (2026-11-05) are founder decisions; type sizes and motion values are still marked provisional in `src/theme/` |
| FA-2 | For You / Friends mode presence                 | non-personalized shells without markers (0215); confirm these modes should appear                                                                |
| FA-3 | Mock vibe/time/price-NOK filter fields          | added to fixtures as non-contract; confirm UX bands                                                                                              |
| FA-4 | Any deviation from `ThirdPlace_All_Screens.pdf` | documented per milestone with screenshots                                                                                                        |
| FA-5 | Phase 10 additions without a PDF slot           | Nylig sett, group swipe from Lagret, Lagre til senere, Til samtalen, Neste plan — approved 2026-11-06 (SCREEN_INVENTORY)                         |
