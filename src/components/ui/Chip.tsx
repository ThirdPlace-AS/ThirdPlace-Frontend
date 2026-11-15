// Chip (docs/design/DESIGN_SYSTEM.md §4) — the one selectable pill.
// "filled": selected = ink fill (filters, interests, segmented choices).
// "outline": selected = 2 px ink ring, optional icon (map "Filtre" type grids,
// per the PDF video). Replaces <Chip>, <TypeChip> and inline pills.
// Shell tables: base/toggle.
import { memo } from "react";
import { View } from "react-native";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";
import {
  toggleClass,
  toggleHeight,
  toggleShell,
  type ToggleSize,
  type ToggleVariant,
} from "./base/toggle";

export type ChipVariant = ToggleVariant;
export type ChipSize = ToggleSize;

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
  const shell = toggleClass({ size, shell: toggleShell(variant, selected) });
  const body = (
    <>
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
    </>
  );
  // A plain chip without an action is a label (tags, vibes, interests): no
  // press scale, not announced as a button. Radio/checkbox chips
  // stay controls.
  if (!onPress && role === "button") {
    return (
      <View
        testID={testID}
        accessible
        accessibilityLabel={label}
        className={shell}
        style={{ minHeight: toggleHeight[size] }}
      >
        {body}
      </View>
    );
  }
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
      pressedScale={0.95}
      // A 32 px chip still gets a 44 pt target vertically.
      hitSlop={size === "sm" ? 6 : 2}
      contentClassName={shell}
      contentStyle={{ minHeight: toggleHeight[size] }}
    >
      {body}
    </Pressable>
  );
});
