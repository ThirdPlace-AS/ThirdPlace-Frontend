// showToast on sonner-native (P4): one toast at a time, 3.5 s or 5 s with an
// action, and the card keeps its alert role, label and action button.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { toast } from "sonner-native";

import { dismissToast, showToast } from "@/components/Toast";

afterEach(() => {
  jest.restoreAllMocks();
  dismissToast();
});

function spies() {
  let n = 0;
  const custom = jest
    .spyOn(toast, "custom")
    .mockImplementation(() => `t${++n}`);
  const dismiss = jest.spyOn(toast, "dismiss").mockImplementation((id) => id);
  return { custom, dismiss };
}

describe("showToast", () => {
  it("shows one toast at a time", () => {
    const { custom, dismiss } = spies();
    showToast({ title: "A" });
    expect(dismiss).not.toHaveBeenCalled();
    showToast({ title: "B" });
    expect(dismiss).toHaveBeenCalledWith("t1");
    expect(custom).toHaveBeenCalledTimes(2);
  });

  it("stays 3.5 s, or 5 s with an action", () => {
    const { custom } = spies();
    showToast({ title: "A" });
    showToast({ title: "B", action: { label: "Angre", onPress: () => {} } });
    expect(custom.mock.calls[0]?.[1]?.duration).toBe(3500);
    expect(custom.mock.calls[1]?.[1]?.duration).toBe(5000);
  });

  it("renders our card: alert with title and body, action closes then runs", () => {
    const { custom, dismiss } = spies();
    const undo = jest.fn();
    showToast({
      title: "Fjernet",
      body: "Fra Lagret",
      action: { label: "Angre", onPress: undo },
    });
    const card = render(custom.mock.calls[0]?.[0] as ReactElement);
    expect(card.getByRole("alert").props.accessibilityLabel).toBe(
      "Fjernet. Fra Lagret",
    );
    fireEvent.press(card.getByLabelText("Angre"));
    expect(dismiss).toHaveBeenCalledWith("t1");
    expect(undo).toHaveBeenCalledTimes(1);
  });
});
