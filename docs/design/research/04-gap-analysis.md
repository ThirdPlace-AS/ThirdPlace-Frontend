# 04 — ThirdPlace Design-System Comparison & Gap Analysis

Reference date 2026-10-24. Baseline = branch `feat/map-m7-m8-hardening` @ `14134e2`. Severity: **H** blocks a premium feel or a11y, **M** noticeable, **L** polish.

| Area                  | ThirdPlace today                                                                                           | Reference quality bar (01–03)                                       | Gap                                                                               | Sev |
| --------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --- |
| Brand identity        | Code-drawn mark (Ember square + white dot) + system-font wordmark, `src/components/Logo.tsx`. Provisional. | Distinct owned mark, custom/licensed type, motion personality       | No final mark, no app icon or splash assets (`assets/` missing), no wordmark type | H   |
| Typography            | System fonts; 7 sizes, 4 weights (`src/theme/typography.ts`); not wired to Tailwind                        | Owned or licensed family; line-height + tracking per style          | No licensed family, no line-height/tracking tokens, scale not exposed as classes  | M   |
| Colour                | 13 light tokens (`src/theme/tokens.js`); Ember discipline good                                             | Semantic roles, dark mode, categorical palette separate from status | No dark mode; `warning` reused as a map category colour; no pressed/hover roles   | M   |
| Elevation             | None; inline shadows in `MapCanvas.tsx`, `MapFilterSheet.tsx`, `RangeSlider.tsx`                           | Soft, layered, consistent elevation                                 | No tokens → inconsistent depth                                                    | M   |
| Radius                | 8 / 12 / 20 / full                                                                                         | Larger radius on hero surfaces (sheets, cards)                      | No 24/32 for sheets/swipe card; `SwipeableRow` hardcodes 12                       | L   |
| Motion                | Central tokens (`src/theme/motion.ts`), reduced-motion honoured in places                                  | Motion with meaning, velocity-aware gestures, icon state motion     | Swipe ignores gesture tokens; no press-scale token; no icon motion                | M   |
| Iconography           | Ionicons only (~70 glyphs), mixed outline/filled                                                           | Owned family; dimensional objects for expressive moments            | No owned icons; no T2 dimensional set; inconsistent outline/filled use            | H   |
| Swipe                 | Single card, 110-px threshold, no stack/haptics/undo                                                       | Immersive full-bleed, stack depth, velocity commit, glass controls  | See [03 §4](03-tinder-swipe-audit.md)                                             | H   |
| Map                   | Strong: clustered pins, category colours, preview + detail sheet, filters, guest mode                      | Glass floating controls, social layer with privacy controls         | Floating controls opaque; category colours not a11y-validated                     | L   |
| Cards & photos        | Media placeholders (no images in fixtures)                                                                 | Photo-first cards with carousels                                    | No image pipeline (`expo-image` absent), no placeholders/blurhash                 | M   |
| Bottom sheets         | Two patterns (`Sheet.tsx` Modal + `@gorhom/bottom-sheet`)                                                  | One consistent sheet language                                       | Visual parity between both sheet types not specified                              | L   |
| Trust signals         | `DemoBadge`, `GuestLock`, `SignInPrompt` (honesty markers)                                                 | Verification badges, social context                                 | Slots undesigned; real data contract-blocked (correctly)                          | L   |
| Empty / system states | `StateView`, `Skeleton`                                                                                    | Branded empty states with illustration/object                       | No branded illustration                                                           | L   |
| Dark mode             | None                                                                                                       | Both platforms expect it                                            | Missing entirely                                                                  | M   |
| Glass / blur          | None (`expo-blur`, `expo-glass-effect` absent)                                                             | iOS 26 Liquid Glass; Android translucent                            | Missing; must honour Reduce Transparency                                          | L   |
| Accessibility         | Labels on swipe buttons; reduced motion in Skeleton/swipe; muted AA                                        | Full criteria ([11](11-a11y-acceptance.md))                         | No font-scale testing, no target-size audit, map pin colour contrast unverified   | M   |
| Personas              | Explorer only in UI                                                                                        | Distinct but related Creator/Business/Enterprise surfaces           | No persona theming rules                                                          | L   |

## Strengths to keep

- Ember-only-for-meaning colour discipline.
- Central motion tokens with reduced-motion awareness.
- Sheet-based detail navigation and in-sheet stack on the Map.
- Honesty markers (`DemoBadge`, `GuestLock`) — no reference product has to solve this; ThirdPlace's design system must make them look intentional, not like errors.

## Priority order (proposal)

1. Brand foundation decisions (font, mark direction, colour roles incl. dark) — unblocks everything.
2. Elevation + radius + type tokens — cheap, high consistency gain.
3. Swipe rebuild against the spec in [03 §5](03-tinder-swipe-audit.md).
4. T1 line icon family (replaces Ionicons gradually).
5. Image pipeline (`expo-image`) for photo-first cards.
6. T2 dimensional families (largest production cost).
7. Glass/blur treatments and dark mode.
