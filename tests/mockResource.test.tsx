// useMockResource: the map opens without a fake wait (immediate), while a
// reload still shows "loading" so the loading/error states stay reachable.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMockResource } from "@/hooks/useMockResource";

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe("useMockResource", () => {
  it("loads after the delay by default", () => {
    const { result } = renderHook(() =>
      useMockResource([1, 2], { delayMs: 500 }),
    );
    expect(result.current.status).toBe("loading");
    act(() => jest.advanceTimersByTime(500));
    expect(result.current.status).toBe("success");
  });

  it("resolves the first load at once with immediate, reload still loads", () => {
    const { result } = renderHook(() =>
      useMockResource([1, 2], { delayMs: 500, immediate: true }),
    );
    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual([1, 2]);
    act(() => result.current.reload());
    expect(result.current.status).toBe("loading");
    act(() => jest.advanceTimersByTime(500));
    expect(result.current.status).toBe("success");
  });

  it("still reports an error when asked to", () => {
    const { result } = renderHook(() =>
      useMockResource([1], { delayMs: 10, immediate: true, simulate: "error" }),
    );
    expect(result.current.status).toBe("error");
  });
});
