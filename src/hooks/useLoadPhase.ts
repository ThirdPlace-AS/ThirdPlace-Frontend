import { useEffect, useState } from "react";

// Loading rule (founder, 2026-11-06; DESIGN_SYSTEM §4 "Loading"): content
// that arrives within 2 s shows a skeleton; past 2 s the skeleton gives way to
// a loader (spinner + label), so a long wait reads as "still working" rather
// than a frozen layout. `idle` = not loading.
export type LoadPhase = "idle" | "skeleton" | "loader";

export const SKELETON_MAX_MS = 2000;

export function useLoadPhase(
  loading: boolean,
  thresholdMs = SKELETON_MAX_MS,
): LoadPhase {
  // Each loading run gets its own number, so a new run starts as a skeleton
  // again even if the last one ended as a loader.
  const [run, setRun] = useState(0);
  const [wasLoading, setWasLoading] = useState(loading);
  if (loading !== wasLoading) {
    setWasLoading(loading);
    if (loading) setRun((r) => r + 1);
  }
  const [slowRun, setSlowRun] = useState(-1);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setSlowRun(run), thresholdMs);
    return () => clearTimeout(t);
  }, [loading, run, thresholdMs]);

  if (!loading) return "idle";
  return slowRun === run ? "loader" : "skeleton";
}
