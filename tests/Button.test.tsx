import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { Button } from "@/components/Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button label="Logg inn" />);
    expect(screen.getByText("Logg inn")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Button label="Kom i gang" onPress={onPress} />);
    fireEvent.press(screen.getByText("Kom i gang"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", () => {
    const onPress = jest.fn();
    render(<Button label="Av" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText("Av"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
