# ThirdPlace Design System

**Status:** Phase 1 (foundations) in progress — started 2026-11-05.
**Supersedes:** the token tables in [DESIGN_TOKENS_PROVISIONAL.md](DESIGN_TOKENS_PROVISIONAL.md) once Phase 1 slice S2 lands (palette values stay the same; the structure changes).
**Authority order:** `ThirdPlace_All_Screens.pdf` (layout, order, Norwegian copy) → this document (how things look, move and respond) → code.

The design system **restyles the PDF's layouts**. It never adds screens, sections, rails, rules or copy that the PDF and the master spec don't have.

## 1. Principles

1. **Calm ink canvas, ember as a spark.** Ink (`#202020`) carries primary actions and selection, as in the PDF. Ember (`#D80000`) is reserved for brand moments: like/heart, acquisition CTAs ("Opprett konto", "Kom i gang"), live/unread badges and the active tab. Success green is for nature, map and local completion.
2. **Soft, round, tactile.** Pill actions and chips, 16 px cards, 28 px sheet tops, three soft elevation levels, press-scale feedback on everything tappable.
3. **Photo-first.** Imagery runs full-bleed with a tokenised scrim; controls over imagery are round white floating buttons.
4. **Honest feedback.** Every action responds immediately (motion, haptic, state change) but never pretends a backend answered. No delivery ticks, no "processing → success", no invented counts. Demo markers stay.
5. **One way to do each thing.** One button, one chip, one header, one sheet API, one icon entry point. If a screen needs something new, it becomes a primitive first.
6. **Accessible by default.** 44×44 touch targets, AA contrast in light and dark, every control has a role, label and state; all motion has a reduced-motion fallback.

## 2. Decisions

| Topic             | Decision (2026-11-05)                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand colour      | Ember stays `#D80000`. No drift towards other brands' reds. Changing it is a founder call.                                                                                                            |
| Typeface          | One open-licence geometric sans loaded via `expo-font` (candidate **DM Sans**, alternative Plus Jakarta Sans; a specimen in `app/_sandbox/` picks). Supersedes the Phase 0.3 "system fonts" decision. |
| Theme             | Semantic tokens with **light and dark**, shipped together. Tokens are CSS variables so `className` utilities switch per scheme without `dark:` variants.                                              |
| Sheets            | One Sheet API with two engines: `@gorhom/bottom-sheet` for snapping map sheets, the Modal engine for action sheets. No raw `Modal` outside the engine.                                                |
| Icons             | Ionicons behind a single `Icon` wrapper (outline = default, filled = selected). ThirdPlace-specific glyphs become custom SVGs behind the same wrapper.                                                |
| Illustration / 3D | Art-direction spec, pipeline and named slots now, with themed SVG placeholders. Final art is supplied later and dropped into the slots. IMG.LY/Codesign is not used.                                  |
| Benchmark         | Airbnb is a **quality benchmark only**. No tracing, copying or lookalikes of its icons, illustrations, 3D renders, typeface or layouts.                                                               |

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

Dark values are defined in S2 and must pass the contrast test (`tests/themeContrast.test.ts`). Never write a hex literal outside `src/theme/`; read native colour props from the theme hook.

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

Sizes `16 · 20 · 24 · 32`. Outline by default, filled when selected/active. Custom glyphs: 24 px grid, 1.75 px stroke, rounded caps and joins, optical centre.

## 4. Components

All primitives live in `src/components/ui/`. Each one must implement the states that apply to it:

| State                   | Rule                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Default                 | Token colours only                                                                   |
| Pressed                 | Scale 0.97 + tint, `spring.snappy`; opacity-only under reduced motion                |
| Focused                 | 2 px `ink` focus ring (web / keyboard)                                               |
| Selected                | Ink fill or filled icon; `accessibilityState.selected`                               |
| Disabled                | 40 % opacity, no press feedback; `accessibilityState.disabled`                       |
| Loading                 | Spinner replaces the label, width locked, presses ignored; `accessibilityState.busy` |
| Error                   | `danger` border + message under the field                                            |
| Expanded / collapsed    | Animated height; `accessibilityState.expanded`                                       |
| Empty / error (screens) | `StateView` with an illustration slot and one or two actions                         |

Touch targets are at least 44×44 (use `hitSlop` to reach it on small visuals).

## 5. Motion

| Token           | Value        | Use                             |
| --------------- | ------------ | ------------------------------- |
| `fast`          | 150 ms       | Chip / toggle fills, icon swaps |
| `base`          | 220 ms       | Most transitions                |
| `slow`          | 320 ms       | Sheets, larger layout changes   |
| `spring.snappy` | 20 / 220 / 1 | Press, heart pop                |
| `spring.gentle` | 26 / 160 / 1 | Sheets, toasts                  |
| `spring.card`   | 16 / 240 / 1 | Swipe cards                     |

Motion explains a change (where something came from, what it became); it never delays navigation. Every animated hook checks `useReducedMotion()` and falls back to an opacity change or none.

### Microinteraction patterns

- **Like / save:** heart pops 1 → 1.25 → 1, fills ember, `haptics.light()`.
- **Follow:** pill morphs "Følg" → "Følger" (ink → outline).
- **Join:** button morphs to the joined state locally; the existing demo note stays.
- **Send message:** bubble slides in from the composer, `haptics.light()`. No delivered/read ticks (contract-blocked).
- **Filter / chip select:** fill crossfade (`fast`).
- `haptics.success()` only for purely local completions (e.g. save). Never for join, pay or anything that implies a server result.

## 6. Illustration and 3D

- **Vector illustrations:** editorial, organic shapes, simplified faceless people, natural proportions, palette from tokens (works on light and dark). Slots: the PDF p26 empty states, error/offline/maintenance, onboarding steps, achievements. Delivered as `react-native-svg` components that read theme colours.
- **3D category art:** soft rounded geometry, matte/satin materials, one soft key light (top-left) plus fill, ¾ camera at about 30°, isolated, no text. Sets: People, Places, Experiences, plus the fixture categories. Delivered as transparent WebP at 1x/2x/3x (≤ 40 KB each), shown with `expo-image`. The brief lives in `ASSET_SPEC_3D.md` (S12). Static assets only — no realtime 3D.
- Art appears only where the PDF has a slot for it.

## 7. Adding something new

1. Check the PDF page and `docs/SCREEN_INVENTORY.md` — is there a basis for it?
2. Can an existing primitive do it with a variant? Prefer that.
3. If not, add the primitive in `src/components/ui/` with all applicable states, a11y props, a reduced-motion path and an RNTL test.
4. Tokens only — no hex, no arbitrary sizes, no hand-written shadows, no raw `Modal`.
5. Verify on the Android emulator in light and dark; add a ledger line.

## 8. Rollout

Phases (see the implementation ledger for progress): 1 Foundations (docs, tokens, font) → 2 Primitives → 3 Icons, illustrations, 3D pipeline → 4 Screen upgrades → 5 Consistency guard and cleanup → 6 Full-app review.
