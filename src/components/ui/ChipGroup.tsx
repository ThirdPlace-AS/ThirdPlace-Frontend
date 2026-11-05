// ChipGroup — a wrapping row of Chips with single (radio) or multiple
// (checkbox) selection. Replaces per-screen ChipRow helpers.
import { View } from "react-native";

import { Chip, type ChipSize, type ChipVariant } from "./Chip";

type Common = {
  options: readonly string[];
  size?: ChipSize;
  variant?: ChipVariant;
  /** Accessible name for the group, e.g. "Kategori". */
  label?: string;
};

export type ChipGroupProps =
  | (Common & {
      multiple?: false;
      value: string | null;
      onChange: (next: string) => void;
    })
  | (Common & {
      multiple: true;
      value: readonly string[];
      onChange: (toggled: string) => void;
    });

export function ChipGroup(props: ChipGroupProps) {
  const { options, size, variant, label } = props;
  const isOn = (o: string) =>
    props.multiple ? props.value.includes(o) : props.value === o;
  return (
    <View
      className="flex-row flex-wrap gap-sm"
      accessibilityRole={props.multiple ? undefined : "radiogroup"}
      accessibilityLabel={label}
    >
      {options.map((o) => (
        <Chip
          key={o}
          label={o}
          size={size}
          variant={variant}
          role={props.multiple ? "checkbox" : "radio"}
          selected={isOn(o)}
          onPress={() => props.onChange(o)}
        />
      ))}
    </View>
  );
}
