// The experience detail's pinned join bar and its content read one local
// join state (PDF p6 bar + count in the body).
import { afterEach, describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import {
  resetExperienceJoins,
  useExperienceJoin,
} from "@/components/map/hooks/useExperienceJoin";

afterEach(() => act(() => resetExperienceJoins()));

describe("useExperienceJoin", () => {
  it("starts from the given state and shares changes between readers", () => {
    const bar = renderHook(() => useExperienceJoin("e1", "none"));
    const body = renderHook(() => useExperienceJoin("e1", "none"));
    expect(bar.result.current[0]).toBe("none");
    act(() => bar.result.current[1]("joined"));
    expect(body.result.current[0]).toBe("joined");
  });

  it("keeps experiences apart", () => {
    const a = renderHook(() => useExperienceJoin("e1", "none"));
    const b = renderHook(() => useExperienceJoin("e2", "joined"));
    act(() => a.result.current[1]("waitlisted"));
    expect(a.result.current[0]).toBe("waitlisted");
    expect(b.result.current[0]).toBe("joined");
  });
});
