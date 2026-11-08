// The centre "Legg til" tab (founder 2026-11-08): TikTok's stacked button in
// our colours, the same open or not.
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";

import { ADD_TAB_ICON, AddTabIcon } from "@/components/AddTabIcon";
import { isGlyph } from "@/components/ui/glyphs";
import { brandGradient } from "@/theme";

describe("Legg til tab icon", () => {
  it("stacks an ink face over an ember and a magenta layer", () => {
    const tree = JSON.stringify(render(<AddTabIcon />).toJSON());
    // The magenta layer is the brand gradient's last stop (no raw hex).
    expect(tree).toContain(brandGradient[2]);
    // Face plus both peeking layers, each the face's size.
    const { w, h, peek } = ADD_TAB_ICON;
    expect(tree).toContain(`"width":${w + peek * 2}`);
    expect(
      tree.match(new RegExp(`"width":${w},"height":${h}`, "g")),
    ).toHaveLength(3);
  });

  it("is decoration: the tab button carries the label", () => {
    const json = render(<AddTabIcon />).toJSON() as { props: object } | null;
    expect(json?.props).toMatchObject({ accessible: false });
  });

  it("no longer ships the outline / filled plus glyphs", () => {
    expect(isGlyph("tp-add")).toBe(false);
    expect(isGlyph("tp-add-filled")).toBe(false);
  });
});
