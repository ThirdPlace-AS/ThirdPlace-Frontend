import { GuestPage } from "@/components/GuestPage";
import Screen from "@/features/creators/BecomeCreatorScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Bli Skaper"
      message="Logg inn for å bli Skaper."
      action="bli Skaper"
    >
      <Screen />
    </GuestPage>
  );
}
