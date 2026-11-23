import { GuestPage } from "@/components/GuestPage";
import { SubmissionsScreen } from "@/features/workspace/PayoutsAndSubmissions";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Innleveringer"
      message="Logg inn for å se innleveringene."
      action="se innleveringene"
    >
      <SubmissionsScreen />
    </GuestPage>
  );
}
