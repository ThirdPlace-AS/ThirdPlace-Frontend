import { GuestPage } from "@/components/GuestPage";
import Screen from "@/features/chat/ArchivedChatsScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Arkiverte chatter"
      message="Logg inn for å se chattene dine."
      action="se chattene dine"
    >
      <Screen />
    </GuestPage>
  );
}
