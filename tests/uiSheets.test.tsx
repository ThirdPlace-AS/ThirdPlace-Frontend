import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { Overlay, Sheet, SHEET_RADIUS } from "@/components/ui";

describe("Sheet", () => {
  it("shows title and content while visible and closes from the scrim", () => {
    const onClose = jest.fn();
    render(
      <Sheet visible onClose={onClose} title="Rapporter">
        <Text>Innhold</Text>
      </Sheet>,
    );
    expect(screen.getByText("Rapporter")).toBeTruthy();
    expect(screen.getByText("Innhold")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Lukk" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("unmounts its content after closing", () => {
    const { rerender } = render(
      <Sheet visible onClose={() => {}} title="Filtre">
        <Text>Innhold</Text>
      </Sheet>,
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
    );
    // scrim + header close
    expect(screen.getAllByRole("button", { name: "Lukk" })).toHaveLength(2);
  });

  it("uses the 28 px sheet radius token", () => {
    expect(SHEET_RADIUS).toBe(28);
  });
});

describe("Overlay", () => {
  it("renders children only while open", () => {
    const { rerender } = render(
      <Overlay visible onClose={() => {}}>
        <Text>Søk</Text>
      </Overlay>,
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
