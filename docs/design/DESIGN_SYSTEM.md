# ThirdPlace Design System

**Status:** Phase 1 (foundations) in progress — started 2026-11-05.
**Supersedes:** the token tables in [DESIGN_TOKENS_PROVISIONAL.md](DESIGN_TOKENS_PROVISIONAL.md) once Phase 1 slice S2 lands (palette values stay the same; the structure changes).
**Authority order:** `ThirdPlace_All_Screens.pdf` (layout, order, Norwegian copy) → this document (how things look, move and respond) → code. Exception: the founder-approved copy rewrites listed in `docs/SCREEN_INVENTORY.md` ("Founder copy decisions", 2026-11-06) replace the PDF wording on those lines.

The design system **restyles the PDF's layouts**. It never adds screens, sections, rails, rules or copy that the PDF and the master spec don't have.

## 1. Principles

1. **Calm ink canvas, ember as a spark.** Ink (`#202020`) carries primary actions and selection, as in the PDF. Ember (`#D80000`) is reserved for brand moments: like/heart, acquisition CTAs ("Opprett konto", "Kom i gang"), live/unread badges, the active tab, FABs and the map selection ring. Toggles, checkboxes, edit links, codes and the current chart bar are ink (founder decision 2026-11-06). Success green is for nature, map and local completion.
2. **Soft, round, tactile.** Pill actions and chips, 16 px cards, 28 px sheet tops, three soft elevation levels, press-scale feedback on everything tappable.
3. **Photo-first.** Imagery runs full-bleed with a tokenised scrim; controls over imagery are round white floating buttons.
4. **Honest feedback.** Every action responds immediately (motion, haptic, state change) but never pretends a backend answered. No delivery ticks, no "processing → success", no invented counts. Demo markers stay.
5. **One way to do each thing.** One button, one chip, one header, one sheet API, one icon entry point. If a screen needs something new, it becomes a primitive first.
6. **Accessible by default.** 44×44 touch targets, AA contrast in light and dark, every control has a role, label and state; all motion has a reduced-motion fallback.

## 2. Decisions

| Topic             | Decision (2026-11-05)                                                                                                                                                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand colour      | Ember stays `#D80000`. No drift towards other brands' reds. Changing it is a founder call.                                                                                                                                                                                                                                        |
| Typeface          | One open-licence geometric sans loaded via `expo-font` (candidate **DM Sans**, alternative Plus Jakarta Sans; a specimen in `app/_sandbox/` picks). Supersedes the Phase 0.3 "system fonts" decision.                                                                                                                             |
| Theme             | Semantic tokens with **light and dark**, shipped together; the app follows the phone setting (`system`, dark palette approved 2026-11-05). Tokens are CSS variables so `className` utilities switch per scheme without `dark:` variants. Map basemap goes to the night style in dark; map pins and photo UI (`media`) stay fixed. |
| Sheets            | One Sheet API with two engines: `@gorhom/bottom-sheet` for snapping map sheets, the Modal engine for action sheets. No raw `Modal` outside the engine.                                                                                                                                                                            |
| Icons             | Ionicons behind a single `Icon` wrapper (outline = default, filled = selected). ThirdPlace-specific glyphs become custom SVGs behind the same wrapper.                                                                                                                                                                            |
| Illustration / 3D | Art-direction spec, pipeline and named slots now, with themed SVG placeholders. Final art is supplied later and dropped into the slots. IMG.LY/Codesign is not used.                                                                                                                                                              |
| Benchmark         | Airbnb is a **quality benchmark only**. No tracing, copying or lookalikes of its icons, illustrations, 3D renders, typeface or layouts.                                                                                                                                                                                           |

## 3. Foundations

### Colour (semantic)

| Token           | Light     | Use                                            |
| --------------- | --------- | ---------------------------------------------- |
| `bg`            | `#F8F8F8` | App background                                 |
| `surface`       | `#FFFFFF` | Cards, sheets, inputs                          |
| `surface-muted` | `#F0F0F0` | Secondary buttons, subtle fills                |
| `line`          | `#E0E0E0` | Borders, dividers                              |
| `ink`           | `#202020` | Primary text, primary (ink) buttons, selection |
| `on-ink`        | `#FFFFFF` | Content on ink                                 |
| `muted`         | `#6B6B6B` | Secondary text, placeholders                   |
| `ember`         | `#D80000` | Brand moments only (see principle 1)           |
| `on-ember`      | `#FFFFFF` | Content on ember                               |
| `success`       | `#387850` | Nature, map, local completion                  |
| `danger`        | `#B5342B` | Destructive (value still provisional)          |
| `warning`       | `#B05008` | Warning (value still provisional)              |

