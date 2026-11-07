// Phase 15: device settings (Kartlag choice, Tilgjengelighet) survive a
// restart through AsyncStorage; nothing else is stored.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  DEFAULT_A11Y_PREFS,
  getA11yPrefs,
  resetA11yPrefs,
  setA11yPrefs,
} from "@/lib/a11yPrefs";
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
  };

beforeEach(async () => {
  resetDeviceSettings();
  await AsyncStorage.clear();
  restoreMapChoice(undefined);
  resetA11yPrefs();
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
    });
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
});
