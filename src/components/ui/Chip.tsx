// Chip (docs/design/DESIGN_SYSTEM.md §4) — the one selectable pill.
// "filled": selected = ink fill (filters, interests, segmented choices).
// "outline": selected = 2 px ink ring, optional icon (map "Filtre" type grids,
// per the PDF video). Replaces <Chip>, <TypeChip> and inline pills.
import { memo } from "react";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export type ChipVariant = "filled" | "outline";
export type ChipSize = "sm" | "md";

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: IconName;
  disabled?: boolean;
  /** "radio" when the chip is one of a single-choice group. */
  role?: "button" | "radio" | "checkbox";
  testID?: string;
};

// Literal class names so Tailwind generates them.
const SHELL: Record<ChipVariant, { on: string; off: string }> = {
  filled: {
    on: "border border-ink bg-ink",
    // PDF (p5 Filtre, p22 Oppdag folk/Filter folk): unselected = grey fill, no visible border.
    off: "border border-surfaceMuted bg-surfaceMuted",
  },
  outline: {
    on: "border-2 border-ink bg-surface",
    off: "border border-line bg-surface",
  },
};
const PAD: Record<ChipSize, string> = { sm: "px-md", md: "px-gutter" };
const HEIGHT: Record<ChipSize, number> = { sm: 32, md: 40 };

export const Chip = memo(function Chip({
  label,
  selected = false,
  onPress,
  variant = "filled",
  size = "md",
  icon,
  disabled,
  role = "button",
  testID,
}: ChipProps) {
  const filledOn = variant === "filled" && selected;
  return (
    <Pressable
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={
        role === "button" ? { selected } : { checked: selected }
      }
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      pressedScale={0.95}
      // A 32 px chip still gets a 44 pt target vertically.
      hitSlop={size === "sm" ? 6 : 2}
      contentClassName={`flex-row items-center gap-sm rounded-full ${PAD[size]} ${
        selected ? SHELL[variant].on : SHELL[variant].off
      }`}
      contentStyle={{ minHeight: HEIGHT[size] }}
    >
      {icon ? (
        <Icon
          name={icon}
          size="md"
          tone={filledOn ? "onInk" : selected ? "ink" : "muted"}
        />
      ) : null}
      <Text
        variant={size === "sm" ? "caption" : "label"}
        weight={selected ? "semibold" : "medium"}
        tone={filledOn ? "inverse" : "ink"}
      >
        {label}
      </Text>
    </Pressable>
  );
});