Opacity modifiers (`bg-scrim/40`, `bg-danger/15`) work on every token but only in Tailwind steps of 5 — `/12` generates nothing. Dark values are defined in S2 and must pass the contrast test (`tests/themeTokens.test.ts`). Never write a hex literal outside `src/theme/`; read native colour props from the theme hook.

### Typography

One family, weight-led hierarchy. Use the `Text` primitive's `variant`, not raw size classes.

| Variant   | Size / line | Weight       |
| --------- | ----------- | ------------ |
| `display` | 30 / 36     | 700          |
| `h1`      | 24 / 30     | 700          |
| `h2`      | 20 / 26     | 600          |
| `title`   | 17 / 22     | 600          |
| `body`    | 16 / 22     | 400          |
| `label`   | 15 / 20     | 500          |
| `caption` | 13 / 18     | 400          |
| `micro`   | 11 / 14     | 500, tracked |

No arbitrary sizes (`text-[10px]`). Note: NativeWind uses rem = 14 px on native, so legacy Tailwind classes render smaller than their names suggest (`text-sm` ≈ 12 px, `text-base` = 14 px). The scale above is in real px, so migrated text is intentionally larger; migrate a screen as a whole rather than mixing old and new text in one block.

### Spacing

4-point scale. Tailwind's numeric scale works (verified with `tailwindcss/resolveConfig`: `h-52` = 13rem, `w-28` = 7rem); the named tokens `xs 4 · sm 8 · md 12 · gutter 16 · lg 20 · xl 24 · section 32` add to it. Screen side padding is `gutter`.

### Radius

`xs 6 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 28 · full`. Cards `lg`, inputs `md`, sheets `2xl` (top corners), buttons and chips `full`. Before S2, `rounded-xl/2xl/3xl` are untokenised Tailwind defaults (in NativeWind rem = 14 px) and are migrated in S2.

### Elevation

| Level | Use                                              |
| ----- | ------------------------------------------------ |
| `e0`  | Flat (most content on `bg`)                      |
| `e1`  | Cards on imagery or map                          |
| `e2`  | Floating controls: search pill, map buttons, FAB |
| `e3`  | Sheets, modals, toasts                           |

Shadows come only from `src/theme/elevation.ts` (iOS shadow + Android elevation together).

### Icons

Sizes `sm 16 · md 20 · lg 24 · xl 32 · 2xl 44 · 3xl 64`. Outline by default, filled when selected/active. Everything goes through `<Icon>`: Ionicons, plus ThirdPlace glyphs (`src/components/ui/glyphs.tsx`, names start with `tp-`) drawn on a 24 px grid with the 1.75 px `iconStroke`, rounded caps and joins.

