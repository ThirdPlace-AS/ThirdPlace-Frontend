import { Badge } from "@/components/ui/Badge";

// Marks UI whose action is a non-functional demo (no backend). Keeps the app
// honest: mock actions never masquerade as real services.
export function DemoBadge({ label = "DEMO" }: { label?: string }) {
  return <Badge label={label} tone="neutral" />;
}
