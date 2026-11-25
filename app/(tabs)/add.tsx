import { GuestPage } from "@/components/GuestPage";
import { AddWizard } from "@/features/add/AddWizard";

// Add tab: a one-decision-per-screen creation wizard. BLOCKED_CONTRACT_GAP:
// nothing is persisted (no backend / canonical entity); the end state confirms
// in product voice (founder decision 2026-11-06).
// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Legg til"
      message="Logg inn for å legge til en opplevelse, en gruppe eller et sted."
      action="legge til noe"
      tab
    >
      <AddWizard />
    </GuestPage>
  );
}
