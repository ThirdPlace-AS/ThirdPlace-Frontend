// User 2026-11-09 ("Also key taps"): a save or like toggle ticks when it
// turns on, never when it turns off.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { HeartToggle } from "@/components/ui";

const mockToggleOn = jest.fn();
jest.mock("@/lib/haptics", () => ({
  haptics: {
    toggleOn: () => mockToggleOn(),
    selection: () => {},
    tap: () => {},
    longPress: () => {},
    success: () => {},
  },
}));

describe("save toggle", () => {
  beforeEach(() => {
    mockToggleOn.mockClear();
  });

  it("ticks when it turns on, not when it turns off", () => {
    const onToggle = jest.fn();
    const ui = render(
      <HeartToggle selected={false} onToggle={onToggle} kind="bookmark" />,
    );
    fireEvent.press(screen.getByLabelText("Lagre"));
    expect(mockToggleOn).toHaveBeenCalledTimes(1);
    ui.rerender(<HeartToggle selected onToggle={onToggle} kind="bookmark" />);
    fireEvent.press(screen.getByLabelText("Fjern fra lagret"));
    expect(mockToggleOn).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
