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

> **Phase 11 (founder decision 2026-11-06, ledger 0215):** every `DemoNote` / DEMO marker is removed app-wide; actions confirm in product voice (`confirmToast`). `DemoNote` entries in the Markers columns below are historical. `SignInPrompt` / `GuestLock` and `structure-only` (payments) still apply. Network/GPS states are switched from `thirdplace://_sandbox/simulate`.

## Tabs (exactly 5, locked)

| Surface                     | Route / entry                          | Main code                               | Status                                                      | Markers                                                                                                            | Blocked on (contract)                       | Verified        | Ledger                                 |
| --------------------------- | -------------------------------------- | --------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | --------------- | -------------------------------------- |
| Kart (Map)                  | `app/(tabs)/map.tsx`                   | `src/components/map/*`                  | demo-complete                                               | DemoNote, SignInPrompt, DEMO modes                                                                                 | see Map matrix                              | emulator, tests | ≤ 0083, 0108, 0161 (design system)     |
| Sveip (Swipe)               | `app/(tabs)/swipe.tsx`                 | `src/components/swipe/*`                | demo-complete; Filtre = the map's sheet and pipeline (0243) | DemoNote, SignInPrompt, join-chat sheet                                                                            | ranking/personalization, join, report/block | emulator, tests | 0104, 0110, 0120, 0162 (design system) |
| Legg til (Add) — center CTA | `app/(tabs)/add.tsx`                   | `src/features/add/AddWizard.tsx`        | demo-complete                                               | end states in product voice; Gruppe creates a group + group chat, a published experience joins the map (in memory) | publish, moderation, capacity/pricing       | emulator, tests | 0111, 0113, 0242                       |
| Chat                        | `app/(tabs)/chat.tsx`, `app/chat/[id]` | chat list + thread                      | demo-complete                                               | guests read-only; archived read-only                                                                               | chat types, access modes, delivery/receipts | emulator        | 0109, 0115, 0163 (design system)       |
| Profil                      | `app/(tabs)/profile.tsx`               | profile (PDF p12) + Lagret, Mine planer | demo-complete                                               | DemoBadge on counts + Veien til Skaper                                                                             | identity, follow graph, creator criteria    | emulator        | 0112, 0119                             |

## Nested routes (realigned to the PDF, 2026-11-05)

Directory routes with no PDF page (`experiences`, `places`, `groups`,
`businesses`, `creators`) and the Profile "Oppdag" hub were **removed**
(ledger 0112). Their detail content still lives in the map sheets.

| Surface       | Route / entry                                                          | PDF      | Status                           | Markers                                                                                                                                                                     | Ledger           |
| ------------- | ---------------------------------------------------------------------- | -------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Oppdag folk   | `app/people/index.tsx` (Profil → Venner), person `app/people/[id].tsx` | p22      | partial (no filter/invite)       | follow = DemoNote; guest SignInPrompt                                                                                                                                       | 0089, 0112, 0235 |
| Bli Skaper    | `app/become-creator.tsx`                                               | p14      | demo-complete                    | illustrative requirements, apply sends nothing; apply muted until all are met (PDF p14); "Du er nå Skaper!" is `app/creator-welcome.tsx`, reachable by deep link for review | 0118, 0174, 0181 |
| Marketplace   | `app/marketplace/index.tsx`                                            | p15–p16  | partial (list; detail is a page) | B2B; request/save DemoNote; guest SignInPrompt                                                                                                                              | 0118             |
| Notifications | `app/notifications.tsx` (map / chat / swipe bell)                      | p20      | demo-complete                    | DemoNote (no push/inbox); shared read state, bells drop (0208)                                                                                                              | 0117             |
| Settings      | `app/settings/index.tsx`                                               | p19–p20  | demo-complete                    | sub-screens are pages (0237)                                                                                                                                                | 0116             |
| Privacy       | `app/privacy.tsx`                                                      | p19, p21 | demo-complete                    | blocked/delete are pages, export a sheet (0237)                                                                                                                             | 0116             |
| Payments      | `app/payments.tsx`                                                     | p20      | demo-complete (structure-only)   | no input fields, no card data, no transactions                                                                                                                              | 0096, 0099       |

## Phase 3 routes (PDF screens, 2026-11-05)

