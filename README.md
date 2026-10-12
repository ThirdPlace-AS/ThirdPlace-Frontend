# ThirdPlace

A connective layer for the physical world.

Fresh start — 2026-10-12.

---

## Frontend (Phase 0 foundation)

Expo + React Native mobile client. This repo currently contains the **Phase 0
engineering foundation only** — no product surfaces are wired to any API. The
public API contract is `BLOCKED_CONTRACT_GAP` until the authoritative V2.2
specification is imported and founder-approved.

### Stack

- Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript 6 (strict)
- Expo Router (file-based routing, typed routes)
- NativeWind v4 + Tailwind CSS
- React Native Reanimated + Gesture Handler
- TanStack Query (client shell; no endpoints)

### Layout

```
app/                 Expo Router routes (placeholder tree + gesture sandbox)
src/
  features/          per-domain UI (empty until approved slices land)
  components/        shared components
  services/api/      TanStack Query client (no endpoints yet)
  stores/            client state
  hooks/             shared hooks
  lib/               generic utilities (env, invariant)
  types/             shared types
  constants/         app constants
  theme/             PLACEHOLDER design tokens (extract from DESIGN PDF)
tests/               unit tests
docs/                baseline, ledger, blocker report, screen inventory
```

### Develop

```bash
npm install
npm run start        # expo dev server
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # jest
```

Copy `.env.example` → `.env.local` and fill public config. Never commit secrets.

See `docs/IMPLEMENTATION_BASELINE.md` and `docs/PHASE0_BLOCKER_REPORT.json` for
the governance state and open blockers carried from the source-of-truth audit.
