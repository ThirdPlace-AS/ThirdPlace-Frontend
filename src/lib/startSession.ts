import { setGuestMode } from "@/components/map/hooks/useGuestMode";
import { resetTo } from "@/lib/navigation";
import { takeSignInReturn } from "@/lib/signInReturn";

/**
 * The step that signs the user in (Logg inn, the code, the last onboarding
 * step): leave guest mode and land where the guest was when sign-in was
 * asked for (founder 2026-11-19 Q1), else the map. A session boundary, so
 * back can't return to the sign-in screens (resetTo).
 */
export function startSession() {
  setGuestMode(false);
  resetTo(takeSignInReturn());
}
