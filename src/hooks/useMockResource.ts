import { useCallback, useEffect, useState } from "react";

// Simulates an async resource over STATIC FIXTURES so screens can exercise
// real loading/empty/error UI without a backend. This is demo scaffolding, NOT
// a data contract — no real fetching, caching, or persistence occurs.
export type MockStatus = "loading" | "success" | "empty" | "error";

function outcome(
  simulate: "success" | "empty" | "error",
  length: number,
): MockStatus {
  return simulate === "error"
    ? "error"
    : simulate === "empty" || length === 0
      ? "empty"
      : "success";
}

export function useMockResource<T>(
  data: T[],
  opts: {
    delayMs?: number;
    simulate?: "success" | "empty" | "error";
    /** First load resolves at once (nothing really loads); a reload still
     * passes through "loading" so that state stays reachable. */
    immediate?: boolean;
  } = {},
): { status: MockStatus; data: T[]; reload: () => void } {
  const { delayMs = 600, simulate = "success", immediate = false } = opts;
  // `resolved` is only set inside the timeout; status is derived so we never
  // call setState synchronously inside the effect.
  const [resolved, setResolved] = useState<{
    tick: number;
    status: MockStatus;
  }>(() =>
    immediate
      ? { tick: 0, status: outcome(simulate, data.length) }
      : { tick: -1, status: "loading" },
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setResolved({ tick, status: outcome(simulate, data.length) });
    }, delayMs);
    return () => clearTimeout(t);
  }, [data.length, delayMs, simulate, tick]);

  const status: MockStatus =
    resolved.tick === tick ? resolved.status : "loading";
  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { status, data: status === "success" ? data : [], reload };
}
