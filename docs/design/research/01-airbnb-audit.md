# 01 — Airbnb Design & Branding Audit

Reference date 2026-10-24. Tags and sources: see [README](README.md).

## 1. Release timeline

| Milestone                             | Date        | What changed (design-relevant)                                                                                                                                                                                                                        | Tag / source       |
| ------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **2025 Summer Release** (app rebuilt) | 13 May 2025 | App "rebuilt from the ground up" on a "new tech stack"; "reimagined nearly every part of the app"; design described as a "dimensional and beautifully animated interface". Tabs Explore / Trips / Messages / Profile; Homes / Experiences / Services. | `OBSERVED` S1      |
| 2025 dimensional icons                | May 2025    | New 3D-rendered, animated icons; delivered in a format called "Lava" (not public).                                                                                                                                                                    | `REPORTED` S11–S13 |
| **2026 Summer Release**               | 20 May 2026 | Services added (groceries, airport pickup, luggage, car rental), boutique hotels, AI review highlights, AI support assistant with "interactive cards" in chat, new map in Trips tab, **new homepage "rolling out later this summer"**.                | `OBSERVED` S2      |
| **Autumn Update 2026**                | 30 Sep 2026 | AI search bar (free text + voice) alongside classic search; keyword-to-filter suggestions; AI listing summaries; wishlist side-by-side comparison; **Connections + interactive Travel Map** showing where friends stayed; host Multi-Calendar.        | `REPORTED` S3–S5   |

The brief's "September 2026 Autumn Update" is confirmed by press dated 30 Sep 2026 (S3). The Airbnb newsroom page for it was not retrieved, so autumn features stay `REPORTED`.

**What is verified vs older design.** The 2025 rebuild is the current visual foundation (S1). The 2026 releases add surfaces (services, hotels, AI, social map) on that foundation; no source describes a new visual language in 2026 (S2, S3). The 2026 homepage redesign is announced but no source describes its look (S2).

## 2. Audit by area

Values below are not published by Airbnb. Where they come from community reconstruction (S17) they are marked low-confidence and **not used** as ThirdPlace inputs.

### Typography, hierarchy, readability

- Custom typeface, Airbnb Cereal (variable). `REPORTED` S17. Proprietary — **must not be used or imitated by ThirdPlace.**
- Hierarchy is carried by weight and size, not colour; titles are short and set large; body text is generous in line height. `HYPOTHESIS` (common reconstruction, S17).
- **Lesson for ThirdPlace:** one well-hinted UI family, weight-led hierarchy, and a tight scale (≤7 sizes). ThirdPlace already has the scale (`src/theme/typography.ts`) but no line-height or tracking tokens.

### Colour and semantic colour

- One saturated brand colour used sparingly (primary CTA, favourite heart, active states); everything else neutral greys and photography. `REPORTED` S17.
- **Lesson:** ThirdPlace's existing rule — Ember only for CTAs, favourite, badges, logo; ink for selection/confirm — already matches this discipline. Keep it.

### White space, density, grid

- Content-first layouts with large photography and wide margins; density rises only in lists (search results, messages). `HYPOTHESIS`.
- **Lesson:** a 4-pt base grid with a 16-pt gutter (ThirdPlace has this) and 24/32 section spacing (ThirdPlace lacks 32).

### Surfaces, shadows, lighting, elevation

- Depth comes mainly from photography, rounded corners and very soft layered shadows rather than borders. `REPORTED` S17.
- 2025 redesign introduced "dimensional" visuals — the 3D icons are the main expression; surfaces themselves stay flat-white. `OBSERVED` S1 (the word "dimensional"), `HYPOTHESIS` (where it is applied).
- **Lesson:** ThirdPlace has **no elevation tokens** (shadows are inline in three files). Adopt a 4-level elevation scale (see [07](07-tokens-and-components.md)).

### Cards and photo galleries

- Listing cards: full-width photo with rounded corners, swipeable photo carousel with dot indicator, favourite heart overlaid top-right, text below the photo (not overlaid). `HYPOTHESIS` (long-standing public pattern).
- AI review highlights and AI-generated home summaries now appear inside detail and comparison views. `OBSERVED` S2.

### Filters and search

- Search is a pill entry that expands into a full-screen, step-based flow (where → when → who). `HYPOTHESIS` (long-standing public pattern).
- Autumn 2026: natural-language and voice search **next to** the classic search; typing a keyword ("baby") surfaces matching filters. `REPORTED` S3, S5.
- **Lesson:** ThirdPlace already has a step-based "Hvor/Når/Hvem"-style filter sheet. Keyword-to-filter suggestion is a cheap, honest pattern that needs no AI and no backend (pure fixture matching) — candidate for a later slice.

### Navigation, floating actions, bottom sheets, maps

- Bottom tab bar of 4–5 destinations (Explore, Wishlists, Trips, Messages, Profile). `OBSERVED` S1 (tab names).
- Top category switch Homes / Experiences / Services. `OBSERVED` S1.
- Map + list split with a draggable bottom sheet over the map; floating "Map/List" toggle. `HYPOTHESIS`.
- 2026: map in the Trips tab showing bookings plus nearby places with travel time; social Travel Map of friends' trips. `OBSERVED` S2, `REPORTED` S3.
- **Lesson:** ThirdPlace's Map already uses the map + bottom-sheet pattern with in-sheet navigation. Airbnb's social map shows that "friends on a map" must have per-trip visibility controls (S3: each user chooses which trips appear and how much detail). Directly relevant to ThirdPlace's "Venner" mode — which is contract-blocked and must stay a demo shell.

### Profiles and trust signals

- 2025 profile shows where a guest has travelled and people they've met; identity verification count is a trust anchor. `OBSERVED` S1.
- 2026 Connections let you see friends' trips and reviews. `OBSERVED` S2.
- **Lesson:** trust UI = verification badge + history + mutual connections. For ThirdPlace these would be **real social proof** — forbidden to invent while the contract is blocked. Design the slots now, fill with `DemoBadge`-marked fixtures.

### Micro-interactions, transitions, feedback

- Animated icons play on selection; shared-element style transitions from card to detail. `REPORTED` (S1 "beautifully animated"; specifics not published).
- **Lesson:** reserve rich motion for moments of meaning (select, save, join) and keep everything else quick (150–220 ms).

### Accessibility and platform adaptation

- No public Airbnb accessibility spec was found for the 2025/2026 app. `GAP`.
- Platform context: iOS 26 Liquid Glass with Reduce Transparency / Increase Contrast settings (S15); Android Material 3 Expressive with spring-based motion (S16). Airbnb's adaptation to these is not documented.

## 3. What ThirdPlace should take — principles, not assets

1. **Restraint with one brand colour.** Already ThirdPlace's rule; keep.
2. **Dimensional moments, flat surfaces.** Depth in icons and photography; UI chrome stays calm.
3. **Motion with meaning.** Animate state changes users care about; everything else is fast.
4. **One coherent tab model.** ThirdPlace's 5 tabs are already approved — don't add tabs.
5. **Trust as a designed slot.** Build places for verification and social context now; fill only with honest demo data until the contract allows real data.

## 4. Must not copy

Airbnb logo/Bélo, Airbnb Cereal, Rausch or any Airbnb brand colour, the 3D icon artwork, the Lava format, illustrations, photography, or page layouts copied pixel-for-pixel.