| Surface                      | Route                            | PDF       | Status                         | Markers                          | Ledger     |
| ---------------------------- | -------------------------------- | --------- | ------------------------------ | -------------------------------- | ---------- |
| E-post-kode / identitet      | `app/(auth)/verify-code.tsx`     | p2        | demo-complete                  | any 6 digits pass; DemoNote      | 0122       |
| Lag nytt passord             | `app/(auth)/reset-password.tsx`  | p1        | demo-complete                  | nothing stored                   | 0122       |
| Totrinnsbekreftelse          | `app/two-factor.tsx`             | p2        | demo-complete                  | nothing enabled                  | 0122       |
| Bedriftsonboarding           | `app/business-onboarding.tsx`    | p3–p5     | demo-complete                  | 18+ gate; nothing created        | 0123, 0133 |
| Gruppe-sveip                 | `app/group-swipe.tsx`            | p8–p9     | demo-complete                  | simulated friends/votes, said so | 0124       |
| Systemskjermer               | `app/state/[kind].tsx`           | p26–p27   | demo-complete (deep link)      | review-only note                 | 0127       |
| Inviter venner / Belønninger | `app/invite.tsx`                 | p22       | demo-complete                  | rewards undefined                | 0128, 0133 |
| Aldersverifisering           | `app/age-verification.tsx`       | p22       | demo-complete                  | provider not connected           | 0128       |
| Bedriftsarbeidsflate         | `app/workspace/*`                | p13–p15   | demo-complete                  | EKSEMPELTALL; nothing billed     | 0129, 0133 |
| Kontobytte                   | `app/account-switch.tsx`         | p27       | demo-complete                  | navigation only                  | 0129, 0133 |
| Samarbeid                    | `app/collab/*`                   | p16–p18   | partial                        | nothing sent/signed              | 0130       |
| Utbetalinger                 | `app/payouts.tsx`                | p21       | demo-complete (structure-only) | no account data accepted         | 0132, 0133 |
| Innleveringer                | `app/submissions.tsx`            | p12       | demo-complete                  | example entries                  | 0132       |
| Lagret / Mine planer         | `app/saved.tsx`, `app/plans.tsx` | p14 / REQ | demo-complete                  | clears on reload                 | 0119       |

## Entry

| Surface    | Route                                               | Status        | Markers                              | Blocked on                           | Verified        | Ledger           |
| ---------- | --------------------------------------------------- | ------------- | ------------------------------------ | ------------------------------------ | --------------- | ---------------- |
| Welcome    | `app/(auth)/welcome.tsx`                            | demo-complete | guest entry sets demo guest mode     | auth                                 | emulator        | 0097             |
| Login      | `app/(auth)/login.tsx`                              | demo-complete | DemoNote "ingen reell innlogging"    | auth, session                        | emulator        | 0097             |
| Register   | `app/(auth)/register.tsx`                           | demo-complete | DemoNote "ingen konto opprettes"     | account creation                     | emulator        | 0097             |
| Onboarding | `app/onboarding.tsx`, `app/business-onboarding.tsx` | demo-complete | 18+ gate in both branches; DemoNotes | interests taxonomy, consent, persona | emulator, tests | 0114, 0123, 0133 |

## Cross-cutting

| Concern                     | Where                                        | Status   | Notes                                                                                                                                     | Ledger     |
| --------------------------- | -------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Brand logo / app icon       | `src/components/Logo.tsx`, `assets/`         | complete | SVG mark, provisional ember token                                                                                                         | 0084       |
| Imagery                     | `src/fixtures/images.ts` (Unsplash, bundled) | complete | per-place covers; none depict the named venues/people                                                                                     | 0099       |
| Honesty copy                | `src/copy/demo.ts` + `DemoNote`              | partial  | DemoNote text never repeats "Demo —"; many slice-specific notes stay inline                                                               | 0103, 0118 |
| Session-boundary navigation | `src/lib/navigation.ts` `resetTo`            | complete | back after logout/onboarding exits instead of returning to a signed-in screen                                                             | 0102       |
| Tab bar                     | `app/(tabs)/_layout.tsx`                     | complete | center CTA, filled-when-active icons                                                                                                      | 0101       |
| CI secret check             | `.github/workflows/ci.yml`                   | complete | anchored `sk.` grep (asset-hash false positive)                                                                                           | 0100       |
| Persistence of demo state   | in-memory stores                             | blocked  | saved/guest/recent searches, notification reads, experience joins and Nylig sett reset on reload — persistence is contract-blocked (CB-5) | —          |

## Known gaps (not done)

