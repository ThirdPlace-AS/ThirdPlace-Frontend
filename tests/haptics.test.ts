// User 2026-11-09: "Add haptic feedback where it makes sense and in the right
// strength" ("Also key taps"). Android uses its own feedback constants, with
// an older one on phones that lack the newer; iOS uses the matching call.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { Platform } from "react-native";

import { haptics } from "@/lib/haptics";

const mockCalls: string[] = [];
jest.mock("expo-haptics", () => ({
  AndroidHaptics: {
    Segment_Tick: "segment-tick",
    Clock_Tick: "clock-tick",
    Toggle_On: "toggle-on",
    Virtual_Key: "virtual-key",
    Long_Press: "long-press",
    Confirm: "confirm",
  },
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
  NotificationFeedbackType: { Success: "success" },
  performAndroidHapticsAsync: (t: string) => {
    mockCalls.push(`android:${t}`);
    return Promise.resolve();
  },
  selectionAsync: () => {
    mockCalls.push("ios:selection");
    return Promise.resolve();
  },
  impactAsync: (s: string) => {
    mockCalls.push(`ios:impact-${s}`);
    return Promise.resolve();
  },
  notificationAsync: (t: string) => {
    mockCalls.push(`ios:notify-${t}`);
    return Promise.resolve();
  },
}));

function on(os: "android" | "ios", version: number) {
  jest.replaceProperty(Platform, "OS", os);
  jest.spyOn(Platform, "Version", "get").mockReturnValue(version);
  mockCalls.length = 0;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("haptics strengths", () => {
  it("uses Android's newest constants where the phone has them", () => {
    on("android", 35);
    haptics.selection();
    haptics.toggleOn();
    haptics.tap();
    haptics.longPress();
    haptics.success();
    expect(mockCalls).toEqual([
      "android:segment-tick",
      "android:toggle-on",
      "android:virtual-key",
      "android:long-press",
      "android:confirm",
    ]);
  });

  it("falls back to older Android constants on older phones", () => {
    on("android", 29);
    haptics.selection();
    haptics.toggleOn();
    haptics.success();
    expect(mockCalls).toEqual([
      "android:clock-tick",
      "android:virtual-key",
      "android:virtual-key",
    ]);
  });

  it("uses the matching iOS calls", () => {
    on("ios", 18);
    haptics.selection();
    haptics.toggleOn();
    haptics.longPress();
    haptics.success();
    expect(mockCalls).toEqual([
      "ios:selection",
      "ios:impact-light",
      "ios:impact-medium",
      "ios:notify-success",
    ]);
  });
});
