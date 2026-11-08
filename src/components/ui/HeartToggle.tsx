// HeartToggle (docs/design/DESIGN_SYSTEM.md §5) — the one like/save control.
// Outline → filled ember glyph with a pop when it turns on (no vibration on a
// tap, founder 2026-11-09); turning it off is quiet. Saving is a local store
// action in the demo, so the toggle never claims a server result.

import {
  IconButton,
  type IconButtonSize,
  type IconButtonVariant,
} from "./IconButton";

export type HeartKind = "heart" | "bookmark";

export function HeartToggle({
  selected,
  onToggle,
  kind = "heart",
  variant = "floating",
  size = "md",
  label,
  className,
}: {
  selected: boolean;
  onToggle: () => void;
  kind?: HeartKind;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Defaults to "Lagre" / "Fjern fra lagret". */
  label?: string;
  /** Layout-only classes. */
  className?: string;
}) {
  return (
    <IconButton
      icon={
        selected
          ? kind
          : kind === "heart"
            ? "heart-outline"
            : "bookmark-outline"
      }
      label={label ?? (selected ? "Fjern fra lagret" : "Lagre")}
      tone={selected ? "ember" : undefined}
      variant={variant}
      size={size}
      selected={selected}
      pop={selected}
      className={className}
      onPress={onToggle}
    />
  );
}
