// Phase 13 J8: fixes from the spoken TalkBack pass on the emulator.
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { InfoRow } from "@/components/experience/ExperiencePage";
import { backdropA11y, sheetA11yChrome } from "@/components/map/sheetA11y";

describe("TalkBack pass fixes", () => {
  it("an info row is read as one item", () => {
    render(
      <InfoRow
        icon="time-outline"
        title="Ca. 1 time"
        subtitle="Holdes på norsk"
      />,
    );
    expect(screen.getByLabelText("Ca. 1 time, Holdes på norsk")).toBeTruthy();
  });

  it("the map sheets speak Norwegian, never the library's English", () => {
    // The container is not announced (null, so the English default is not
    // used), the handle and background are our own components.
    expect(sheetA11yChrome.accessible).toBe(false);
    expect(sheetA11yChrome.accessibilityLabel).toBeNull();
    expect(sheetA11yChrome.accessibilityRole).toBeNull();
    expect(typeof sheetA11yChrome.handleComponent).toBe("function");
    expect(typeof sheetA11yChrome.backgroundComponent).toBe("function");
    expect(backdropA11y.accessibilityLabel).toBe("Lukk");
    expect(backdropA11y.accessibilityHint).not.toMatch(/bottom sheet/i);
  });
});
