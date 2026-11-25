import { GuestPage } from "@/components/GuestPage";
import { ImportContentScreen } from "@/features/people/ImportAndContacts";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Importer innhold"
      message="Logg inn for å importere innhold."
      action="importere innhold"
    >
      <ImportContentScreen />
    </GuestPage>
  );
}
