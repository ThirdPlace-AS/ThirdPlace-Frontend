// Divider — hairline separator in the `line` colour. `inset` indents it to
// align with row content (e.g. past a leading avatar/icon).
import { StyleSheet, View } from "react-native";

import { separatorClass } from "./base/separator";

export function Divider({ inset = 0 }: { inset?: number }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      className={separatorClass}
      style={{ height: StyleSheet.hairlineWidth, marginLeft: inset }}
    />
  );
}
