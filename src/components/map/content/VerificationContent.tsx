import { View } from "react-native";

import { Icon, Text, Badge } from "@/components/ui";
import { GuestLock } from "@/components/GuestLock";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";

// Verifisering, per the design (PDF p7): a three-step timeline —
// Innsendt → Under vurdering → Godkjent — and the submitted documents with
// their own status. Shown in a static "under vurdering" example state; there is
// no claim/verification backend and nothing can be submitted or approved here
// (BLOCKED_CONTRACT_GAP). The earlier "Simuler godkjenning" / "Nullstill"
// controls were invented and are removed.
type StepState = "done" | "current" | "todo";

const STEPS: { label: string; meta?: string; state: StepState }[] = [
  { label: "Innsendt", meta: "12. juli 14:32", state: "done" },
  { label: "Under vurdering", state: "current" },
  { label: "Godkjent", state: "todo" },
];

const DOCS: { name: string; status: "Godkjent" | "Vurderes" }[] = [
  { name: "Firmaattest.pdf", status: "Godkjent" },
  { name: "Skjønnvilkår.pdf", status: "Vurderes" },
];

export function VerificationContent() {
  const { isGuest } = useGuestMode();
  if (isGuest) {
    return (
      <GuestLock message="Logg inn som bedrift for å se og starte verifisering." />
    );
  }
  return (
    <View className="gap-5">
      {/* Honesty first: everything below is an example, not a real claim. */}

      <View className="gap-0">
        {STEPS.map((s, i) => (
          <View key={s.label} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`h-6 w-6 rounded-full ${
                  s.state === "done"
                    ? "bg-success"
                    : s.state === "current"
                      ? "bg-ink"
                      : "bg-line"
                }`}
              />
              {i < STEPS.length - 1 ? (
                <View
                  className="w-0.5 flex-1 bg-line"
                  style={{ minHeight: 28 }}
                />
              ) : null}
            </View>
            <View className="flex-1 pb-4">
              <Text
                variant="body"
                weight={s.state === "todo" ? "regular" : "semibold"}
                tone={s.state === "todo" ? "muted" : "ink"}
              >
                {s.label}
              </Text>
              {s.meta ? (
                <Text variant="caption" tone="muted">
                  {s.meta}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View className="gap-2">
        <Text variant="label" weight="semibold">
          Dokumenter
        </Text>
        {DOCS.map((d) => (
          <View
            key={d.name}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
          >
            <Icon name="document-outline" size="md" tone="ink" />
            <Text variant="label" weight="regular" className="flex-1">
              {d.name}
            </Text>
            <Badge
              kind="status"
              label={d.status}
              tone={d.status === "Godkjent" ? "success" : "warning"}
            />
          </View>
        ))}
      </View>

      <View className="rounded-md bg-surfaceMuted p-3">
        <Text variant="label" weight="regular">
          Verifisering er ikke slått på ennå, så du får ingen beskjed.
        </Text>
      </View>
    </View>
  );
}
