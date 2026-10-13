# Phase 0 — Manual Merge Plan (auto-merge stays OFF)

All PRs are **merged manually by the founder**, in dependency order. Never auto-merge,
never deploy. Each PR is green before merge.

## Order & steps

1. **Backend PR #1** (`ThirdPlace-AS/ThirdPlace-Backend` #1) → merge into `main`. Independent.

2. **Frontend PR #1** — foundation (`phase0/frontend-foundation` → `main`). Merge into `main`.

3. **Frontend PR #2** — Expo SDK 57 (currently base `phase0/frontend-foundation`).
   After #1 merges: **retarget PR #2 base → `main`** (its diff collapses to the SDK-57 delta),
   confirm green, then merge.

4. **Frontend PR #3** — provisional tokens + Phase 0.3 corrections (base `chore/expo-sdk-57-upgrade`).
   After #2 merges: **retarget PR #3 base → `main`**, confirm green, then merge.

5. **Frontend PR #4** — visual app shell (base `chore/provisional-design-tokens`). Follows #3.
   After #3 merges: **retarget PR #4 base → `main`**, confirm green, then merge.

## Notes

- The frontend PRs are **stacked** (#2 on #1's branch, #3 on #2's, #4 on #3's), so retargeting
  each to `main` after its parent merges keeps every diff reviewable as just its own delta.
- GitHub usually auto-retargets a stacked PR to the base's base when the parent merges; verify
  the base is `main` before merging each.
- No squash/rebase is required, but squash-merge is fine (branches are short).
- V2.2 blockers (TP-BLOCK-001..006) remain OPEN after all merges; `BLOCKED_NOT_V22_CERTIFIED`
  stays until the authoritative V2.2 artifacts are imported. Merging these PRs does not change that.
