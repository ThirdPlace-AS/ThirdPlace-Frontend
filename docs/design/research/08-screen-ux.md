# 08 — Navigation, Map, Swipe, Add, Chat & Profile UX Recommendations

Reference date 2026-10-24. All `PROPOSAL`. Each item is tagged **[safe]** (visual/interaction only, fixtures OK) or **[contract]** (needs V2.2 contract before it can be real — design the slot, keep it demo-honest). Nothing here adds a tab, route or backend call.

## Navigation

- Keep the **approved 5 tabs** (Kart, Sveip, Legg til, Chat, Profil). No new tabs. **[safe]**
- Restyle tab glyphs to the T1 family with outline → filled and a `spark` settle on change. **[safe]**
- "Legg til" (add) stays a normal tab, not a raised FAB — a raised centre button implies a primary creation flow the contract hasn't defined. **[safe]**
- Detail stays in sheets, not routes (current architecture). **[safe]**

## Map (Kart)

- Floating controls (search, filter, layers, locate, notifications) → `GlassButton` with `e2`; group top controls into one glass capsule to reduce clutter. **[safe]**
- Pins per the `MapPin` spec: categorical palette, white ring, glyph inside, title below. Ember only for the selected ring/preview CTA. **[safe]**
- Keyword-to-filter suggestions in search (typing "barn" suggests the "Barn" audience chip) — pure fixture matching, inspired by Airbnb's autumn 2026 search (S3). **[safe]**
- "Venner"/Friends mode: Airbnb's Travel Map gives each user control over which trips are visible (S3). ThirdPlace's equivalent must design a visible privacy control from the start. Stays a non-personalised demo shell. **[contract]**
- Preview card → detail sheet: shared-element feel by animating the preview's image into the sheet header (Reanimated layout transition). **[safe]**

## Swipe (Sveip)

- Rebuild to the spec in [03 §5](03-tinder-swipe-audit.md): full-bleed card, 3-card stack, velocity commit, clamped swing rotation, haptics, one-level "Angre". **[safe]** (all local demo state)
- Info tap opens the existing detail `Sheet`. **[safe]**
- Keep "BLI MED" / "HOPP OVER" semantics and `DemoBadge`. No super-like, no match celebration with people. **[safe]**
- What "Bli med" means for open / approval / invite-only experiences (direct join vs request) is product logic → the card shows the **label** only from fixtures; no behaviour. **[contract]**
- Empty state: T2 object + «Tomt for nå» + «Start på nytt» (existing copy). **[safe]**

## Add (Legg til)

- One-decision-per-screen creation wizard with a progress bar in Ember, large T2 category objects for type selection, live preview card at the end. **[safe]** as UI shell.
- Publishing, moderation, pricing, capacity rules and business vs creator permissions are all **[contract]**; the final step must end in a `DemoBadge`-marked "Demo — ikke publisert" state, never a fake success.

## Chat

- Conversation list: avatar/experience thumbnail, title, last message, time; unread = Ember dot (current Ember rule). **[safe]**
- Group chats tied to an experience show the experience card pinned at the top of the thread. **[safe]** visually.
- Message actions via long-press menu (`e4`), swipe-to-archive using `SwipeableRow` (switch its hard-coded radius 12 to the `md` token). **[safe]**
- Chat types, access modes, join lifecycle, real-time delivery, read receipts: **[contract]**.

## Profile

- Header: avatar, name, home area, short bio; trust slot (verification badge) with `DemoBadge` until verification exists. **[contract]** for real data, **[safe]** for layout.
- "Steder jeg har vært" — a mini map / grid of visited places (inspired by Airbnb's 2025 profile showing where you've travelled, S1). Fixture-only. **[contract]** for real history.
- Achievements shelf using T2 hero objects, locked states visible. Earning rules **[contract]**.
- Persona switch (Explorer / Creator / Business) shown as a segmented control only if the contract defines multiple personas per account; until then, no switch. **[contract]**

## Cross-cutting

- Dark mode once tokens land. **[safe]**
- Branded empty/system states with T2 objects. **[safe]**
- Every demo action ends in a visibly demo state (existing honesty rule). **[safe]**
