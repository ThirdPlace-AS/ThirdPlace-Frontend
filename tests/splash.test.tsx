// 0466: the splash carries text, so its pink is emberStrong (#E31C5F), never
// ember (#FF385C, text-less fills only), and the native splash matches it.
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import Splash from "../app/index";
import appJson from "../app.json";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useRootNavigationState: () => undefined,
  useFocusEffect: () => {},
}));

describe("Splash", () => {
  it("puts its text on emberStrong, with the native splash the same", () => {
    render(<Splash />);
    const title = screen.getByText("ThirdPlace");
    let node = title.parent;
    let bg: unknown;
    while (node && !bg) {
      bg = StyleSheet.flatten(node.props.style)?.backgroundColor;
      node = node.parent;
    }
    expect(bg).toBe("#E31C5F");
    const plugin = appJson.expo.plugins.find(
      (p) => Array.isArray(p) && p[0] === "expo-splash-screen",
    ) as [string, { backgroundColor: string }];
    expect(plugin[1].backgroundColor).toBe("#E31C5F");
  });
});
