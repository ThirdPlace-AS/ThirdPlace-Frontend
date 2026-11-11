import { useCallback, useMemo, useState } from "react";

import { places } from "@/fixtures";
import { getA11yPrefs, useA11yPrefs, withWheelchair } from "@/lib/a11yPrefs";
import { useOrigin } from "@/lib/origin";

import {
  activeExtraFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  type MapFilters,
} from "../services/mapFilters";

// Owns search query + applied filters and derives the filtered place list. Pure
// client-side over fixtures (no contract). Extracted from the map screen so the
// screen stays a thin composition.
export function useMapFilters() {
  const [query, setQuery] = useState("");
  // "Vis kun rullestolvennlige" (Tilgjengelighet) starts the map with the
  // step-free filter on and adds or removes it when switched.
  const { wheelchairOnly } = useA11yPrefs();
  const [filters, setFilters] = useState<MapFilters>(() =>
    withWheelchair(DEFAULT_FILTERS, getA11yPrefs().wheelchairOnly),
  );
  // Adjusted while rendering when the switch changes (React's pattern for
  // state that follows a changing input), not in an effect.
  const [seen, setSeen] = useState(wheelchairOnly);
  if (seen !== wheelchairOnly) {
    setSeen(wheelchairOnly);
    setFilters((f) => withWheelchair(f, wheelchairOnly));
  }

  // Avstand follows the person (Phase 19): a picked area or a real move
  // re-filters. The list's order is set later, once places and experiences
  // are mixed (orderItems).
  const origin = useOrigin();
  const filteredPlaces = useMemo(
    () => applyFilters(places, query, filters, origin),
    [query, filters, origin],
  );
  const extraCount = useMemo(() => activeExtraFilterCount(filters), [filters]);

  const reset = useCallback(() => {
    setQuery("");
    setFilters(withWheelchair(DEFAULT_FILTERS, getA11yPrefs().wheelchairOnly));
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    filteredPlaces,
    extraCount,
    reset,
  };
}
