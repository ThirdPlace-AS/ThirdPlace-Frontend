import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";

describe("useGuestMode", () => {
  it("toggles and shares state across consumers", () => {
    const a = renderHook(() => useGuestMode());
    const b = renderHook(() => useGuestMode());
    act(() => a.result.current.setGuest(false));

    expect(a.result.current.isGuest).toBe(false);

    act(() => a.result.current.toggle());
    // Shared store: the second consumer sees the change too.
    expect(a.result.current.isGuest).toBe(true);
    expect(b.result.current.isGuest).toBe(true);

    act(() => b.result.current.setGuest(false));
    expect(a.result.current.isGuest).toBe(false);
  });
});
