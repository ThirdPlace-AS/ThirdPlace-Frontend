// Speed pass (0352): the map pre-renders the Sveip tab once per session, after
// it has had content and nothing changed for a moment (it used to fire at a
// fixed 2 s, just as people started using the map).
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import {
  resetSwipePrefetch,
  SWIPE_PREFETCH_QUIET_MS,
  useSwipePrefetch,
} from "@/components/map/hooks/useSwipePrefetch";

// Called lazily inside the mock, so it is defined by the time it runs.
const mockPrefetch = jest.fn();
jest.mock("expo-router", () => ({
  router: { prefetch: (href: string) => mockPrefetch(href) },
}));

type Props = { ready: boolean; open: string | null; mode: string };
const hook = (initialProps: Props) =>
  renderHook(
    ({ ready, open, mode }: Props) => useSwipePrefetch(ready, open, mode),
    {
      initialProps,
    },
  );

beforeEach(() => {
  jest.useFakeTimers();
  mockPrefetch.mockClear();
  resetSwipePrefetch();
});
afterEach(() => {
  jest.useRealTimers();
});

describe("Sveip pre-render", () => {
  it("waits for content and a quiet map, then runs once", () => {
    const h = hook({ ready: false, open: null, mode: "forYou" });
    act(() => jest.advanceTimersByTime(10_000));
    expect(mockPrefetch).not.toHaveBeenCalled();
    h.rerender({ ready: true, open: null, mode: "forYou" });
    act(() => jest.advanceTimersByTime(SWIPE_PREFETCH_QUIET_MS - 1));
    expect(mockPrefetch).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(mockPrefetch).toHaveBeenCalledWith("/swipe");
    h.rerender({ ready: true, open: null, mode: "trending" });
    act(() => jest.advanceTimersByTime(10_000));
    expect(mockPrefetch).toHaveBeenCalledTimes(1);
  });

  it("does not run while a detail sheet is open, and starts over after", () => {
    const h = hook({ ready: true, open: "place:p1", mode: "forYou" });
    act(() => jest.advanceTimersByTime(10_000));
    expect(mockPrefetch).not.toHaveBeenCalled();
    h.rerender({ ready: true, open: null, mode: "forYou" });
    act(() => jest.advanceTimersByTime(SWIPE_PREFETCH_QUIET_MS));
    expect(mockPrefetch).toHaveBeenCalledTimes(1);
  });

  it("a mode change restarts the wait", () => {
    const h = hook({ ready: true, open: null, mode: "forYou" });
    act(() => jest.advanceTimersByTime(SWIPE_PREFETCH_QUIET_MS - 500));
    h.rerender({ ready: true, open: null, mode: "live" });
    act(() => jest.advanceTimersByTime(SWIPE_PREFETCH_QUIET_MS - 500));
    expect(mockPrefetch).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(500));
    expect(mockPrefetch).toHaveBeenCalledTimes(1);
  });
});
