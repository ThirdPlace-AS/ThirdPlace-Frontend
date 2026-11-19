import { Redirect, useRootNavigationState } from "expo-router";

import { hasRoute } from "@/lib/navigation";

// thirdplace://i/<code> (Phase 15): a personal invite link from Inviter
// venner. Someone opening the app from it starts at Welcome; someone already
// in the app (the tabs are in the history) stays in it, on the map. The code
// itself does nothing: invite rewards and referral tracking are off until a
// policy enables them (BLOCKED_CONTRACT_GAP).
export default function InviteCodeScreen() {
  const inApp = hasRoute(useRootNavigationState(), "(tabs)");
  return <Redirect href={inApp ? "/map" : "/welcome"} />;
}
