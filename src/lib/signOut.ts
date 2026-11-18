import { setGuestMode } from "@/components/map/hooks/useGuestMode";
import { resetCreated } from "@/fixtures/created";
import { resetBlocked } from "@/lib/blocked";
import { resetCollabDeal } from "@/lib/collabDeal";
import { resetMyProfile } from "@/lib/myProfile";
import { resetMyRatings } from "@/lib/myRatings";
import { resetTo } from "@/lib/navigation";
import { resetNotificationPrefs } from "@/lib/notificationPrefs";
import { resetPinnedChats } from "@/lib/pinnedChats";
import { resetPreferences } from "@/lib/preferences";
import { resetPrivacyPrefs } from "@/lib/privacyPrefs";
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
  resetPrivacyPrefs();
  resetNotificationPrefs();
  resetPinnedChats();
  resetMyRatings();
  resetCollabDeal();
  // What this account published leaves with it (0464: a new sign-in still
  // owned it and saw Administrer).
  resetCreated();
  // The session ends here (IJ1, review 2026-11-18): until Welcome's choice,
  // the app is a guest, so a deep link to a signed-in screen (profile,
  // plans, chats) shows its guest state, not the last account.
  setGuestMode(true);
  resetTo("/welcome");
}
