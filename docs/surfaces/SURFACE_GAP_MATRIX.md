# §5.2 Frontend Surfaces — Gap & Traceability Matrix

Source: master spec §5.2 (frontend source architecture — **not new contract**).
This matrix traces every §5.2 surface built on `feat/frontend-complete-s5.2` to
its route, its honesty markers, what blocks it from becoming real, and how it
was verified. The Map tab has its own, deeper matrix:
[docs/map/MAP_GAP_MATRIX.md](../map/MAP_GAP_MATRIX.md).

Global disposition: **`BLOCKED_NOT_V22_CERTIFIED`**. Every surface below is a
fixtures-only shell (`src/fixtures/index.ts`, `Mock*` types,
`BLOCKED_CONTRACT_GAP`). No API, DTO, table, entitlement, ranking or payment
rule was invented.

**Status** — `demo-complete` (full UI + states on fixtures, honest markers),
`partial`, `missing`.
**Verified** — `emulator` (Android native dev build, Metro :8090),
`tests` (jest), `review` (code-review pass over `main...HEAD`).
**Markers** — `DemoNote` (DEMO badge + line, copy from `@/copy`),
`SignInPrompt` / `GuestLock` (account-gated for guests), `structure-only`.

## Tabs (exactly 5, locked)

| Surface                     | Route / entry                          | Main code                         | Status        | Markers                            | Blocked on (contract)                       | Verified        | Ledger       |
| --------------------------- | -------------------------------------- | --------------------------------- | ------------- | ---------------------------------- | ------------------------------------------- | --------------- | ------------ |
| Kart (Map)                  | `app/(tabs)/map.tsx`                   | `src/components/map/*`            | demo-complete | DemoNote, SignInPrompt, DEMO modes | see Map matrix                              | emulator, tests | ≤ 0083       |
| Sveip (Swipe)               | `app/(tabs)/swipe.tsx`                 | `src/components/swipe/*`          | demo-complete | DemoNote, SignInPrompt             | ranking/personalization, join, report/block | emulator, tests | ≤ 0083, 0104 |
| Legg til (Add) — center CTA | `app/(tabs)/add.tsx`                   | `src/features/add/AddWizard.tsx`  | demo-complete | "Demo — ikke publisert" end state  | publish, moderation, capacity/pricing       | emulator        | 0085, 0101   |
| Chat                        | `app/(tabs)/chat.tsx`, `app/chat/[id]` | chat list + thread                | demo-complete | composer does not send (demo line) | chat types, access modes, delivery/receipts | emulator        | 0086         |
| Profil                      | `app/(tabs)/profile.tsx`               | profile + Oppdag hub (7 surfaces) | demo-complete | DemoNote, "Verifisert nabo · DEMO" | identity/verification, stats, achievements  | emulator        | 0087–0088    |

## Nested routes (realigned to the PDF, 2026-11-05)

Directory routes with no PDF page (`experiences`, `places`, `groups`,
`businesses`, `creators`) and the Profile "Oppdag" hub were **removed**
(ledger 0112). Their detail content still lives in the map sheets.

| Surface       | Route / entry                      | PDF      | Status                         | Markers                                        | Ledger     |
| ------------- | ---------------------------------- | -------- | ------------------------------ | ---------------------------------------------- | ---------- |
| Oppdag folk   | `app/people.tsx` (Profil → Venner) | p22      | partial (no filter/invite)     | follow = DemoNote; guest SignInPrompt          | 0089, 0112 |
| Bli Skaper    | `app/become-creator.tsx`           | p14      | demo-complete                  | illustrative requirements, apply sends nothing | 0118       |
| Marketplace   | `app/marketplace.tsx`              | p15–p16  | partial (list + detail only)   | B2B; request/save DemoNote; guest SignInPrompt | 0118       |
| Notifications | map / chat / swipe bell            | p20      | demo-complete                  | DemoNote (no push/inbox)                       | 0117       |
| Settings      | `app/settings.tsx`                 | p19–p20  | demo-complete                  | every sheet DemoNote                           | 0116       |
| Privacy       | `app/privacy.tsx`                  | p19, p21 | demo-complete                  | blocked/export/delete DemoNote                 | 0116       |
| Payments      | `app/payments.tsx`                 | p20      | demo-complete (structure-only) | no input fields, no card data, no transactions | 0096, 0099 |

## Entry

| Surface    | Route                     | Status        | Markers                                        | Blocked on                           | Verified | Ledger     |
| ---------- | ------------------------- | ------------- | ---------------------------------------------- | ------------------------------------ | -------- | ---------- |
| Welcome    | `app/(auth)/welcome.tsx`  | demo-complete | guest entry sets demo guest mode               | auth                                 | emulator | 0097       |
| Login      | `app/(auth)/login.tsx`    | demo-complete | DemoNote "ingen reell innlogging"              | auth, session                        | emulator | 0097       |
| Register   | `app/(auth)/register.tsx` | demo-complete | DemoNote "ingen konto opprettes"               | account creation                     | emulator | 0097       |
| Onboarding | `app/onboarding.tsx`      | demo-complete | DemoNote per step (location, persona, account) | interests taxonomy, consent, persona | emulator | 0097, 0102 |

## Cross-cutting

| Concern                     | Where                                        | Status   | Notes                                                                                | Ledger |
| --------------------------- | -------------------------------------------- | -------- | ------------------------------------------------------------------------------------ | ------ |
| Brand logo / app icon       | `src/components/Logo.tsx`, `assets/`         | complete | SVG mark, provisional ember token                                                    | 0084   |
| Imagery                     | `src/fixtures/images.ts` (Unsplash, bundled) | complete | per-place covers; none depict the named venues/people                                | 0099   |
| Honesty copy                | `src/copy/demo.ts` + `DemoNote`              | partial  | 13 rows migrated; 13 inline "Demo —" strings with other markup remain (see 0103)     | 0103   |
| Session-boundary navigation | `src/lib/navigation.ts` `resetTo`            | complete | back after logout/onboarding exits instead of returning to a signed-in screen        | 0102   |
| Tab bar                     | `app/(tabs)/_layout.tsx`                     | complete | center CTA, filled-when-active icons                                                 | 0101   |
| CI secret check             | `.github/workflows/ci.yml`                   | complete | anchored `sk.` grep (asset-hash false positive)                                      | 0100   |
| Persistence of demo state   | in-memory stores                             | blocked  | saved/guest/recent searches reset on reload — persistence is contract-blocked (CB-5) | —      |

## Known gaps (not done)

- **No backend anywhere.** Every action above is local demo state; making any
  surface real needs the V2.2 contract (`BLOCKED_NOT_V22_CERTIFIED`).
- **Copy centralization is partial** — non-demo UI strings are still inline;
  13 demo strings with non-standard markup are not yet in `@/copy`.
- **Businesses list** still uses one cover per category (no per-business photo).
- **No automated UI tests** for gestures (sliders, swipe), location watchers or
  sheet push/back — verified on the emulator only.
- **Native verification outstanding** for real GPS/heading and haptics on a
  physical device (see `docs/map/MAP_BLOCKERS.md`, NV register).
- **expo-doctor patch drift** (expo, expo-location, expo-router) — handled as a
  separate, revertable slice.
