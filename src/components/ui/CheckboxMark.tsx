// CheckboxMark and RadioMark (docs/design/DESIGN_SYSTEM.md §4) — the box or
// ring that shows a row's choice. Indicators only: put them inside an
// accessible row that owns accessibilityRole "checkbox" / "radio",
// accessibilityState { checked } and the press (the row's label is what a
// screen reader hears). Tables: base/checkbox.
import { View } from "react-native";

import { checkboxClass, radioGlyph } from "./base/checkbox";
import { Icon } from "./Icon";

/** Square ink box with a white check when on (Filtre's checkbox lists). */
export function CheckboxMark({ checked }: { checked: boolean }) {
  return (
    <View className={checkboxClass({ checked })}>
      {checked ? <Icon name="checkmark" size="sm" tone="onInk" /> : null}
    </View>
  );
}

/** Ink radio ring, filled when on (single-choice lists). */
export function RadioMark({ checked }: { checked: boolean }) {
  return (
    <Icon name={radioGlyph[checked ? "on" : "off"]} size="lg" tone="ink" />
  );
}
