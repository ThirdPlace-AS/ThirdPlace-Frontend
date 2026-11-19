# ThirdPlace

A connective layer for the physical world.

Fresh start — 2026-10-12.

---

## Frontend

Expo + React Native mobile client (Norwegian UI). It renders the full app from
the design PDF on **mock fixtures**: no product surface is wired to an API yet.
The public API contract is `BLOCKED_CONTRACT_GAP` and the product contract
`BLOCKED_NOT_V22_CERTIFIED` until the authoritative V2.2 specification is
imported and founder-approved.

What is built:

- Five tabs: Kart (Mapbox map of places and experiences across Oslo and
  Akershus, with browse and detail sheets, Filtre and search), Sveip (swipe
  deck), Legg til, Chat and Profil.
- Pages for places, experiences, groups and people; onboarding and sign-up;
  settings; a workspace for businesses and creators; marketplace and collabs.
- A catalogue of 84 interests with a business, organisation, city space,
  experience, event and group for each (`docs/fixtures/CATALOG.md`).
- A design system with light and dark themes (`docs/design/DESIGN_SYSTEM.md`).

### Stack

- Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript (strict)
- Expo Router (file-based routing, typed routes)
- NativeWind v4 + Tailwind CSS
- React Native Reanimated + Gesture Handler, `@gorhom/bottom-sheet`
- `@rnmapbox/maps` (native map; a SoftMap fallback on web and Expo Go)
- TanStack Query (client shell; no endpoints)

### Layout

```
app/                 Expo Router routes (mostly re-export screens from src/features)
src/
  features/          per-domain screens
  components/        shared components; ui/ holds the design-system primitives
  components/map/    the map: canvas, sheets, hooks and pure services
  fixtures/          mock data, the interest catalogue, menus and photo manifest
  lib/               stores and utilities (origin, opening hours, haptics …)
  theme/             design tokens (tokens.js) and motion tokens
  copy/              shared Norwegian copy (confirmations, what's new)
tests/               jest tests (including design-system guard tests)
docs/                screen inventory, gap matrices, ledger, reviews, design
```

### Develop

```bash
npm install
npm run start        # expo dev server
npm run android      # native dev-client build (needed for the Mapbox map)
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # jest
```

Copy `.env.example` → `.env.local` and fill public config. Never commit secrets.

Working rules (governance, verification on the Android emulator, line
endings, the map architecture) are in [CLAUDE.md](CLAUDE.md). The governance
state and open blockers carried from the source-of-truth audit are in
`docs/IMPLEMENTATION_BASELINE.md` and `docs/PHASE0_BLOCKER_REPORT.json`.
