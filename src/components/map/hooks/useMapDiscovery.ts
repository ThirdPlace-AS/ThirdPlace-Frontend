import { useMemo, useState } from "react";

import type { MockPlace, TimeWindow } from "@/fixtures";

import { resultForMode } from "../services/mapFixtureAdapter";
import type { DiscoveryMode } from "../types/mapPresentation";

// Owns the active discovery mode and resolves it (over the already-filtered
// places + saved ids) into the items the map/list render. Default mode is
// "explore" (the only fully non-personalized, non-contract mix).
export function useMapDiscovery({
  places,
  query,
  savedIds,
  time = null,
  initial = "explore",
}: {
  places: MockPlace[];
  query: string;
  savedIds: readonly string[];
  time?: TimeWindow | null;
  initial?: DiscoveryMode;
}) {
  const [mode, setMode] = useState<DiscoveryMode>(initial);

  const result = useMemo(
    () => resultForMode({ mode, places, query, savedIds, time }),
    [mode, places, query, savedIds, time],
  );

  return { mode, setMode, ...result };
}
