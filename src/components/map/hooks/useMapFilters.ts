import { useCallback, useMemo, useState } from "react";

import { places } from "@/fixtures";

import {
  activeExtraFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  type MapFilters,
} from "../MapFilterSheet";

// Owns search query + applied filters and derives the filtered place list. Pure
// client-side over fixtures (no contract). Extracted from the map screen so the
// screen stays a thin composition.
export function useMapFilters() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);

  const filteredPlaces = useMemo(
    () => applyFilters(places, query, filters),
    [query, filters],
  );
  const extraCount = useMemo(() => activeExtraFilterCount(filters), [filters]);

  const reset = useCallback(() => {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
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
