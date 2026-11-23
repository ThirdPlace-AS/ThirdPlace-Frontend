import { GuestPage } from "@/components/GuestPage";
import WriteReviewScreen from "@/features/reviews/WriteReviewScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Skriv en anmeldelse"
      message="Logg inn for å skrive en anmeldelse."
      action="skrive en anmeldelse"
    >
      <WriteReviewScreen />
    </GuestPage>
  );
}