- **No backend anywhere.** Every action above is local demo state; making any
  surface real needs the V2.2 contract (`BLOCKED_NOT_V22_CERTIFIED`).
- **Copy centralization is partial** — UI strings are still inline per screen.
- **No automated UI tests** for gestures (sliders, swipe), location watchers or
  sheet push/back — verified on the emulator only.
- **Native verification outstanding** for real GPS/heading and haptics on a
  physical device (see `docs/map/MAP_BLOCKERS.md`, NV register).
- **iOS keyboard layouts unverified** — `KeyboardAvoidingView` padding (0201) was checked on Android only.
- **PDF screens still missing** — see the list at the end of `docs/SCREEN_INVENTORY.md`.

## Phase 6 review (2026-11-06)

| Surface                                             | Change                                                                    | Ledger                 |
| --------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| All stack routes (`Screen`)                         | Pads from seeded safe-area insets; status bar via `StatusBarStyle`        | 0172                   |
| Auth (welcome, login, register, forgot, verify)     | Demo notes rewritten; links ember via `Link asChild`                      | 0171, 0174             |
| Map                                                 | Weather pill badged as example; dusk/night basemap → light status icons   | 0172, 0174             |
| Swipe                                               | Dashes below the For deg pill, one DEMO badge, readable selected tab      | 0175, 0176             |
| Chat list / thread                                  | One avatar size; header badge removed; circled back                       | 0174, 0175, 0176       |
| Profile, Mine planer                                | Icons follow the experience; chips scroll; badge at row end               | 0175, 0176             |
| Settings, Betaling, Aldersverifisering              | One note each; perks marked as examples                                   | 0171                   |
| Marketplace, collab                                 | DemoNotes, chips scroll, defaults/contract state agree, fictional sponsor | 0173, 0174, 0175, 0176 |
| Workspace (hub, Kalender, Lokasjoner, Utbetalinger) | Calendar order, checklist per step, pill spacing, payouts note            | 0171, 0173, 0174, 0175 |
| System states                                       | Update button full ember with demo toast; state note rewritten            | 0171, 0174             |

## Phase 10 review (2026-11-06)

Feel, reaction, feedback, whole-screen and retention pass; report in `docs/reviews/FEEL_REVIEW_2026-11-06.md`.

| Surface                                           | Change                                                                                                                        | Ledger                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Sheet engine (all Modal sheets)                   | Cap below the status bar and scroll; keyboard padding; safe-area bottom                                                       | 0196, 0201                         |
| Chat thread                                       | Opens at the newest message, follows sends, pinned bar under the header, not-found way back                                   | 0197                               |
| Map detail                                        | Pinned join bar (PDF p6), focus param from Steder/Lagret/Mine planer, guest heart asks to sign in, tools on the measured peek | 0199, 0204, 0208                   |
| Map search                                        | Nylig sett (founder-approved)                                                                                                 | 0209                               |
| Filtre                                            | All sections mount with the sheet                                                                                             | 0212                               |
| Sveip                                             | Bar fits 360 dp, quicker glide, Steder fade, Vis på kartet opens the place                                                    | 0199, 0203, 0207                   |
| Add, onboarding, business onboarding              | Reason under a disabled Neste, keyboard-safe sticky footer, fresh faded step, Kalender Rediger pre-fill                       | 0198, 0199, 0201, 0202, 0207       |
| Gruppe-sveip                                      | Opens the experience chat on a match, pinned Start, one-line rows, saved deck + Lagre til senere                              | 0199, 0202, 0203, 0210             |
| Lagret / Mine planer                              | Rows open their detail, Angre after unsave, Sveip lagrede med venner, Til samtalen                                            | 0208, 0210, 0211                   |
| Profil                                            | Honest toast after Lagre, Neste plan card                                                                                     | 0200, 0211                         |
| Settings / Privacy                                | Plain rows instead of no-op chevrons, Avblokkér toggles, honest toasts                                                        | 0198, 0200                         |
| Notifications                                     | Shared read state across Kart, Sveip, Chat bells                                                                              | 0208                               |
| People, Marketplace, Mine listings, Innleveringer | Honesty marker, onward empty states, one-line tab rows                                                                        | 0203                               |
| Collab, workspace                                 | Reasons, ✓ Vurdert, contract haptic, chart follows its range                                                                  | 0198, 0199, 0205                   |
| Splash, map load, lobby                           | No fake waits                                                                                                                 | 0206                               |
| UI primitives                                     | Label chips, readable disabled Button, StickyFooter, ScrollRow, FadeSwap, toast action, 34 presses to the ui Pressable        | 0198, 0202, 0203, 0205, 0207, 0208 |

