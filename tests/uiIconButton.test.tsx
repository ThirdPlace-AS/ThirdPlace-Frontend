import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { IconButton } from "@/components/ui";

describe("IconButton", () => {
  it("is a labelled button that fires onPress", () => {
    const onPress = jest.fn();
    render(<IconButton icon="close" label="Lukk" onPress={onPress} />);
    fireEvent.press(screen.getByRole("button", { name: "Lukk" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("tops small buttons up to a 44pt touch target", () => {
    render(<IconButton icon="close" label="Lukk" size="sm" />);
    // 36 px visual → 4 px slop each side = 44.
    expect(screen.getByRole("button").props.hitSlop).toBe(4);
  });

  it("needs no slop at 48 px", () => {
    render(<IconButton icon="add" label="Ny" size="lg" />);
    expect(screen.getByRole("button").props.hitSlop).toBe(0);
  });

  it("announces a count badge and caps the visible number", () => {
    render(
      <IconButton icon="notifications-outline" label="Varsler" badge={120} />,
    );
    expect(
      screen.getByRole("button", { name: "Varsler, 120 uleste" }),
    ).toBeTruthy();
    expect(screen.getByText("99+")).toBeTruthy();
  });

  it("does not fire when disabled and reports the state", () => {
    const onPress = jest.fn();
    render(<IconButton icon="add" label="Ny" disabled onPress={onPress} />);
    const btn = screen.getByRole("button");
    fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
    expect(btn.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("reports selected state", () => {
    render(<IconButton icon="options-outline" label="Filter" selected />);
    expect(screen.getByRole("button").props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
