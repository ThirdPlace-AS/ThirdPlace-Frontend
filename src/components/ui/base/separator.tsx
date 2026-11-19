// Adapted from React Native Reusables `separator`
// (packages/registry/src/nativewind/components/ui/separator.tsx @ d430e9a),
// reached only through `@/components/ui/Divider` (DESIGN_SYSTEM.md §4 "Base layer").
// Kept: the class. Changed: our `line` colour; horizontal only, and the
// hairline height and inset stay a style in `Divider` (exact under inlineRem).
// No @rn-primitives/separator: it adds only a role our Divider already hides
// from screen readers.

/** The separator's fill. */
export const separatorClass = "bg-line";
