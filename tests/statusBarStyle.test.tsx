// Focus-aware status bar (fresh-eyes review H2): a screen's light icons must not
// outlive its focus, and a themed panel over a dark screen follows the theme.
import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react-native";

import {
  setStatusBarFallback,
  StatusBarStyle,
  statusBarRequests,
} from "@/components/ui/StatusBarStyle";

const calls: string[] = [];
jest.mock("expo-status-bar", () => ({
  setStatusBarStyle: (s: string) => calls.push(s),
}));
// Focus = mounted, for this test.
jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require("react") as typeof import("react");
  return {
    useFocusEffect: (cb: () => void | (() => void)) => useEffect(cb, [cb]),
  };
});

const last = () => calls[calls.length - 1];

describe("StatusBarStyle", () => {
  it("newest request wins and the theme returns when it goes", () => {
    setStatusBarFallback("dark");
    expect(last()).toBe("dark");

    const swipe = render(<StatusBarStyle style="light" />);
    expect(last()).toBe("light");

    const panel = render(<StatusBarStyle style="auto" />);
    expect(last()).toBe("dark");

    panel.unmount();
    expect(last()).toBe("light");

    swipe.unmount();
    expect(last()).toBe("dark");
    expect(statusBarRequests()).toEqual([]);
  });

  it("themed surfaces follow a scheme change", () => {
    setStatusBarFallback("light");
    expect(last()).toBe("light");
    const s = render(<StatusBarStyle style="dark" />);
    expect(last()).toBe("dark");
    s.unmount();
    expect(last()).toBe("light");
    setStatusBarFallback("dark");
  });
});
