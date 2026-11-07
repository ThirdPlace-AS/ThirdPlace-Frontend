import { useCallback, useState } from "react";

import type { MapArea } from "../services/bounds";

// "Søk i dette området" (Phase 16, after the section benchmark): once the user
// pans or zooms the map, a pill offers to limit the list to what the map
// shows. The pill only records that the user moved the map: tapping it reads
// the part of the map on screen at that moment (MapboxMap's area reader), so
// a camera move the app makes in between (a selected pin, Posisjon) can never
// leave it searching an old area. The app's own moves never offer it (the
// gesture observer does not report them). The applied area stays until the
// user searches again, chooses "Vis alle", or Posisjon / a Hvor area / a
// "Vis på kartet" link lifts it.
export function useMapArea() {
  // The user moved the map since the last search (shows the pill).
  const [offered, setOffered] = useState(false);
  // The area the list is limited to (null = everything).
  const [area, setArea] = useState<MapArea | null>(null);

  /** A pan, pinch or double-tap zoom by the user came to rest. */
  const moved = useCallback(() => setOffered(true), []);

  /** Limit the list to the area on screen when the pill was tapped. */
  const apply = useCallback((seen: MapArea) => {
    setArea(seen);
    setOffered(false);
  }, []);

  /** Back to everything, and no pill until the user moves the map. */
  const clear = useCallback(() => {
    setArea(null);
    setOffered(false);
  }, []);

  return { area, offered, moved, apply, clear };
}
