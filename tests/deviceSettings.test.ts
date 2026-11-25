// Phase 15: device settings (Kartlag choice, Tilgjengelighet) survive a
// restart through AsyncStorage; Phase 16 adds which one-time hints the phone
// has shown; Phase 18 the app version it last ran ("Nytt i ThirdPlace");
// 2026-11-24 Utseende's light/dark choice. Nothing else is stored.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  DEFAULT_A11Y_PREFS,
  getA11yPrefs,
  resetA11yPrefs,
  setA11yPrefs,
} from "@/lib/a11yPrefs";
import {
  DEFAULT_HINTS,
  getHints,
  markHintSeen,
  restoreHints,
} from "@/lib/hints";
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
import { appVersion, restoreWhatsNew } from "@/lib/whatsNew";
import {
  DEFAULT_SCHEME_PREFERENCE,
  getSchemePreference,
  restoreSchemePreference,
  setSchemePreference,
} from "@/theme/scheme";

const saved = async () =>
  JSON.parse((await AsyncStorage.getItem(DEVICE_SETTINGS_KEY)) ?? "{}") as {
    map?: unknown;
    a11y?: unknown;
    hints?: unknown;
    whatsNew?: unknown;
    theme?: unknown;
  };

beforeEach(async () => {
  resetDeviceSettings();
  await AsyncStorage.clear();
  restoreMapChoice(undefined);
  resetA11yPrefs();
  restoreHints(undefined);
  restoreWhatsNew(undefined);
  restoreSchemePreference(undefined);
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
      hints: DEFAULT_HINTS,
      // A first install records its version (src/lib/whatsNew.ts).
      whatsNew: appVersion() ?? undefined,
      theme: "system",
    });
  });

  it("start with the look following the phone", async () => {
    expect(DEFAULT_SCHEME_PREFERENCE).toBe("system");
    await hydrateDeviceSettings();
    expect(getSchemePreference()).toBe("system");
  });

  it("keep the Utseende choice across a restart", async () => {
    await hydrateDeviceSettings();
    setSchemePreference("dark");
    await new Promise((r) => setTimeout(r, 0));
    expect((await saved()).theme).toBe("dark");
    // A restart: stop saving first, then the in-memory choice starts over.
    resetDeviceSettings();
    restoreSchemePreference(undefined);
    expect(getSchemePreference()).toBe("system");
    await hydrateDeviceSettings();
    expect(getSchemePreference()).toBe("dark");
    // Back to the phone's setting is kept too.
    setSchemePreference("system");
    await new Promise((r) => setTimeout(r, 0));
    expect((await saved()).theme).toBe("system");
  });

  it("remember a hint the phone has shown", async () => {
    await hydrateDeviceSettings();
    markHintSeen("swipeGestures");
    await new Promise((r) => setTimeout(r, 0));
    expect((await saved()).hints).toEqual({
      ...DEFAULT_HINTS,
      swipeGestures: true,
    });
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
        theme: "sepia",
      }),
    );
    await hydrateDeviceSettings();
    expect(getMapChoice()).toEqual(DEFAULT_MAP_CHOICE);
    expect(getA11yPrefs()).toEqual(DEFAULT_A11Y_PREFS);
    expect(getSchemePreference()).toBe("system");
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
