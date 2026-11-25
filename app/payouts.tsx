import { GuestPage } from "@/components/GuestPage";
import { PayoutsScreen } from "@/features/workspace/PayoutsAndSubmissions";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Utbetalinger"
      message="Logg inn for å se utbetalingene."
      action="se utbetalingene"
    >
      <PayoutsScreen />
    </GuestPage>
  );
}
