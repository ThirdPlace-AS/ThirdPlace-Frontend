// The map page sheet's floating action card shows only when the page is full
// screen (user 2026-11-09: "The floating sticky action section in the map
// details should only show when the screen is full"): it fades in once the
// sheet is at the top snap, not with the drag (0461: it covered the rows
// while the page rose), and is not touchable or read out below it.
import { describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PageActionCard } from "@/components/map/content/PageActionCard";
import {
  atPageTop,
  PAGE_FROM,
  PAGE_SNAP,
  PAGE_SWAP,
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
// mount, as Reanimated's first run does (previous value null). Its shared
// values are new on every render; here one lasts, as a real one does.
jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect, useRef } = require("react") as typeof import("react");
  return {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ...require("react-native-reanimated/mock"),
    useReducedMotion: () => false,
    useSharedValue: <T,>(init: T) => useRef({ value: init }).current,
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

// Its touch and TalkBack state follow once the sheet has stopped (0572): a
// poll checks the position every 120 ms; two ticks let it see a still sheet.
function card(kind: "experience" | "place", id: string, index: number) {
  jest.useFakeTimers();
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
  act(() => {
    jest.advanceTimersByTime(250);
  });
  jest.useRealTimers();
  const node = screen.getByTestId("page-action-card", all);
  return { node, style: StyleSheet.flatten(node.props.style) };
}

describe("page chrome", () => {
  it("swaps the headers inside the page stretch, one after the other", () => {
    // The sheet header fades out over [PAGE_FROM, PAGE_SWAP] and the page
    // top bar fades in over [PAGE_SWAP, PAGE_SNAP] (0461).
    expect(PAGE_SWAP).toBeGreaterThan(PAGE_FROM);
    expect(PAGE_SWAP).toBeLessThan(PAGE_SNAP);
  });

  it("counts a sheet resting just short of the top as the top", () => {
    // On the device the top snap settled a hair under 2.
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

  it("on the way up it stays hidden until the top", () => {
    // A card tied to the drag covered the page rows while it rose (0461).
    const { node, style } = card(
      "experience",
      "e1",
      (PAGE_FROM + PAGE_SNAP) / 2,
    );
    expect(style.opacity).toBe(0);
    expect(node.props.pointerEvents).toBe("none");
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
