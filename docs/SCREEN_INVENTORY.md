# Screen / Route Inventory (Phase 0 stub)

Source: `DESIGN/ThirdPlace_All_Screens.pdf` — **visual reference only**, not an
API/data authority (master spec:11864–11875). This stub records the mapping
columns required by Phase 0. Rows will be filled from the PDF; every `API
dependency` stays `BLOCKED_CONTRACT_GAP` until the V2.2 contract is imported.

| Screen / flow      | Frontend route              | Feature module           | UI state(s) | API dependency       | Loading/empty/error | Permissions/policy | Analytics | Nav entry/exit |
| ------------------ | --------------------------- | ------------------------ | ----------- | -------------------- | ------------------- | ------------------ | --------- | -------------- |
| (landing)          | `app/index.tsx`             | —                        | default     | none (placeholder)   | n/a                 | 18+ launch         | —         | root           |
| Gesture smoke test | `app/_sandbox/gestures.tsx` | —                        | default     | none                 | n/a                 | —                  | —         | from landing   |
| Map                | `app/(tabs)/map` (TBD)      | `features/map` (TBD)     | TBD         | BLOCKED_CONTRACT_GAP | TBD                 | TBD                | TBD       | primary tab    |
| Swipe              | `app/(tabs)/swipe` (TBD)    | `features/swipe` (TBD)   | TBD         | BLOCKED_CONTRACT_GAP | TBD                 | TBD                | TBD       | primary tab    |
| Add                | `app/(tabs)/add` (TBD)      | `features/add` (TBD)     | TBD         | BLOCKED_CONTRACT_GAP | TBD                 | TBD                | TBD       | primary tab    |
| Chat               | `app/(tabs)/chat` (TBD)     | `features/chat` (TBD)    | TBD         | BLOCKED_CONTRACT_GAP | TBD                 | TBD                | TBD       | primary tab    |
| Profile            | `app/(tabs)/profile` (TBD)  | `features/profile` (TBD) | TBD         | BLOCKED_CONTRACT_GAP | TBD                 | TBD                | TBD       | primary tab    |

> The five primary surfaces (Map/Swipe/Add/Chat/Profile) are named in the source
> of truth. Listing them here is a navigation reference, not authorization for any
> endpoint, entity, or persistence. "Five tabs" does not imply only five flows.
