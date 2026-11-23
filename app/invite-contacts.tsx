import { GuestPage } from "@/components/GuestPage";
import { InviteContactsScreen } from "@/features/people/ImportAndContacts";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Inviter kontakter"
      message="Logg inn for å invitere kontakter."
      action="invitere kontakter"
    >
      <InviteContactsScreen />
    </GuestPage>
  );
}
