import { useReducedMotion as useSystemReducedMotion } from "react-native-reanimated";

import { useA11yPrefs } from "@/lib/a11yPrefs";

/** Reduced motion when the phone asks for it or Tilgjengelighet's "Reduser
 *  bevegelse" is on (Phase 15). Use this, not Reanimated's hook. */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const { reduceMotion } = useA11yPrefs();
  return system || reduceMotion;
}
