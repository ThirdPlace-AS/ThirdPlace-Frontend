import { AddWizard } from "@/features/add/AddWizard";

// Add tab — a one-decision-per-screen creation wizard. DEMO-ONLY: nothing is
// persisted or published (no backend / canonical entity). The flow ends in an
// explicit "ikke publisert" state — it never simulates a real publish.
export default function AddScreen() {
  return <AddWizard />;
}
