import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useMapLocation } from "@/components/map/hooks/useMapLocation";
import { MAP_CENTER, AREAS } from "@/fixtures";
import { getUserLocation, resetUserLocation } from "@/lib/userLocation";

// expo-location is required lazily by the hook; a granted phone at
// Grünerløkka with position and compass watches the test can drive.
type Heading = { trueHeading: number; magHeading: number };
const mockPosRemove = jest.fn();
const mockHeadRemove = jest.fn();
const mockWatchPosition = jest.fn();
const mockWatchHeading = jest.fn();
let mockOnHeading: (h: Heading) => void = () => {};
type Pos = {
  coords: { longitude: number; latitude: number; accuracy: number };
  timestamp: number;
};
// The request's fix is taken at mockFixAt; the phone's last known position
// (what resume reads) is mockLastKnown.
let mockFixAt = 1000;
let mockLastKnown: Pos | null = null;
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: async () => ({ status: "granted" }),
  getForegroundPermissionsAsync: async () => ({ status: "granted" }),
  getCurrentPositionAsync: async () => ({
    coords: { longitude: 10.7579, latitude: 59.9227, accuracy: 20 },
    timestamp: mockFixAt,
  }),
  getLastKnownPositionAsync: async () => mockLastKnown,
  watchPositionAsync: async () => {
    mockWatchPosition();
    return { remove: mockPosRemove };
  },
  watchHeadingAsync: async (cb: (h: Heading) => void) => {
    mockWatchHeading();
    mockOnHeading = cb;
    return { remove: mockHeadRemove };
  },
}));

afterEach(() => {
  resetUserLocation();
  jest.clearAllMocks();
  mockFixAt = 1000;
  mockLastKnown = null;
});

describe("useMapLocation", () => {
  it("starts idle, centered on the demo default, no area", () => {
    const { result } = renderHook(() => useMapLocation());
    expect(result.current.status).toBe("idle");
    expect(result.current.center).toEqual(MAP_CENTER);
    expect(result.current.areaLabel).toBeNull();
  });

  it("selecting a manual area centers on it without fabricating GPS", () => {
    const { result } = renderHook(() => useMapLocation());
    const area = AREAS[0]!;
    act(() => result.current.selectArea(area));
    expect(result.current.center).toEqual(area.coord);
    expect(result.current.areaLabel).toBe(area.name);
    expect(result.current.area?.name).toBe(area.name);
    // Manual area is a fallback, not a GPS fix.
    expect(result.current.coord).toBeNull();
  });

  it("compass readings go to the store without rendering the map screen", async () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useMapLocation();
    });
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.coord).toEqual([10.7579, 59.9227]);
    const before = renders;
    act(() => {
      for (let deg = 0; deg < 360; deg += 30)
        mockOnHeading({ trueHeading: deg, magHeading: deg });
    });
    expect(renders).toBe(before);
    expect(getUserLocation().heading).not.toBeNull();
  });

  it("pauses the watches off screen and resumes them on return", async () => {
    const { result } = renderHook(() => useMapLocation());
    await act(async () => {
      await result.current.request();
    });
    expect(mockWatchPosition).toHaveBeenCalledTimes(1);
    expect(mockWatchHeading).toHaveBeenCalledTimes(1);

    act(() => result.current.pause());
    expect(mockPosRemove).toHaveBeenCalledTimes(1);
    expect(mockHeadRemove).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.resume();
    });
    expect(mockWatchPosition).toHaveBeenCalledTimes(2);
    expect(mockWatchHeading).toHaveBeenCalledTimes(2);
  });

  it("after a manual area, returning to the map does not watch again", async () => {
    const { result } = renderHook(() => useMapLocation());
    await act(async () => {
      await result.current.request();
    });
    act(() => result.current.selectArea(AREAS[0]!));
    act(() => result.current.pause());
    await act(async () => {
      result.current.resume();
    });
    expect(mockWatchPosition).toHaveBeenCalledTimes(1);
  });

  // Review of the speed pass: after the map was away, the dot and Posisjon
  // used the fix from before until the watch's first new one arrived.
  it("on return, a newer last known position replaces the old fix", async () => {
    const { result } = renderHook(() => useMapLocation());
    await act(async () => {
      await result.current.request();
    });
    act(() => result.current.pause());
    mockLastKnown = {
      coords: { longitude: 10.8, latitude: 59.95, accuracy: 20 },
      timestamp: mockFixAt + 60_000,
    };
    await act(async () => {
      result.current.resume();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(getUserLocation().coord).toEqual([10.8, 59.95]);
  });

  it("on return, an older last known position leaves the fix", async () => {
    mockFixAt = 90_000;
    const { result } = renderHook(() => useMapLocation());
    await act(async () => {
      await result.current.request();
    });
    act(() => result.current.pause());
    mockLastKnown = {
      coords: { longitude: 10.8, latitude: 59.95, accuracy: 20 },
      timestamp: 30_000,
    };
    await act(async () => {
      result.current.resume();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(getUserLocation().coord).toEqual([10.7579, 59.9227]);
  });
});
