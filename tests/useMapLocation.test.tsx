import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import {
  followUpAllowed,
  locateFly,
} from "@/components/map/hooks/useMapCamera";
import {
  LOCATE_TIMEOUT_MS,
  useMapLocation,
} from "@/components/map/hooks/useMapLocation";
import { MAP_CENTER, AREAS } from "@/fixtures";
import { getOrigin } from "@/lib/origin";
import {
  getUserLocation,
  resetUserLocation,
  setNativeCoord,
  setUserCoord,
} from "@/lib/userLocation";

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
// (what resume and Posisjon's first look read) is mockLastKnown. Posisjon's
// cases set the permission, the fresh fix and whether location is on.
let mockFixAt = 1000;
let mockLastKnown: Pos | null = null;
let mockPermission = "granted";
let mockServicesOn = true;
const FIX: [number, number] = [10.7579, 59.9227];
let mockCurrent: () => Promise<Pos> = async () => ({
  coords: { longitude: FIX[0], latitude: FIX[1], accuracy: 20 },
  timestamp: mockFixAt,
});
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3, High: 4 },
  requestForegroundPermissionsAsync: async () => ({ status: mockPermission }),
  getForegroundPermissionsAsync: async () => ({ status: mockPermission }),
  getCurrentPositionAsync: () => mockCurrent(),
  hasServicesEnabledAsync: async () => mockServicesOn,
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
  jest.useRealTimers();
  mockFixAt = 1000;
  mockLastKnown = null;
  mockPermission = "granted";
  mockServicesOn = true;
  mockCurrent = async () => ({
    coords: { longitude: FIX[0], latitude: FIX[1], accuracy: 20 },
    timestamp: mockFixAt,
  });
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

// R1b (user 2026-11-10: "the location button must take the user to their
// current location"). Lillestrøm: the phone; Grünerløkka (FIX): a fresh fix.
const PHONE: [number, number] = [11.0496, 59.956];

describe("Posisjon (locate)", () => {
  it("flies at once to the map engine's position, then to the fresh fix", async () => {
    setNativeCoord(PHONE);
    const { result } = renderHook(() => useMapLocation());
    const seen: [[number, number], boolean][] = [];
    let out = "";
    await act(async () => {
      out = await result.current.locate((c, fresh) => seen.push([c, fresh]));
    });
    expect(out).toBe("located");
    expect(seen[0]).toEqual([PHONE, false]);
    expect(seen[1]).toEqual([FIX, true]);
    expect(result.current.status).toBe("granted");
    expect(result.current.locating).toBe(false);
  });

  it("uses the phone's recent cached position when nothing is known", async () => {
    mockLastKnown = {
      coords: { longitude: PHONE[0], latitude: PHONE[1], accuracy: 30 },
      timestamp: 500,
    };
    const { result } = renderHook(() => useMapLocation());
    const seen: [number, number][] = [];
    await act(async () => {
      await result.current.locate((c) => seen.push(c));
    });
    expect(seen[0]).toEqual(PHONE);
  });

  it("with no position at all it says so and never offers a default place", async () => {
    mockCurrent = async () => {
      throw new Error("Current location is unavailable");
    };
    mockServicesOn = false;
    const { result } = renderHook(() => useMapLocation());
    const seen: [number, number][] = [];
    let out = "";
    await act(async () => {
      out = await result.current.locate((c) => seen.push(c));
    });
    expect(out).toBe("unavailable");
    expect(seen).toEqual([]);
    expect(result.current.status).toBe("unavailable");
    expect(result.current.locating).toBe(false);
    // Nothing was taken for the phone's position.
    expect(result.current.coord).toBeNull();
    expect(getUserLocation().coord).toBeNull();
  });

  it("a fix that never comes ends after LOCATE_TIMEOUT_MS", async () => {
    jest.useFakeTimers();
    mockCurrent = () => new Promise<Pos>(() => {});
    const { result } = renderHook(() => useMapLocation());
    let out = "";
    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.locate().then((r) => {
        out = r;
      });
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.locating).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(LOCATE_TIMEOUT_MS + 10);
      await done;
    });
    expect(out).toBe("unavailable");
    expect(result.current.locating).toBe(false);
  });

  it("without permission it asks the screen to explain, and moves nothing", async () => {
    mockPermission = "denied";
    setNativeCoord(PHONE);
    const { result } = renderHook(() => useMapLocation());
    const seen: [number, number][] = [];
    let out = "";
    await act(async () => {
      out = await result.current.locate((c) => seen.push(c));
    });
    expect(out).toBe("needs-permission");
    expect(seen).toEqual([]);
  });

  it("after a Hvor area it goes back to the phone, and distances follow", async () => {
    const { result } = renderHook(() => useMapLocation());
    const area = AREAS.find((a) => a.name !== AREAS[0]!.name)!;
    act(() => result.current.selectArea(area));
    expect(getOrigin().coord).toEqual(area.coord);
    await act(async () => {
      await result.current.locate();
    });
    expect(result.current.area).toBeNull();
    expect(result.current.center).toEqual(FIX);
    expect(getOrigin().coord).toEqual(FIX);
  });

  it("a repeat tap starts from the live fix", async () => {
    const { result } = renderHook(() => useMapLocation());
    await act(async () => {
      await result.current.locate();
    });
    // The watch moved the phone since.
    act(() => setUserCoord(PHONE));
    const seen: [number, number][] = [];
    await act(async () => {
      await result.current.locate((c) => seen.push(c));
    });
    expect(seen[0]).toEqual(PHONE);
  });
});

describe("Posisjon's camera", () => {
  it("flies to the first position, eases on only past LOCATE_REFINE_M", () => {
    const flies: [[number, number], number | undefined][] = [];
    let seq = 0;
    const onPosition = locateFly((c, followUp) => {
      flies.push([c, followUp]);
      seq += 1;
      return seq;
    });
    onPosition(PHONE, false);
    // 20 m on: no second move.
    onPosition([PHONE[0], PHONE[1] + 0.00018], true);
    expect(flies).toEqual([[PHONE, undefined]]);
    // A fresh fix far away refines the first fly.
    const far = locateFly((c, followUp) => {
      flies.push([c, followUp]);
      seq += 1;
      return seq;
    });
    flies.length = 0;
    far(PHONE, false);
    far(FIX, true);
    expect(flies).toEqual([
      [PHONE, undefined],
      [FIX, seq - 1],
    ]);
  });

  it("a touch on the map after the fly drops the follow-up (no pull-back)", () => {
    const flownAt = new Map([[1, 1000]]);
    expect(followUpAllowed(undefined, flownAt, 5000)).toBe(true);
    expect(followUpAllowed(1, flownAt, 900)).toBe(true);
    expect(followUpAllowed(1, flownAt, 1500)).toBe(false);
    expect(followUpAllowed(2, flownAt, 0)).toBe(false);
  });
});
