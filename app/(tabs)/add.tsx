import { AddWizard } from "@/features/add/AddWizard";

// Add tab: a one-decision-per-screen creation wizard. BLOCKED_CONTRACT_GAP:
// nothing is persisted (no backend / canonical entity); the end state confirms
// in product voice (founder decision 2026-11-06).
export default function AddScreen() {
  return <AddWizard />;
}