## Phase 11 (2026-11-06)

Founder list: no demo markers, white background, ≥2 photos, marker icons, video-style experience page, loading rule, user puck + locate, R27–R30. Report: `docs/reviews/APP_REVIEW_2026-11-06.md` §11.

| Surface                                                  | Change                                                                                             | Ledger           |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| All routes                                               | Demo markers removed; product-voice confirmations (`confirmToast`); white light background         | 0215, 0219, 0216 |
| Map / place, business, group, listing                    | Photo galleries (≥2 photos each); marker glyphs; user puck; Posisjon flies in at zoom 15           | 0217, 0218, 0223 |
| Map experience detail (p6)                               | Shared ExperiencePage in a root-portal sheet 35/60/100 %; top snap = full-screen page; back → 60 % | 0221             |
| Sveip expanded detail (p8)                               | Same page in an Overlay with page top bar and floating join card; sub-views in a sheet             | 0220             |
| Map loading                                              | Skeleton under 2 s, loader after                                                                   | 0222             |
| Sveip deck                                               | Taps during the glide queued; tab pre-rendered after the map loads                                 | 0224             |
| Betalingsstatus (p18), Bli Skaper (p14), Workspace (p13) | PDF p18 structure (money as "—"); next-step links                                                  | 0224             |
| `_sandbox/simulate` (dev only)                           | Map offline + check-in distance switches (moved out of product UI)                                 | 0215             |

## Phase 12 pages (2026-11-07)

Founder decision 2026-11-06: content you read, browse or fill in is a page, not a sheet.

| Surface                         | Route                                                                                        | Opened from                                                                                      | Status                                                      | Ledger     |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------- |
| Experience page                 | `app/experience/[id]/index.tsx`                                                              | Sveip expand, Lagret, Mine planer, Profil "Neste plan", chat pin, "Flere opplevelser", deep link | demo-complete                                               | 0235       |
| Place page                      | `app/place/[id]/index.tsx`                                                                   | experience page, Lagret, deep link                                                               | demo-complete; video layout like the experience page (0245) | 0235, 0245 |
| Group page                      | `app/group/[id]/index.tsx`                                                                   | experience page, deep link                                                                       | demo-complete                                               | 0235       |
| Person page                     | `app/people/[id].tsx`                                                                        | Oppdag folk                                                                                      | demo-complete; follow shared in memory                      | 0235       |
| Chat info / Medlemmer / Inviter | `app/chat/[id]/info.tsx`, `members.tsx`, `invite.tsx`                                        | chat thread ⓘ, info page                                                                         | demo-complete; actions confirm in product voice             | 0236       |
| Arkiverte chatter / Ny chat     | `app/chat/archived.tsx`, `app/chat/new.tsx`                                                  | Chat tab link / ✎ button                                                                         | demo-complete                                               | 0236       |
| Settings sub-pages              | `app/settings/{account,linked,notifications,language,accessibility,help,blocked,delete}.tsx` | Innstillinger, Personvern                                                                        | demo-complete; local toggles, nothing stored                | 0237       |
| Rediger profil                  | `app/profile/edit.tsx`                                                                       | Profil                                                                                           | demo-complete                                               | 0237       |
| Marketplace listing             | `app/marketplace/[id].tsx`                                                                   | Marketplace cards                                                                                | demo-complete; Lagre local                                  | 0238       |
| Listing editor                  | `app/my-listings/new.tsx`, `app/my-listings/[id]/edit.tsx`                                   | Mine listings                                                                                    | demo-complete; nothing published                            | 0238       |
| Collab offer / contract         | `app/collab/offer.tsx`, `app/collab/contract.tsx`                                            | Samarbeid                                                                                        | partial; nothing sent or signed                             | 0238       |
| Varsler                         | `app/notifications.tsx`                                                                      | map, chat and Sveip bells                                                                        | demo-complete; shared read state                            | 0240       |
| Søk                             | `app/search.tsx`                                                                             | map search pill                                                                                  | demo-complete; fixture search, results back to the map      | 0240       |
| Skriv anmeldelse                | `app/review/[kind]/[id].tsx`                                                                 | place reviews                                                                                    | demo-complete; nothing stored                               | 0240       |
