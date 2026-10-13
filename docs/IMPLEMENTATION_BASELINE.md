# ThirdPlace Frontend — Implementation Baseline (Phase 0)

**Source package:** TP-SOT-v1.1.0-2026-10-12
**Disposition:** `BLOCKED_NOT_V22_CERTIFIED`
**Repo:** `ThirdPlace-AS/ThirdPlace-Frontend` (two-repo topology, founder-locked TP-D-006)

## Authority

- `CANONICAL/` rules in the source package outrank `REFERENCES/` and any archived
  README/OpenAPI/manifest.
- No public contract, canonical entity, DTO, state machine, event, or monetization
  rule is defined here. All such work is `BLOCKED_CONTRACT_GAP` pending the
  authoritative V2.2 spec + founder approval.
- UI is permitted as prototype **without** inventing public contracts (CLAUDE.md:11).

## What Phase 0 established in this repo

| Deliverable                     | State                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Repository structure baseline   | DONE — `app/`, `src/{features,components,services/api,stores,hooks,lib,types,constants,theme}/`, `tests/`                      |
| Stack baseline                  | DONE — Expo 57, RN 0.86, React 19.2, TS 6 strict, Expo Router, NativeWind 4.2.7, Reanimated 4, Gesture Handler, TanStack Query |
| Design tokens                   | PLACEHOLDER — `src/theme/tokens.js`; real values to be extracted from `DESIGN/ThirdPlace_All_Screens.pdf`                      |
| API client                      | SHELL ONLY — TanStack Query client, zero endpoints                                                                             |
| Env/secrets checklist           | DONE — `.env.example` (EXPO*PUBLIC*\* only, no secrets)                                                                        |
| Test infrastructure baseline    | DONE — jest-expo + one passing unit test                                                                                       |
| Lint / format / typecheck       | DONE — ESLint (expo), Prettier, `tsc --noEmit` strict                                                                          |
| Progressive CI (partial Gate 7) | GREEN — lint/typecheck/unit pass on PR #1 (run 38288528478); generated-client-drift is a no-op placeholder                     |
| Screen/route inventory          | STUB — `docs/SCREEN_INVENTORY.md` (API column = BLOCKED_CONTRACT_GAP)                                                          |

## Canonical registry checks (status at Phase 0)

- Entity registry: BLOCKED (no canonical named inventory; 249 ledger rows are not tables).
- API registry: BLOCKED (151/121 historical candidate is not V2.2-approved; API_LOCKED=false).
- State-machine registry: BLOCKED (no approved V2.2 state machines).
- Event/outbox registry: BLOCKED (outbox is an architecture boundary only in the backend).
- RLS/authorization matrix: baseline empty, awaiting approved schema (Gate 5).

## Required rule honored

No prototype migration, backfill, dual-write, dual-read, cutover, or legacy-schema
preservation (master spec:11840). This is a new build.

## Next safe slice

See `docs/implementation-ledger/`. The first contract-bearing vertical slice is
gated on importing the authoritative V2.2 spec, the 435-scenario registry, and the
verbatim Gates 1-4 text.
