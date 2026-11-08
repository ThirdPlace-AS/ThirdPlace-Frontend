# ThirdPlace — Design System Research & Proposals

**Reference date:** 2026-10-24 · **Status:** RESEARCH + PROPOSALS — **nothing here is approved or applied.**
**Governance:** `BLOCKED_NOT_V22_CERTIFIED` preserved. No code, token, icon, dependency, API, DB, RLS or permission change is made by this work. Every proposal waits for founder approval in [12-contract-founder-approval.md](12-contract-founder-approval.md).

## Deliverables

| #   | Document                                                           | Purpose                                                                   |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 1   | [01-airbnb-audit.md](01-airbnb-audit.md)                           | Airbnb design and branding audit (2025 redesign → May 2026 → Sep 2026)    |
| 2   | [02-dimensional-iconography.md](02-dimensional-iconography.md)     | Airbnb dimensional icon analysis + ThirdPlace icon-family recommendations |
| 3   | [03-tinder-swipe-audit.md](03-tinder-swipe-audit.md)               | Tinder 2026 swipe interaction audit                                       |
| 4   | [04-gap-analysis.md](04-gap-analysis.md)                           | ThirdPlace today vs the references                                        |
| 5   | [05-brand-recommendations.md](05-brand-recommendations.md)         | Original ThirdPlace brand recommendations                                 |
| 6   | [06-icon-inventory.md](06-icon-inventory.md)                       | Every icon in the app, with approval status                               |
| 7   | [07-tokens-and-components.md](07-tokens-and-components.md)         | Proposed design tokens and component specs                                |
| 8   | [08-screen-ux.md](08-screen-ux.md)                                 | Navigation, Map, Swipe, Add, Chat, Profile recommendations                |
| 9   | [09-prototypes-and-motion.md](09-prototypes-and-motion.md)         | Motion specifications + link to the interactive prototype                 |
| 10  | [10-assets-and-performance.md](10-assets-and-performance.md)       | Asset production pipeline and performance budgets                         |
| 11  | [11-a11y-acceptance.md](11-a11y-acceptance.md)                     | Accessibility and cross-platform acceptance criteria                      |
| 12  | [12-contract-founder-approval.md](12-contract-founder-approval.md) | Contract compatibility + founder decision checklist                       |

## Evidence rules

Research used **public sources only** (official newsrooms, agency case studies, press, platform docs). No private app sessions, no decompiled code, no screen recordings were used, so **no frame-level timing of Airbnb or Tinder was measured**. Every factual claim carries one tag:

| Tag          | Meaning                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| `OBSERVED`   | Stated in a primary source (the company's own newsroom, the design agency's own case study, platform docs) |
| `REPORTED`   | Stated by press or a third party; not confirmed by the company                                             |
| `HYPOTHESIS` | Our inference about how something is built or behaves; unverified                                          |
| `PROPOSAL`   | Our recommendation for ThirdPlace                                                                          |

