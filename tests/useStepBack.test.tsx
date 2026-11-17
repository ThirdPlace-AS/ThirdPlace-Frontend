import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import { useState } from "react";
import { BackHandler } from "react-native";

import { useStepBack } from "@/lib/useStepBack";

// The screen counts as focused: run the focus effect like a plain effect.
jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual<typeof import("react")>("react");
  return { useFocusEffect: (cb: () => void) => useEffect(cb, [cb]) };
});

type Handler = () => boolean | null | undefined;

// Records the hardwareBackPress listeners so a test can press back.
function spyBack() {
  const handlers = new Set<Handler>();
  jest
    .spyOn(BackHandler, "addEventListener")
    .mockImplementation((_event, handler) => {
      handlers.add(handler as Handler);
      return { remove: () => handlers.delete(handler as Handler) };
    });
  // The last listener added runs first, as on Android.
  return () => {
    for (const h of [...handlers].reverse()) if (h()) return true;
    return false;
  };
}

function useWizard(start: number) {
  const [step, setStep] = useState(start);
  useStepBack(step > 0, () => setStep((s) => s - 1));
  return step;
}

describe("useStepBack (0454)", () => {
  it("steps back one step per press and lets the first step through", () => {
    const pressBack = spyBack();
    const { result } = renderHook(() => useWizard(2));
    expect(result.current).toBe(2);

    let handled = false;
    act(() => {
      handled = pressBack();
    });
    expect(handled).toBe(true);
    expect(result.current).toBe(1);

    act(() => {
      handled = pressBack();
    });
    expect(handled).toBe(true);
    expect(result.current).toBe(0);

    act(() => {
      handled = pressBack();
    });
    expect(handled).toBe(false);
    expect(result.current).toBe(0);
  });

  it("stops listening when the screen goes away", () => {
    const pressBack = spyBack();
    const { unmount } = renderHook(() => useWizard(3));
    unmount();
    expect(pressBack()).toBe(false);
  });
});
