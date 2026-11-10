// User 2026-11-09 ("Also key taps"): a save or like toggle ticks when its
// press turns it on, never when it turns off. Review of the speed pass: a
// guest's press opens the sign-in prompt and saves nothing, so it stays quiet.
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

  it("ticks once its press has turned it on, not when it turns off", () => {
    const onToggle = jest.fn();
    const ui = render(
      <HeartToggle selected={false} onToggle={onToggle} kind="bookmark" />,
    );
    fireEvent.press(screen.getByLabelText("Lagre"));
    ui.rerender(<HeartToggle selected onToggle={onToggle} kind="bookmark" />);
    expect(mockToggleOn).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText("Fjern fra lagret"));
    ui.rerender(
      <HeartToggle selected={false} onToggle={onToggle} kind="bookmark" />,
    );
    expect(mockToggleOn).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("stays quiet when the press saves nothing", () => {
    render(
      <HeartToggle selected={false} onToggle={jest.fn()} kind="bookmark" />,
    );
    fireEvent.press(screen.getByLabelText("Lagre"));
    expect(mockToggleOn).not.toHaveBeenCalled();
  });

  it("stays quiet when something else turns it on", () => {
    const ui = render(<HeartToggle selected={false} onToggle={jest.fn()} />);
    ui.rerender(<HeartToggle selected onToggle={jest.fn()} />);
    expect(mockToggleOn).not.toHaveBeenCalled();
  });
});
