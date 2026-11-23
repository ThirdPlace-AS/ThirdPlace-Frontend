import { GuestPage } from "@/components/GuestPage";
import { ChatInviteScreen } from "@/features/chat/ChatInfoScreens";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Inviter"
      message="Logg inn for å invitere folk."
      action="invitere folk"
    >
      <ChatInviteScreen />
    </GuestPage>
  );
}
