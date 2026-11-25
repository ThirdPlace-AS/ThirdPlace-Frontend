import { GuestPage } from "@/components/GuestPage";
import ListingEditorScreen from "@/features/marketplace/ListingEditorScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Ny listing"
      message="Logg inn for å lage en listing."
      action="lage en listing"
    >
      <ListingEditorScreen />
    </GuestPage>
  );
}