| Glyph                          | Concept                                                                                                                                                     | Used for                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `tp-experience`                | Ticket stub                                                                                                                                                 | Opplevelser (chat group, search group, Add, notification settings, onboarding) |
| `tp-swipe` / `tp-swipe-filled` | Three stacked cards tilted −18°, dot on the front card (founder's sveip.svg, stroke 2 as in the file, the one exception to 1.75); filled = front card solid | Sveip tab                                                                      |
| `tp-arrival`                   | Pin with a check                                                                                                                                            | GPS check-in                                                                   |
| `tp-business`                  | Shop front with an awning                                                                                                                                   | Bedrift (account switch, settings, marketplace, places done)                   |

No sparkle, magic-wand or "AI" glyphs: they read as machine-made. Use a literal object instead (ticket, notes, hand, ear, palette).

## 4. Components

All primitives live in `src/components/ui/`. Each one must implement the states that apply to it:

| State                   | Rule                                                                                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                 | Token colours only                                                                                                                                                                                                      |
| Pressed                 | Scale 0.97 + tint, `spring.snappy`; opacity-only under reduced motion                                                                                                                                                   |
| Focused                 | 2 px `ink` focus ring (web / keyboard)                                                                                                                                                                                  |
| Selected                | Ink fill or filled icon; `accessibilityState.selected`                                                                                                                                                                  |
| Disabled                | 40 % opacity, no press feedback; `accessibilityState.disabled`. `Button` instead turns muted surface + muted label at full opacity (a faded ink fill read as broken), with a one-line reason under it where one exists. |
| Loading                 | Spinner replaces the label, width locked, presses ignored; `accessibilityState.busy`                                                                                                                                    |
| Error                   | `danger` border + message under the field                                                                                                                                                                               |
| Expanded / collapsed    | Animated height; `accessibilityState.expanded`                                                                                                                                                                          |
| Empty / error (screens) | `StateView` with an illustration slot and one or two actions                                                                                                                                                            |

Touch targets are at least 44×44 (use `hitSlop` to reach it on small visuals).

### Feedback & states

| Need                | Use                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Like / save         | `<HeartToggle kind="heart"                                                                                                                                                                                                            | "bookmark">`(pop + ember + light haptic on save; quiet on unsave). Inside a custom button, use`<PopIcon pop={saved}>`. |
| Follow              | `<FollowButton>` — "Følg" ink pill → "Følger" muted pill, label cross-fades, selection haptic.                                                                                                                                        |
| Collapsible section | `<Accordion>` (animated height + rotating chevron; `variant="card"` for grouped lists).                                                                                                                                               |
| Loading list        | `<SkeletonList variant="row"                                                                                                                                                                                                          | "card"                                                                                                                 | "mediaCard">` — one busy element for screen readers. |
| Empty / error       | `<EmptyState>` / `<ErrorState>` (icon in a soft disc, or an `illustration`).                                                                                                                                                          |
| Toast               | `showToast()` — ink surface, polite live region, fades in/out. Demo-honest copy only. A demo confirm inside a sheet closes the sheet, then calls `showToastAfterSheet(demoToast.x)` (waits for the exit; the host sits under Modals). |
| StickyFooter        | Primary action of a flow or single-goal screen, pinned after the scroll area (hairline, page background, `safeBottom` on stack routes). Wizards, Du er nå Skaper!, gruppe-sveip setup, Nytt samarbeid.                                |
| ScrollRow           | One line of chips or avatars that scrolls sideways and bleeds to the screen edges, instead of wrapping an orphan at 360 dp (tab chips, group-swipe friends and filters).                                                              |

### Sheets & overlays

One family, two engines, one look (handle, 28 px top radius, `e3`, `SheetHeader`):

| Need                                                                   | Use                                                         | Engine |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- | ------ | -------- | ----- |
| Action sheet, picker, form, prompt                                     | `<Sheet>` (`fullHeight` for the tall filter sheet)          | Modal  |
| Snapping map sheet (browse, detail)                                    | `@gorhom/bottom-sheet` + `useSheetChrome()` + `SheetHeader` | gorhom |
| Full-screen surface (search, filter panel, swipe detail, image viewer) | `<Overlay enter="fade"                                      | "up"   | "left">` | Modal |

- Enter 320 ms (`easing.enter`), exit 200 ms (`easing.exit`); reduced motion → 150 ms fade. The Modal stays mounted until the exit finishes (`usePresence`).
- `<Sheet>` closes on scrim tap, Android back, or a drag down on the handle/header (past 25 % of its height or a 900 px/s flick).
- A content `<Sheet>` stops 16 px below the status bar and scrolls its children inside the card; `fullHeight` sheets own their scroll area and sticky footer. Bottom padding is `max(safe-area bottom, 12) + 16`.
- Keyboard: edge-to-edge Android does not resize the window (nor a Modal) for the keyboard. Screens with inputs wrap their scroll area **and** footer in `KeyboardAvoidingView behavior="padding"` on both platforms (wizards, chat composer, `<Sheet>`); scroll views with buttons set `keyboardShouldPersistTaps="handled"`; the tab bar hides while the keyboard is open. Sticky footers get `border-t border-line bg-background`.
- gorhom sheets have no back handling of their own. On the map, Android back steps back inside the detail sheet, then closes it, and only then leaves the screen (`mapBackAction` in `useMapSelection`, a focus-scoped `BackHandler` in `app/(tabs)/map.tsx`).
- Children mount only while open, so state seeds fresh each time. Render the body unconditionally inside `<Overlay>`; mount a whole `<Sheet>` conditionally only when it must reset between uses.
- No raw `Modal` outside `src/components/ui/Sheet.tsx` and `Overlay.tsx`.

## 5. Motion

| Token           | Value        | Use                             |
| --------------- | ------------ | ------------------------------- |
| `fast`          | 150 ms       | Chip / toggle fills, icon swaps |
| `base`          | 220 ms       | Most transitions                |
| `slow`          | 320 ms       | Sheets, larger layout changes   |
| `spring.snappy` | 20 / 220 / 1 | Press, heart pop                |
| `spring.gentle` | 26 / 160 / 1 | Sheets, toasts                  |
| `spring.card`   | 16 / 240 / 1 | Swipe cards                     |

Easing curves (`easing.*`, cubic-bezier): `standard` 0.2, 0, 0, 1 · `enter` 0.05, 0.7, 0.1, 1 · `exit` 0.3, 0, 0.8, 0.15. Sheet/overlay timing lives in `presentation`.

- Content that replaces content in place (wizard steps, the in-sheet detail stack, the next Steder or group-swipe card) fades in through `<FadeSwap swapKey>` over `base`; nothing under reduced motion. Style only on the animated view.
- The swipe card glides off in 340–460 ms (fling to tap) and comes back on undo in 400 ms; longer glides held the deck for ~0.9 s and dropped taps.
- No fake waits: a demo screen with nothing to load shows its content at once (`useMockResource({ immediate })`); loading states appear only on a real reload.

Motion explains a change (where something came from, what it became); it never delays navigation. Every animated hook checks `useReducedMotion()` and falls back to an opacity change or none.

### Microinteraction patterns

- **Like / save:** heart pops 1 → 1.25 → 1, fills ember, `haptics.light()`.
- **Follow:** pill morphs "Følg" → "Følger" (ink → outline).
- **Join:** button morphs to the joined state locally; the existing demo note stays.
- **Send message:** bubble slides in from the composer, `haptics.light()`. No delivered/read ticks (contract-blocked).
- **Filter / chip select:** fill crossfade (`fast`).
- `haptics.success()` only for purely local completions (e.g. save). Never for join, pay or anything that implies a server result.

## 6. Illustration and 3D

- **Vector illustrations** (`src/components/illustrations/Illustration.tsx`, `<Illustration name>`): one hand for every scene — 160 × 120 canvas, ground line at y 104, 2.5 px ink outlines with round caps, flat token fills only (no gradients), **one** ember accent per scene, everyday Oslo objects (trikk, café cup, paint roller, calendar) instead of blobs or faceless people. Theme colours, so light and dark both work. Current set: `offline` (trikk with its pantograph down), `error` (tipped cup), `maintenance` (bucket + roller), `update` (phone + arrow), `emptySaved`, `emptyDeck`, `emptyPlans`. Pass one to `StateView`/`EmptyState` via `illustration`. No emoji in their place.
- **3D category art** (`<CategoryArt name>`; brief and delivery rules in [ASSET_SPEC_3D.md](ASSET_SPEC_3D.md)): hand-built toon-shaded SVG objects (flat face, one shade, one hard highlight, top-left light, ¾ view, flat contact shadow, token colours, at most one ember element). Used in the Add menu tiles, the location prompt and (P4e) the category field. Real renders replace a key via `src/assets/3d/manifest.ts` without code changes.
- Art appears only where the PDF has a slot for it.

## 7. Adding something new

1. Check the PDF page and `docs/SCREEN_INVENTORY.md` — is there a basis for it?
2. Can an existing primitive do it with a variant? Prefer that.
3. If not, add the primitive in `src/components/ui/` with all applicable states, a11y props, a reduced-motion path and an RNTL test.
4. Tokens only — no hex, no arbitrary sizes, no hand-written shadows, no raw `Modal`.
5. Verify on the Android emulator in light and dark; add a ledger line.

`tests/designGuard.test.ts` enforces the mechanical rules in CI: no raw hex outside `src/theme`/fixtures/sandbox (escape: a `hex-ok:` comment with the reason), no legacy `text-xs…text-4xl`/`text-[Npx]` classes, no `rounded-3xl`/bare `rounded`/`rounded-[…]`, no raw `Modal` outside `Sheet`/`Overlay`, `Ionicons` only through `<Icon>` (escape: a `raw-icon:` comment saying why — animated colours, stamps with text shadows, caller-sized stars), no `active:/focus:/hover:` in `contentClassName`, no `InteractionManager`, no `expo-status-bar` import outside `StatusBarStyle`, and no `.toFixed(` outside `src/lib/format.ts`.

**Numbers.** Display decimals use the Norwegian comma (4,8 · 1,1 km) through `src/lib/format.ts` (`formatRating`, `formatDecimal`, `formatThreshold`); fixture strings are written the same way. Times keep the full stop ("kl. 12.00").

**Status bar.** Screens over a fixed dark or light surface (swipe card, photo hero, dusk/night basemap) render `<StatusBarStyle style="light" | "dark" />`; a themed panel opened over one of those renders `style="auto"`. Requests are pushed while the screen is focused and popped on blur, newest wins, and with none left the icons follow the theme (`setStatusBarFallback` in `ThemeRoot`). `Screen` pads from the provider insets (seeded with `initialWindowMetrics`), not a native `SafeAreaView`, so a pushed screen never paints its header under the status bar.

Animated surfaces inside a Modal render a plain style once settled (`usePresence().settled`): on Android a React commit inside a Modal dropped Reanimated's animated style.

## 8. Rollout

Phases (see the implementation ledger for progress): 1 Foundations (docs, tokens, font) → 2 Primitives → 3 Icons, illustrations, 3D pipeline → 4 Screen upgrades → 5 Consistency guard and cleanup → 6 Full-app review.
