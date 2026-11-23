import { GuestPage } from "@/components/GuestPage";
import { PaymentStatusScreen } from "@/features/collab/CollabExtras";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Betalingsstatus"
      message="Logg inn for å se betalingsstatusen."
      action="se betalingsstatusen"
    >
      <PaymentStatusScreen />
    </GuestPage>
  );
}
