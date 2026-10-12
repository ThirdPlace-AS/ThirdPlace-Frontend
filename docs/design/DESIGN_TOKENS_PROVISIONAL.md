# ThirdPlace — Provisional Design Tokens (for founder approval)

**Status:** PROVISIONAL — extracted 2026-10-12, **not founder-approved, not final.**
**Source:** `DESIGN/ThirdPlace_All_Screens.pdf` (28 pages; the visual screen reference per
master spec §Phase 0 — "visual specification, not a database or API source of truth").
**Method:** rendered all 28 pages (PyMuPDF @110 DPI), sampled a global colour histogram
(~1.9M sampled pixels), then confirmed usage visually against the auth-flow screens (page 1).

> These values replace the earlier **placeholder** tokens (a dark/purple guess) with a faithful
> first approximation of the real light-theme, Ember-red design. They remain provisional until
> confirmed against the authoritative design-system source (Figma). Font family in particular is
> **unverified** from a rendered PDF.

## Palette

| Token          | Hex       | Role                                                     | Confidence        |
| -------------- | --------- | -------------------------------------------------------- | ----------------- |
| `background`   | `#F8F8F8` | App background (dominant surface)                        | High              |
| `surface`      | `#FFFFFF` | Cards, sheets, inputs                                    | High              |
| `surfaceMuted` | `#F0F0F0` | Secondary buttons, subtle fills                          | High              |
| `line`         | `#E0E0E0` | Borders, dividers                                        | High              |
| `ink`          | `#202020` | Primary text; **ink** primary button (sign-in / confirm) | High              |
| `onInk`        | `#FFFFFF` | Text/icon on ink                                         | High              |
| `muted`        | `#808080` | Secondary text, placeholders                             | High              |
| `ember`        | `#D80000` | Brand red — logo, primary CTAs, inline links             | High              |
| `onEmber`      | `#FFFFFF` | Text/icon on Ember                                       | High              |
| `success`      | `#387850` | Green secondary (maps / nature / success)                | Medium            |
| `onSuccess`    | `#FFFFFF` | Text/icon on success                                     | Medium            |
| `danger`       | `#B5342B` | Destructive                                              | **Low — confirm** |
| `warning`      | `#B05008` | Warning/highlight                                        | **Low — confirm** |

Observed histogram leaders: `#F8F8F8` (bg) ≫ `#202020` (ink) > greys (`#F0F0F0`,`#E8E8E8`,
`#E0E0E0`,`#808080`) > **`#D80000`** (brand, the dominant saturated colour) > `#387850` (green).

### Two primary-button styles (confirmed on page 1)

- **Ember** (`#D80000`) — acquisition CTAs: "Opprett konto", "Kom i gang".
- **Ink** (`#202020`) — returning/confirm actions: "Logg inn", "Send tilbakestillingslenke", "Lagre nytt passord".
- **Secondary** — light grey pill (`#F0F0F0`/`surfaceMuted`): "Fortsett med Google/Apple".
- Inline links are Ember (`#D80000`). Body/subtitles are `muted`.

## Radii (provisional, visual estimate)

`sm 8` · `md 12` (buttons/inputs) · `lg 20` (cards / rounded-square logo mark) · `full 9999` (pills).

## Spacing (provisional)

`xs 4` · `sm 8` · `md 12` · `gutter 16` (screen side padding) · `lg 20` · `xl 24`.

## Typography (PROVISIONAL — family UNVERIFIED)

Rendered screens show a single geometric/humanist sans with weight-based hierarchy. The family
name **cannot be reliably read from a rendered PDF** — confirm against the design source before
coding type tokens. Provisional scale (px):

| Role                   | Size  | Weight                                |
| ---------------------- | ----- | ------------------------------------- |
| Display / screen title | 28–32 | 600–700                               |
| Heading (H1)           | 24    | 600                                   |
| Section (H2)           | 20    | 600                                   |
| Title                  | 18    | 500–600                               |
| Body                   | 15–16 | 400–500                               |
| Caption                | 13    | 400–500                               |
| Micro / overline       | 11    | 500 (tracked, uppercase e.g. "ELLER") |

## Open items for founder

1. **Confirm font family** (rendered PDF cannot verify it).
2. Confirm `danger` / `warning` hexes (low histogram presence).
3. Confirm exact Ember value — histogram snapped to `#D80000`; true value may be `#DD0000`/`#E00000`.
4. Confirm dark-mode palette (PDF shows light theme only).
5. Confirm radii/spacing against the design grid (visually estimated here).

_Applied provisionally to `src/theme/tokens.js` (NativeWind/Tailwind) with a PROVISIONAL banner;
reversible. No API/entity/product impact — UI only._
