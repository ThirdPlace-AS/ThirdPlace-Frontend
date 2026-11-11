// The map page sheet's floating action card shows only when the page is full
// screen (user 2026-11-09: "The floating sticky action section in the map
// details should only show when the screen is full"): it fades in on the
// last stretch of the drag to the top snap and is not touchable or read out
// below it.
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PageActionCard } from "@/components/map/content/PageActionCard";
import {
  atPageTop,
  PAGE_FROM,
  PAGE_SNAP,
  pageReveal,
} from "@/components/map/pageTarget";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({}),
}));
// Reanimated's Jest mock never runs reactions; here one runs once after
// mount, as Reanimated's first run does (previous value null).
jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require("react") as typeof import("react");
  return {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ...require("react-native-reanimated/mock"),
    useReducedMotion: () => false,
    useAnimatedReaction: <T,>(
      prepare: () => T,
      react: (now: T, prev: T | null) => void,
    ) =>
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(() => react(prepare(), null), []),
  };
});

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

// Hidden from screen readers counts as not there for the default queries.
const all = { includeHiddenElements: true } as const;

// The sheet's position as gorhom reports it (peek 0 · mid 1 · full 2).
const at = (index: number) => ({ value: index }) as SharedValue<number>;

function card(kind: "experience" | "place", id: string, index: number) {
  render(
    <PageActionCard
      kind={kind}
      id={id}
      animatedIndex={at(index)}
      bottomPad={12}
      compact={false}
    />,
    { wrapper },
  );
  const node = screen.getByTestId("page-action-card", all);
  return { node, style: StyleSheet.flatten(node.props.style) };
}

describe("page chrome reveal", () => {
  it("is hidden at the peek and mid snaps and full at the top", () => {
    expect(pageReveal(0)).toBe(0);
    expect(pageReveal(1)).toBe(0);
    expect(pageReveal(PAGE_FROM)).toBe(0);
    const halfway = pageReveal((PAGE_FROM + PAGE_SNAP) / 2);
    expect(halfway).toBeGreaterThan(0);
    expect(halfway).toBeLessThan(1);
    expect(pageReveal(PAGE_SNAP)).toBe(1);
    expect(pageReveal(PAGE_SNAP + 0.2)).toBe(1);
  });

  it("is fully opaque where the sheet rests just short of the top", () => {
    // On the device the top snap settled a hair under 2 and a card at 0.95
    // let the page text show through it.
    expect(pageReveal(PAGE_SNAP - 0.01)).toBe(1);
    expect(atPageTop(PAGE_SNAP - 0.01)).toBe(true);
  });

  it("counts as the top snap only once the sheet is there", () => {
    expect(atPageTop(1)).toBe(false);
    expect(atPageTop(1.9)).toBe(false);
    expect(atPageTop(PAGE_SNAP - 0.01)).toBe(true);
    expect(atPageTop(PAGE_SNAP)).toBe(true);
  });
});

describe("PageActionCard", () => {
  it("at the peek: invisible, not touchable, not read out", () => {
    const { node, style } = card("place", "p-klatring-r", 0);
    expect(style.opacity).toBe(0);
    expect(node.props.pointerEvents).toBe("none");
    expect(node.props.importantForAccessibility).toBe("no-hide-descendants");
    expect(screen.queryByText("Samtalen")).toBeNull();
    // The bar stays mounted so it can fade in with the drag.
    expect(screen.getByText("Samtalen", all)).toBeTruthy();
  });

  it("at the mid snap it is still hidden", () => {
    const { node, style } = card("experience", "e1", 1);
    expect(style.opacity).toBe(0);
    expect(node.props.pointerEvents).toBe("none");
    expect(screen.queryByText("Bli med")).toBeNull();
  });

  it("on the full-screen page it shows and takes taps", () => {
    const { node, style } = card("experience", "e1", PAGE_SNAP);
    expect(style.opacity).toBe(1);
    expect(node.props.pointerEvents).toBe("box-none");
    expect(node.props.importantForAccessibility).toBe("auto");
    expect(screen.getByText("Bli med")).toBeTruthy();
  });
});
