import { GuestPage } from "@/components/GuestPage";
import InviteScreen from "@/features/people/InviteScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Inviter venner"
      message="Logg inn for å invitere venner."
      action="invitere venner"
    >
      <InviteScreen />
    </GuestPage>
  );
}
