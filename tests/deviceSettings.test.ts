// Phase 15: device settings (Kartlag choice, Tilgjengelighet) survive a
// restart through AsyncStorage; Phase 16 adds which one-time hints the phone
// has shown. Nothing else is stored.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  DEFAULT_A11Y_PREFS,
  getA11yPrefs,
  resetA11yPrefs,
  setA11yPrefs,
} from "@/lib/a11yPrefs";
import { getHints, markHintSeen, restoreHints } from "@/lib/hints";
import {
  DEVICE_SETTINGS_KEY,
  hydrateDeviceSettings,
  resetDeviceSettings,
} from "@/lib/deviceSettings";
import {
  DEFAULT_MAP_CHOICE,
  getMapChoice,
  restoreMapChoice,
  setMapType,
} from "@/lib/mapChoice";

const saved = async () =>
  JSON.parse((await AsyncStorage.getItem(DEVICE_SETTINGS_KEY)) ?? "{}") as {
    map?: unknown;
    a11y?: unknown;
    hints?: unknown;
  };

beforeEach(async () => {
  resetDeviceSettings();
  await AsyncStorage.clear();
  restoreMapChoice(undefined);
  resetA11yPrefs();
  restoreHints(undefined);
});

describe("device settings", () => {
  it("restore the saved map choice and switches at start-up", async () => {
    await AsyncStorage.setItem(
      DEVICE_SETTINGS_KEY,
      JSON.stringify({
        map: { mapType: "satellite", style: "style4" },
        a11y: { largerText: true, reduceMotion: false, wheelchairOnly: true },
      }),
    );
    await hydrateDeviceSettings();
    expect(getMapChoice()).toEqual({ mapType: "satellite", style: "style4" });
    expect(getA11yPrefs()).toEqual({
      largerText: true,
      reduceMotion: false,
      wheelchairOnly: true,
    });
  });

  it("keep later changes on the phone", async () => {
    await hydrateDeviceSettings();
    setMapType("terrain");
    setA11yPrefs({ reduceMotion: true });
    await new Promise((r) => setTimeout(r, 0));
    expect(await saved()).toEqual({
      map: { mapType: "terrain", style: null },
      a11y: { ...DEFAULT_A11Y_PREFS, reduceMotion: true },
      hints: { swipeGestures: false },
    });
  });

  it("remember a hint the phone has shown", async () => {
    await hydrateDeviceSettings();
    markHintSeen("swipeGestures");
    await new Promise((r) => setTimeout(r, 0));
    expect((await saved()).hints).toEqual({ swipeGestures: true });
    // A restart: stop saving first, then the in-memory hint starts unseen.
    resetDeviceSettings();
    restoreHints(undefined);
    await hydrateDeviceSettings();
    expect(getHints().swipeGestures).toBe(true);
  });

  it("fall back to defaults for unreadable or unknown values", async () => {
    await AsyncStorage.setItem(DEVICE_SETTINGS_KEY, "{not json");
    await hydrateDeviceSettings();
    expect(getMapChoice()).toEqual(DEFAULT_MAP_CHOICE);
    resetDeviceSettings();
    await AsyncStorage.setItem(
      DEVICE_SETTINGS_KEY,
      JSON.stringify({
        map: { mapType: "moon", style: "x" },
        a11y: { largerText: "yes" },
      }),
    );
    await hydrateDeviceSettings();
    expect(getMapChoice()).toEqual(DEFAULT_MAP_CHOICE);
    expect(getA11yPrefs()).toEqual(DEFAULT_A11Y_PREFS);
  });

  it("a build without the native module starts with the defaults", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("@react-native-async-storage/async-storage", () => {
        throw new Error(
          "[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null.",
        );
      });
      type Mod = typeof import("@/lib/deviceSettings");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ds: Mod = require("@/lib/deviceSettings");
      await expect(ds.hydrateDeviceSettings()).resolves.toBeUndefined();
    });
  });
});
