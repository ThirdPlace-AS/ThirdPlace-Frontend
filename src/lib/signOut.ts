import { resetBlocked } from "@/lib/blocked";
import { resetMyProfile } from "@/lib/myProfile";
import { resetTo } from "@/lib/navigation";
import { resetPreferences } from "@/lib/preferences";
import { resetSignupProgress } from "@/lib/signupProgress";

/**
 * Logg ut (and Slett konto, which ends the session the same way): a new
 * sign-up starts from the beginning and the next account starts from its own
 * profile, preferences and block list; back can't return to a signed-in
 * screen (resetTo).
 */
export function signOut() {
  resetSignupProgress();
  resetMyProfile();
  resetPreferences();
  resetBlocked();
  resetTo("/welcome");
}
