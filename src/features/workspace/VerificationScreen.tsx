import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, View } from "react-native";

import { GuestLock } from "@/components/GuestLock";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { RouteHeader } from "@/components/RouteHeader";
import {
  Badge,
  Icon,
  Screen,
  Text,
  Pressable as UIPressable,
} from "@/components/ui";
import { businessById } from "@/fixtures";

// Verifisering, per the design (PDF p7): a three-step timeline —
// Innsendt → Under vurdering → Godkjent — and the submitted documents with
// their own status. It is the owner's own screen, so it lives in Arbeidsflate
// → Lokasjoner (user 2026-11-10: a business has one public profile, the place
// page; the business view that used to lead here from the map is gone). A
// verified business shows every step done; one waiting shows the PDF's
// "under vurdering" state. There is no claim/verification backend and nothing
// can be submitted or approved here (BLOCKED_CONTRACT_GAP). Left out from
// p7: the estimated review time and the push-notice line (a service level and
// a notification rule), and the org.nr (no fixture field).
export type StepState = "done" | "current" | "todo";
export type VerificationStep = {
  label: string;
  meta?: string;
  state: StepState;
};
export type VerificationDoc = { name: string; status: "Godkjent" | "Vurderes" };

export function verificationSteps(verified: boolean): VerificationStep[] {
  return [
    { label: "Innsendt", meta: "12. juli 14:32", state: "done" },
    { label: "Under vurdering", state: verified ? "done" : "current" },
    { label: "Godkjent", state: verified ? "done" : "todo" },
  ];
}

export function verificationDocs(verified: boolean): VerificationDoc[] {
  return [
    { name: "Firmaattest.pdf", status: "Godkjent" },
    { name: "Skjønnvilkår.pdf", status: verified ? "Godkjent" : "Vurderes" },
  ];
}

export default function VerificationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isGuest } = useGuestMode();
  const business = id ? businessById(id) : undefined;

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Verifisering" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        {isGuest ? (
          <GuestLock message="Logg inn som bedrift for å se og starte verifisering." />
        ) : !business ? (
          <Text variant="body" tone="muted">
            Fant ikke bedriften.
          </Text>
        ) : (
          <VerificationBody name={business.name} verified={business.verified} />
        )}
      </ScrollView>
    </Screen>
  );
}

function VerificationBody({
  name,
  verified,
}: {
  name: string;
  verified: boolean;
}) {
  const steps = verificationSteps(verified);
  return (
    <>
      <Text variant="label" tone="muted">
        {name}
      </Text>

      <View className="gap-0">
        {steps.map((s, i) => (
          <View
            key={s.label}
            className="flex-row gap-3"
            accessible
            accessibilityLabel={`${s.label}: ${
              s.state === "done"
                ? "fullført"
                : s.state === "current"
                  ? "pågår"
                  : "ikke ennå"
            }`}
          >
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
              {i < steps.length - 1 ? (
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
        <Text variant="label" weight="semibold" accessibilityRole="header">
          Dokumenter
        </Text>
        {verificationDocs(verified).map((d) => (
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

      <UIPressable
        accessibilityRole="link"
        onPress={() => router.push("/settings/support" as Href)}
        hitSlop={8}
        contentClassName="items-center py-2"
      >
        <Text variant="label" weight="semibold" className="underline">
          Trenger du hjelp? Kontakt support
        </Text>
      </UIPressable>
    </>
  );
}
