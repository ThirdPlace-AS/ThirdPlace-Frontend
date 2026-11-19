// Loading rule (founder, 2026-11-06): skeleton while a load is under 2 s,
// loader after; each new load starts as a skeleton again.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { SKELETON_MAX_MS, useLoadPhase } from "@/hooks/useLoadPhase";

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe("useLoadPhase", () => {
  it("is idle when nothing loads", () => {
    const { result } = renderHook(() => useLoadPhase(false));
    expect(result.current).toBe("idle");
  });

  it("shows a skeleton first and a loader after 2 s", () => {
    const { result } = renderHook(() => useLoadPhase(true));
    expect(result.current).toBe("skeleton");
    act(() => jest.advanceTimersByTime(SKELETON_MAX_MS - 1));
    expect(result.current).toBe("skeleton");
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe("loader");
  });

  it("goes idle when the load ends and restarts as a skeleton", () => {
    const { result, rerender } = renderHook(
      ({ loading }: { loading: boolean }) => useLoadPhase(loading),
      { initialProps: { loading: true } },
    );
    act(() => jest.advanceTimersByTime(SKELETON_MAX_MS));
    expect(result.current).toBe("loader");
    rerender({ loading: false });
    expect(result.current).toBe("idle");
    rerender({ loading: true });
    expect(result.current).toBe("skeleton");
  });

  it("never shows the loader when the load ends in time", () => {
    const { result, rerender } = renderHook(
      ({ loading }: { loading: boolean }) => useLoadPhase(loading),
      { initialProps: { loading: true } },
    );
    act(() => jest.advanceTimersByTime(800));
    rerender({ loading: false });
    act(() => jest.advanceTimersByTime(SKELETON_MAX_MS));
    expect(result.current).toBe("idle");
  });
});
