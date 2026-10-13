# Mapbox integration — technical guide

Associated with **PR #9** (`feat/ui-map-mapbox`). This is the detailed companion to the short "Map"
pointer in `CLAUDE.md`. Read it before touching `metro.config.js`, `app.config.ts`, or anything
under `src/components/map/`.

## Why this is tricky

`@rnmapbox/maps` is a **native module**. Its JS imports Fabric native-spec components
(e.g. `RNMBXCameraNativeComponent`) that only exist after a native codegen build. In Expo Go and on
web there is no such build, so if Metro statically bundles the real module the dev bundle fails to
compile / the app crashes. The frontend therefore ships a placeholder (`SoftMap`) everywhere except
a real native build.

## Two independent concerns — do not conflate them

| Concern                 | Signal                                                     | Meaning                                                       |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| **Native availability** | `EXPO_PUBLIC_USE_NATIVE_MAP=1` (native dev/EAS build only) | The native module is compiled in and safe to bundle/evaluate. |
| **Tile access**         | `EXPO_PUBLIC_MAPBOX_TOKEN` (public `pk.*`)                 | Needed to actually render Mapbox tiles at runtime.            |

The public token **must not** gate bundling. A dev may set `pk.*` to preview tiles; if that also
caused the real module to be bundled, opening the app in **Expo Go** would crash on the Fabric spec
import. So native availability is driven by the explicit `EXPO_PUBLIC_USE_NATIVE_MAP` flag, and the
token only decides whether a native build renders tiles vs. shows `SoftMap`.

## How the gate is wired

- **`metro.config.js`** — aliases `@rnmapbox/maps` → `src/components/map/mapbox-stub.js` **unless**
  `EXPO_PUBLIC_USE_NATIVE_MAP === "1"`. Default (unset) keeps the safe stub path for Expo Go, web,
  and CI export smoke. Metro runs at bundle time and cannot detect Expo Go, which is exactly why an
  explicit flag is used rather than any runtime heuristic.
- **`src/components/map/MapCanvas.tsx`** —
  `nativeMapAvailable = Platform.OS !== "web" && !isExpoGo && EXPO_PUBLIC_USE_NATIVE_MAP === "1"`.
  The real `MapboxMap` module is `require`d only when `nativeMapAvailable` (so `@rnmapbox/maps` is
  never evaluated in Expo Go / web). `canUseMapbox = nativeMapAvailable && !!env.mapboxToken` — when
  the native module is available but the token is missing, it **still falls back to `SoftMap`**,
  never crashes.
- **`src/components/map/mapbox-stub.js`** — the no-op module Metro substitutes on the stub path.

## Tokens

- **`EXPO_PUBLIC_MAPBOX_TOKEN` (public `pk.*`)** — read via `src/lib/env.ts`, inlined into the JS
  bundle. Public-tier and shippable in clients by design, but `.env.example` ships an **empty
  placeholder** only — never a real/live account token. If a live token is ever committed, rotate
  it in the Mapbox account and apply URL restrictions.
- **`MAPBOX_DOWNLOADS_TOKEN` (secret `sk.*`, `DOWNLOADS:READ` scope)** — **required at Android native
  build time** for `@rnmapbox/maps@^10.x` (Maven auth to fetch the native SDK). Read only in
  `app.config.ts` and passed to the config plugin as `RNMapboxMapsDownloadToken`. It is a native
  build input (Gradle/Pods), **never** written to `expoConfig.extra`, never exposed as `EXPO_PUBLIC_*`,
  and so **never inlined into the JS bundle**. Set it in the shell / EAS secrets; never commit it.
  Not needed for Expo Go / web (no native compile). The CI bundle job greps exported bundles to
  assert no `sk.*` string leaks.

## Fallback matrix (device-free configs, verified in CI + manually)

| Config  | Token set | Expected                                                         |
| ------- | --------- | ---------------------------------------------------------------- |
| Expo Go | no        | `SoftMap`, no crash                                              |
| Expo Go | yes       | `SoftMap`, no crash (token does **not** force the native module) |
| web     | no        | `SoftMap`, no crash                                              |
| web     | yes       | `SoftMap`, no crash                                              |

Record each run in `docs/implementation-ledger/TP-PHASE0-FE.jsonl`.

## Not tested — native rendering

Real `@rnmapbox/maps` rendering on **Android/iOS is `NOT_TESTED`** and must be treated as unverified
until a native dev build runs: local native Android builds are disk-constrained here and iOS needs
macOS/EAS. Do not claim the real map works in any PR recommendation until that build is done with
both tokens and `EXPO_PUBLIC_USE_NATIVE_MAP=1`.