Where a fact needs frame-accurate measurement (e.g. Tinder's swipe threshold), the docs say so and give a ThirdPlace value instead of pretending to know theirs.

## Sources

| ID  | Source                                                                                                                                                                                       | Date           | Type                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------- |
| S1  | [Airbnb — 2025 Summer Release](https://news.airbnb.com/airbnb-2025-summer-release)                                                                                                           | 13 May 2025    | Primary (read)                  |
| S2  | [Airbnb — 2026 Summer Release](https://news.airbnb.com/airbnb-2026-summer-release)                                                                                                           | 20 May 2026    | Primary (read)                  |
| S3  | [heise — Airbnb Autumn Update: AI Search, Social Features and More](https://www.heise.de/en/news/Airbnb-Autumn-Update-AI-Search-Social-Features-and-More-11471540.html)                      | 30 Sep 2026    | Press (read)                    |
| S4  | [Matador — Airbnb fall release 2026](https://matadornetwork.com/read/airbnb-fall-release-2026/)                                                                                              | ~30 Sep 2026   | Press (search summary)          |
| S5  | [Upgraded Points — Airbnb Fall 2026 update](https://upgradedpoints.com/news/airbnb-fall-2026-updates/)                                                                                       | ~Oct 2026      | Press (search summary)          |
| S6  | [TechCrunch — Tinder Sparks 2026](https://techcrunch.com/2026/03/12/tinder-tries-to-lure-people-back-to-online-dating-with-irl-events-virtual-speed-dating/)                                 | 12 Mar 2026    | Press (read)                    |
| S7  | [Tinder Press Room — Tinder Sparks 2026](https://www.tinderpressroom.com/2026-03-12-Tinder-Debuts-Inaugural-Product-Keynote-Tinder-Sparks-2026-Start-Something-New)                          | 12 Mar 2026    | Primary (search summary)        |
| S8  | [Porto Rocha — Tinder case study](https://www.portorocha.com/tinder)                                                                                                                         | undated (2026) | Primary, agency (read)          |
| S9  | [It's Nice That — Porto Rocha's Tinder rebrand](https://www.itsnicethat.com/features/porto-rocha-tinder-rebrand-graphic-design-spotlight-140726)                                             | 14 Jul 2026    | Press (read)                    |
| S10 | [Indian Television — Tinder rebrand](https://indiantelevision.com/iworld/tinder-unveils-first-major-rebrand-in-nearly-a-decade/)                                                             | ~17 Jul 2026   | Press (search summary)          |
| S11 | [Richard Rolfs — Airbnb 2025 Lava icons](https://www.richardrolfs.com/resources/airbnb-2025-lava-icons)                                                                                      | 2025           | Third-party commentary (read)   |
| S12 | [Codelevate — How to create Airbnb "Lava" style icons](https://www.codelevate.com/blog/how-to-create-airbnb-lava-style-icons---step-by-step-guide-2025)                                      | 2025           | Third-party how-to (read)       |
| S13 | [Medium — Airbnb's new "Lava" icon format](https://medium.com/@waldobear002/airbnbs-new-lava-icon-format-a-technical-deep-dive-b2604626c7e0)                                                 | 2025           | Third-party (403; snippet only) |
| S14 | [Expo — GlassEffect docs](https://docs.expo.dev/versions/latest/sdk/glass-effect/)                                                                                                           | current        | Platform docs (search summary)  |
| S15 | [heise — iOS 26 Reduce Transparency for Liquid Glass](https://heise.de/-10445465), [Six Colors](https://sixcolors.com/post/2025/11/soaping-up-liquid-glass-less-transparency-more-contrast/) | 2025           | Press (search summary)          |
| S16 | [9to5Google — Material 3 Expressive](https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/)                                                                           | 13 May 2025    | Press (search summary)          |
| S17 | Community Airbnb token reconstructions (e.g. [refero.design](https://styles.refero.design/style/194faa2f-2f69-4bbf-9e29-290f28fa8ca2))                                                       | various        | Third-party, **low confidence** |
| S18 | [SD Times — Lottie open-sourced by Airbnb](https://sdtimes.com/sd-times-github-project-week-lottie/)                                                                                         | 2017           | Press (search summary)          |
| S19 | [Domus — Airbnb experience app design](https://www.domusweb.it/en/news/gallery/2025/05/16/airbnb-experience-app-design.html)                                                                 | 16 May 2025    | Press (403; snippet only)       |

## Known gaps

- No first-hand observation of the live Airbnb or Tinder apps (founder chose public sources only). Visual measurements are therefore `HYPOTHESIS`. Supplying your own screen recordings would let us measure timings and sizes frame by frame.
- Airbnb publishes no design-system documentation; numeric values for Airbnb (S17) are community reconstructions and are not relied on.
- Airbnb has not published technical details of its "Lava" icon format; everything about it is third-party (S11–S13).
- Regional availability: Airbnb's Connections/Travel Map and AI search have no published Norway rollout date (S2, S3).
