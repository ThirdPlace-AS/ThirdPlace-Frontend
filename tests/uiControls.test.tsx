import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { Badge, Button, Chip, Switch } from "@/components/ui";

describe("Button", () => {
  it("ignores presses and reports busy while loading", () => {
    const onPress = jest.fn();
    render(<Button label="Lagre" loading onPress={onPress} />);
    const btn = screen.getByRole("button", { name: "Lagre" });
    fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
    expect(btn.props.accessibilityState).toMatchObject({ busy: true });
  });

  it("reports disabled state", () => {
    render(<Button label="Neste" disabled />);
    expect(
      screen.getByRole("button", { name: "Neste" }).props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });
});

describe("Chip", () => {
  it("reports selected and fires onPress", () => {
    const onPress = jest.fn();
    render(<Chip label="Jazz" selected onPress={onPress} />);
    const chip = screen.getByRole("button", { name: "Jazz" });
    expect(chip.props.accessibilityState).toMatchObject({ selected: true });
    fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("uses checked state for radio chips", () => {
    render(<Chip label="Åpen" role="radio" selected />);
    expect(
      screen.getByRole("radio", { name: "Åpen" }).props.accessibilityState,
    ).toMatchObject({ checked: true });
  });
});

describe("Switch", () => {
  it("is a labelled switch with checked state", () => {
    const onValueChange = jest.fn();
    render(
      <Switch value={false} onValueChange={onValueChange} label="Varsler" />,
    );
    const sw = screen.getByRole("switch", { name: "Varsler" });
    expect(sw.props.accessibilityState).toMatchObject({ checked: false });
    fireEvent(sw, "valueChange", true);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge label="DEMO" />);
    expect(screen.getByText("DEMO")).toBeTruthy();
  });
});
