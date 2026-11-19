import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal, ScrollView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Overlay, Sheet, SHEET_RADIUS } from "@/components/ui";

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

describe("Sheet", () => {
  it("shows title and content while visible and closes from the scrim", () => {
    const onClose = jest.fn();
    render(
      <Sheet visible onClose={onClose} title="Rapporter">
        <Text>Innhold</Text>
      </Sheet>,
      { wrapper },
    );
    expect(screen.getByText("Rapporter")).toBeTruthy();
    expect(screen.getByText("Innhold")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Lukk" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("system back steps back inside a nested sheet, else closes (0454)", () => {
    const onClose = jest.fn();
    const onBack = jest.fn();
    const { rerender, UNSAFE_getByType } = render(
      <Sheet visible onClose={onClose} onBack={onBack} title="Velg">
        <Text>Innhold</Text>
      </Sheet>,
      { wrapper },
    );
    UNSAFE_getByType(Modal).props.onRequestClose();
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    rerender(
      <Sheet visible onClose={onClose} title="Velg">
        <Text>Innhold</Text>
      </Sheet>,
    );
    UNSAFE_getByType(Modal).props.onRequestClose();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("unmounts its content after closing", () => {
    const { rerender } = render(
      <Sheet visible onClose={() => {}} title="Filtre">
        <Text>Innhold</Text>
      </Sheet>,
      { wrapper },
    );
    rerender(
      <Sheet visible={false} onClose={() => {}} title="Filtre">
        <Text>Innhold</Text>
      </Sheet>,
    );
    expect(screen.queryByText("Innhold")).toBeNull();
  });

  it("gives tall sheets a close button in the header", () => {
    const onClose = jest.fn();
    render(
      <Sheet visible fullHeight onClose={onClose} title="Filtre">
        <Text>Innhold</Text>
      </Sheet>,
      { wrapper },
    );
    // scrim + header close
    expect(screen.getAllByRole("button", { name: "Lukk" })).toHaveLength(2);
  });

  it("scrolls a content sheet inside a capped card; tall sheets own their scroll", () => {
    render(
      <Sheet visible onClose={() => {}} title="Varsler">
        <Text>Innhold</Text>
      </Sheet>,
      { wrapper },
    );
    expect(screen.UNSAFE_getAllByType(ScrollView)).toHaveLength(1);
    screen.unmount();
    render(
      <Sheet visible fullHeight onClose={() => {}} title="Filtre">
        <Text>Innhold</Text>
      </Sheet>,
      { wrapper },
    );
    expect(screen.UNSAFE_queryAllByType(ScrollView)).toHaveLength(0);
  });

  it("uses the 32 px sheet radius token", () => {
    expect(SHEET_RADIUS).toBe(32);
  });
});

describe("Overlay", () => {
  it("renders children only while open", () => {
    const { rerender } = render(
      <Overlay visible onClose={() => {}}>
        <Text>Søk</Text>
      </Overlay>,
      { wrapper },
    );
    expect(screen.getByText("Søk")).toBeTruthy();
    rerender(
      <Overlay visible={false} onClose={() => {}}>
        <Text>Søk</Text>
      </Overlay>,
    );
    expect(screen.queryByText("Søk")).toBeNull();
  });
});
