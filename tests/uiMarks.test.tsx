// CheckboxMark / RadioMark (src/components/ui/CheckboxMark.tsx) draw exactly
// what the hand-rolled indicators drew before them (P3, base/checkbox).
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { View } from "react-native";

import { CheckboxMark, Icon, RadioMark } from "@/components/ui";

describe("selection marks", () => {
  it("RadioMark is the ink radio glyph, on and off", () => {
    for (const on of [true, false]) {
      expect(render(<RadioMark checked={on} />).toJSON()).toEqual(
        render(
          <Icon
            name={on ? "radio-button-on" : "radio-button-off"}
            size="lg"
            tone="ink"
          />,
        ).toJSON(),
      );
    }
  });

  it("CheckboxMark is the square box, with a check only when on", () => {
    for (const on of [true, false]) {
      expect(render(<CheckboxMark checked={on} />).toJSON()).toEqual(
        render(
          <View
            className={`h-6 w-6 items-center justify-center rounded-xs border ${
              on ? "border-ink bg-ink" : "border-line bg-surface"
            }`}
          >
            {on ? <Icon name="checkmark" size="sm" tone="onInk" /> : null}
          </View>,
        ).toJSON(),
      );
    }
  });
});
