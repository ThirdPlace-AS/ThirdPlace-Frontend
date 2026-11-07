import { useMemo, useState } from "react";

import type { MockPlace, TimeWindow } from "@/fixtures";
import { useCreatedVersion } from "@/fixtures/created";

import { resultForMode } from "../services/mapFixtureAdapter";
import type { DiscoveryMode } from "../types/mapPresentation";

// Owns the active discovery mode and resolves it (over the already-filtered
// places + saved ids) into the items the map/list render. Default mode is
// "forYou" per the design (PDF p5). It is a non-personalized DEMO shell
// (DEMO_MODES), so the map marks it as such — nothing is personalized.
export function useMapDiscovery({
  places,
  query,
  savedIds,
  time = null,
  hasSpots = false,
  initial = "forYou",
}: {
  places: MockPlace[];
  query: string;
  savedIds: readonly string[];
  time?: TimeWindow | null;
  hasSpots?: boolean;
  initial?: DiscoveryMode;
}) {
  const [mode, setMode] = useState<DiscoveryMode>(initial);
  // An experience published in Legg til joins the map right away.
  const created = useCreatedVersion();

  const result = useMemo(
    () => resultForMode({ mode, places, query, savedIds, time, hasSpots }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created: the fixture lists grew
    [mode, places, query, savedIds, time, hasSpots, created],
  );

  return { mode, setMode, ...result };
}
