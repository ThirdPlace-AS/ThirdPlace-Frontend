import { useCallback, useState } from "react";

import type { MapArea } from "../services/bounds";

// "Søk i dette området" (Phase 16, after the section benchmark): once the user
// pans or zooms the map, a pill offers to limit the list to what the map
// shows. Camera moves the app makes itself (the first fitted view, a selected
// pin, Posisjon) never offer it; while the offer is up they only refresh the
// area it would search. The applied area stays until the user searches a new
// one or chooses "Vis alle".
export function useMapArea() {
  // The area the pill would search (null = no pill).
  const [offer, setOffer] = useState<MapArea | null>(null);
  // The area the list is limited to (null = everything).
  const [area, setArea] = useState<MapArea | null>(null);

  /** The map settled; `byUser` when a pan, pinch or rotate moved it. */
  const settled = useCallback((seen: MapArea, byUser: boolean) => {
    if (byUser) setOffer(seen);
    else setOffer((current) => (current ? seen : current));
  }, []);

  /** Limit the list to the offered area; returns it (null if none). */
  const apply = useCallback((): MapArea | null => {
    if (!offer) return null;
    setArea(offer);
    setOffer(null);
    return offer;
  }, [offer]);

  const clear = useCallback(() => setArea(null), []);

  return { area, offer, settled, apply, clear };
}
