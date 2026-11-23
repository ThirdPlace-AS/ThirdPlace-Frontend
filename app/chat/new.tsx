import { GuestPage } from "@/components/GuestPage";
import NewChatScreen from "@/features/chat/NewChatScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Ny chat"
      message="Logg inn for å starte en chat."
      action="starte en chat"
    >
      <NewChatScreen />
    </GuestPage>
  );
}
