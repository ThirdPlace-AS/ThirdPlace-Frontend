# 11 — Accessibility & Cross-Platform Acceptance Criteria

Reference date 2026-10-24. These are proposed **acceptance criteria** for any slice that implements the proposals. Target: WCAG 2.2 AA plus platform guidelines.

## Visual

- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24 pt regular / 18.66 pt bold) in light **and** dark. Token pairs in [07 §1](07-tokens-and-components.md) pass by calculation; re-verify on device.
- [ ] Non-text UI (icons, pin rings, focus rings, input borders that carry meaning) ≥ 3:1 against adjacent colours.
- [ ] Text over photos sits on `scrim`; contrast checked against the lightest plausible photo region.
- [ ] Colour is never the only signal: category pins carry a glyph/label; selected chips change fill **and** weight; errors include text.
- [ ] Forbidden pair enforced: white on `#FF4D4D`.

## Text scaling

- [ ] All screens usable at 200% font scale (iOS Dynamic Type XXXL, Android font scale 2.0) with no clipped or overlapping text; layouts wrap or scroll.
- [ ] `maxFontSizeMultiplier` only on tab-bar labels and pin titles (≤ 1.3), documented per use.

## Targets & input

- [ ] Touch targets ≥ 44 × 44 pt (iOS) / 48 × 48 dp (Android), including map controls, chips, swipe action buttons, sheet close.
- [ ] Every gesture has a non-gesture alternative: swipe → visible buttons + `accessibilityActions`; sheet drag → close button; map pan → search/list.
- [ ] Web: swipe card responds to ← (Hopp over), → (Bli med), Backspace (Angre); focus visible; no nested `<button>`.

## Screen readers (VoiceOver / TalkBack)

- [ ] Norwegian `accessibilityLabel` on every icon-only control; decorative T2 objects `accessible={false}` / `importantForAccessibility="no"`.
- [ ] Swipe card announces title, host, time, spots and "Demo"; actions announce result («Hoppet over», «Demo: bli med registrert lokalt»).
- [ ] Focus order follows visual order; opening a sheet moves focus into it; closing returns focus to the trigger.
- [ ] `DemoBadge` and `GuestLock` are read aloud so non-sighted users also know an action is demo-only.

## Motion

- [ ] `useReducedMotion()` honoured: no rotation, parallax, bounce or icon motion; flings become 150-ms crossfades; T2 animations show the final frame.
- [ ] No auto-playing looping animation in idle; nothing flashes > 3 times per second.
- [ ] Haptics are never the only feedback and are skipped silently where the module is unavailable.

## Transparency & materials

- [ ] iOS Reduce Transparency / Increase Contrast → glass becomes opaque `surface` with a `line` border.
- [ ] Android and web glass use `glassFallback`; text on it meets 4.5:1.

## Cross-platform

- [ ] iOS: safe areas, home indicator clearance, large-title behaviour unchanged, Liquid Glass only on iOS 26+ behind an availability check.
- [ ] Android: edge-to-edge with correct insets, back gesture closes the top sheet first, adaptive + themed app icon.
- [ ] Web (`npm run web`, SoftMap path): every proposal renders without native modules; no horizontal scroll at 375 px.
- [ ] Dev build lacking a newer native module degrades gracefully (lazy guarded require).
- [ ] Norwegian strings fit at 200% (Norwegian compounds are long — test «Førstegangsbesøkende», «Tilgjengelighetsfunksjoner»).

## Verification per slice

`npm run typecheck`, `npm run lint`, `npm test` (add tests querying Norwegian labels and accessibility actions), web check at 375 px, Android dev build for native-only items, and a ledger line noting anything native-verify-outstanding.
