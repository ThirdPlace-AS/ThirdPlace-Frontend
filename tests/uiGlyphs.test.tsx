import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";

import { Icon } from "@/components/ui";
import { glyphs, isGlyph } from "@/components/ui/glyphs";

describe("ThirdPlace glyphs", () => {
  it("renders every glyph through Icon", () => {
    for (const name of Object.keys(glyphs) as (keyof typeof glyphs)[]) {
      const { toJSON, unmount } = render(<Icon name={name} size="lg" />);
      expect(toJSON()).toBeTruthy();
      unmount();
    }
  });

  it("only claims the tp- namespace", () => {
    expect(isGlyph("tp-experience")).toBe(true);
    expect(isGlyph("heart-outline")).toBe(false);
    for (const name of Object.keys(glyphs))
      expect(name.startsWith("tp-")).toBe(true);
  });
});
