# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ThirdPlace — an Expo / React Native (TypeScript) mobile client. **Post-restart (2026-10-12) codebase**: a fixtures-only visual shell. No product surface is wired to a real backend yet.

## Governance (read before writing feature code)

The authoritative V2.2 product contract is **not imported** — preserve `BLOCKED_NOT_V22_CERTIFIED`. Do **not** invent: API endpoints, request/response DTOs, DB tables/migrations, RLS policies, auth entitlements, ranking/matchmaking formulas, real counts/social proof, or payment/booking rules.

- All data is MOCK, from a single file: [src/fixtures/index.ts](src/fixtures/index.ts). Every type is `Mock*`-prefixed; the header flags `BLOCKED_CONTRACT_GAP`. New fixture fields are allowed but must keep that non-contract framing.
- **Honesty markers are mandatory.** A demo action must never look like a real backend success. Use `DemoBadge` ([src/components/DemoBadge.tsx](src/components/DemoBadge.tsx)) for non-functional demo UI and `GuestLock` / `SignInPrompt` for account-gated actions. Join/save/follow/review/attendance/login are all local demo state only.
- `docs/IMPLEMENTATION_BASELINE.md` + `docs/PHASE0_BLOCKER_REPORT.json` hold governance state; `docs/implementation-ledger/TP-PHASE0-FE.jsonl` is an append-only ledger — add one JSON line per slice. `docs/map/` holds the Map gap matrix, blocker/native-verify registers, and deliverables.

## Commands

```bash
npm install
npm run start        # expo dev server
npm run web          # expo web (fastest way to view/verify the UI; uses the SoftMap fallback)
npm run android      # expo on a connected Android device/emulator
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # eslint (flat config)
npm run format       # prettier --check .   (CI uses this)
npm run format:write # prettier --write .
npm test             # jest --ci
npx jest tests/mapAdapter.test.ts         # single test file
npx jest -t "trending sorts"              # single test by name
npx expo-doctor      # dependency/config health (CI runs this)
```

CI (`.github/workflows/ci.yml`): a **quality** job (format → lint → typecheck → test, Node 22) and a **bundle** job (expo-doctor + `expo export` web & android on the stub path, then greps the bundles to assert no `sk.*` Mapbox token leaked). Run the full local gate (`typecheck`, `lint`, `format`, `test`) before committing.

**Line endings:** the working tree is CRLF, the git index is LF. `prettier --check` locally flags CRLF (cosmetic); CI runs on LF and passes. After `prettier --write`, format only the files you touched (a repo-wide write creates line-ending-only churn in unrelated files — don't stage those). `.jsonl` has no prettier parser and is skipped.

## Conventions (differ from common defaults)

- **Styling is NativeWind `className`, not StyleSheet.** Tailwind extends tokens from [src/theme/tokens.js](src/theme/tokens.js) (CommonJS so `tailwind.config.js` can `require` it). Use the imperative `colors` object from `@/theme` only where `className` can't reach: native color props (Ionicons `color`, `backgroundColor`, `ActivityIndicator`). The token is lowercase `colors` (ember `#D80000`, success `#387850`, ink `#202020`), light-theme only, **provisional**. Fonts are system (no custom typeface loaded).
- **Motion tokens** live in [src/theme/motion.ts](src/theme/motion.ts) (`motion.duration` / `motion.spring` / `motion.gesture`); route new Reanimated durations/springs through them and honor `useReducedMotion()`.
- **Navigation is Expo Router** (file-based, `app/`), 5 tabs (map/swipe/add/chat/profile). **Detail screens are sheets, not routes.** Two sheet patterns: the Modal-based [src/components/Sheet.tsx](src/components/Sheet.tsx) (filters, notifications, location, sign-in, map detail) — note its tap-to-close backdrop is a **sibling behind** the card, never an ancestor, so card buttons aren't nested inside a `<button>` (this matters on web). Avoid nested `Pressable`/`Button` — it is invalid DOM on web.
- UI language is **Norwegian**.
- Strict TypeScript; avoid `any` except a documented interop boundary (e.g. the lazy native-module requires in `src/lib/haptics.ts` / `useMapLocation`).

## Map feature architecture (the one area that spans many files)

The Map is a thin screen ([app/(tabs)/map.tsx](<app/(tabs)/map.tsx>)) composing feature hooks + components under [src/components/map/](src/components/map). Understanding the data flow requires several files:

- **Presentation model** — `types/mapPresentation.ts` defines `DiscoveryItem` (the shape markers, clusters, preview and list all render) and the 6 `DiscoveryMode`s (`DEMO_MODES` = For You/Friends, which must stay non-personalized demo shells).
- **Services (pure)** — `services/mapFixtureAdapter.ts` resolves a mode → `DiscoveryItem[]`; `services/mapSearch.ts` does grouped fixture search; `services/softClustering.ts` projects coords + grid-clusters for the fallback map.
- **Hooks** — `hooks/useMap{Filters,Discovery,Selection,Presentation,Camera,Location,Saved}.ts` + `useGuestMode` + `useRecentSearches`. Selection splits a lightweight **preview** (floating `MapPreviewCard`) from the expanded **detail sheet** (`sheetStack` with in-sheet push/back nav). `useMapSaved`/`useGuestMode`/`useRecentSearches` are in-memory `useSyncExternalStore` demo stores (reset on reload — persistence is contract-blocked).
- **Rendering** — `MapCanvas` chooses the native `MapboxMap` (a clustered `ShapeSource`, category-colored pins, selected ring) vs the `SoftMap` fallback.

### Mapbox (important gotchas)

- `@rnmapbox/maps` is native-only. [metro.config.js](metro.config.js) aliases it to `src/components/map/mapbox-stub.js` when `platform === "web"` **or** `EXPO_PUBLIC_USE_NATIVE_MAP !== "1"`. So: web + Expo Go + CI always get the stub + `SoftMap`; only a native dev build with the flag loads real Mapbox. Keep the stub's exports in sync with what `MapboxMap` imports.
- Token model: public `pk.*` = `EXPO_PUBLIC_MAPBOX_TOKEN` (inlined, decides tile render). Secret `sk.*` = `MAPBOX_DOWNLOADS_TOKEN`, a native-build input only ([app.config.ts](app.config.ts)) — never in the JS bundle.
- Optional native modules (`expo-location`, `expo-haptics`) are required **lazily + guarded** so a dev build that predates them degrades gracefully instead of crashing at import.

## Verifying changes

Fastest: `npm run web` (SoftMap path) — drive it in a browser. For the native map / GPS / haptics you need an Android dev build.

Running the existing dev build on an emulator (Windows / Git Bash):

```bash
export PATH="$PATH:/c/Users/Ahmed/AppData/Local/Android/Sdk/platform-tools"
npx expo start --dev-client --port 8083          # Metro
adb reverse tcp:8083 tcp:8083
adb shell am start -a android.intent.action.VIEW \
  -d "thirdplace://expo-development-client/?url=http://localhost:8083" com.thirdplace.app
```

- `adb`/`emulator` are not on PATH; use `$ANDROID_HOME/platform-tools/adb.exe`.
- In Git Bash, prefix device paths with `//` (e.g. `adb pull //sdcard/s.png`) to stop MSYS mangling `/sdcard` into a Windows path.
- The on-device dev build has native `@rnmapbox` but may lack newer native deps; real GPS/haptics require a fresh `expo run:android`.

## PR / change management

Small, reviewable, one-slice PRs; add a ledger line per slice. Never auto-merge, force-push shared branches, or deploy. Do not weaken tests to pass CI.
