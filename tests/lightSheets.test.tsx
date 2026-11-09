// Speed pass (0348): opening a pin mounted every hidden sheet and overlay on
// the page (11 on an experience page), each with its presence state, shared
// values and animated styles. A Sheet or Overlay now costs nothing until it
// is first opened, and still animates out when closed.
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { Modal, Text as RNText } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Overlay, Sheet } from "@/components/ui";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

describe("sheets mount on first open", () => {
  it("a Sheet that was never opened renders no Modal", () => {
    const ui = render(
      <Sheet visible={false} onClose={() => {}}>
        <RNText>Innhold</RNText>
      </Sheet>,
      { wrapper },
    );
    expect(ui.UNSAFE_queryAllByType(Modal)).toHaveLength(0);
    ui.rerender(
      <Sheet visible onClose={() => {}}>
        <RNText>Innhold</RNText>
      </Sheet>,
    );
    expect(ui.UNSAFE_queryAllByType(Modal)).toHaveLength(1);
    expect(screen.getByText("Innhold")).toBeTruthy();
    // Closed again: the engine stays (its exit runs), the content goes.
    ui.rerender(
      <Sheet visible={false} onClose={() => {}}>
        <RNText>Innhold</RNText>
      </Sheet>,
    );
    expect(ui.UNSAFE_queryAllByType(Modal)).toHaveLength(1);
    expect(screen.queryByText("Innhold")).toBeNull();
  });

  it("an Overlay that was never opened renders no Modal", () => {
    const ui = render(
      <Overlay visible={false} onClose={() => {}}>
        <RNText>Bilde</RNText>
      </Overlay>,
    );
    expect(ui.UNSAFE_queryAllByType(Modal)).toHaveLength(0);
    ui.rerender(
      <Overlay visible onClose={() => {}}>
        <RNText>Bilde</RNText>
      </Overlay>,
    );
    expect(screen.getByText("Bilde")).toBeTruthy();
  });
});
