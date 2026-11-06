import { router, type Href } from "expo-router";
import { ScrollView, View } from "react-native";
import { Icon, Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { profile } from "@/fixtures";

// Bli Skaper (DEMO), per the design (PDF p14): the requirements to unlock the
// Skaper role (and with it Dashbord and Marketplace), each with its progress,
// and "Søk om Skaper-rolle". Master spec §10: the real creator criteria are not
// defined, so the three requirements are the design's illustrative copy —
// nothing is evaluated, and applying sends nothing (BLOCKED_CONTRACT_GAP).
export default function BecomeCreatorScreen() {
  const { hosted, required, rating } = profile.creatorPath;
  const reqs = [
    {
      label: `Arranger ${required} opplevelser`,
      meta: `${hosted} av ${required}`,
      progress: hosted / required,
    },
    {
      label: "Gjennomsnittlig vurdering 4,0+",
      meta: `${rating} · oppfylt`,
      progress: 1,
    },
    { label: "Verifisert identitet", meta: "Ikke startet", progress: 0 },
  ];
  const met = reqs.filter((r) => r.progress >= 1).length;

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Bli Skaper" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Kravene under viser veien til Skaper-rollen.
        </Text>

        {reqs.map((r) => {
          const done = r.progress >= 1;
          return (
            <View
              key={r.label}
              className="gap-2 rounded-lg border border-line bg-surface p-4"
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-9 w-9 items-center justify-center rounded-full ${
                    done ? "bg-success" : "bg-surfaceMuted"
                  }`}
                >
                  <Icon
                    name={done ? "checkmark" : "ellipse-outline"}
                    size="md"
                    tone={done ? "onInk" : "muted"}
                  />
                </View>
                <View className="flex-1">
                  <Text variant="body" weight="semibold">
                    {r.label}
                  </Text>
                  <Text variant="caption" tone={done ? "success" : "muted"}>
                    {r.meta}
                  </Text>
                </View>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-surfaceMuted">
                <View
                  className={`h-full rounded-full ${done ? "bg-success" : "bg-ink"}`}
                  style={{ width: `${Math.round(r.progress * 100)}%` }}
                />
              </View>
            </View>
          );
        })}

        <View className="rounded-md border border-line bg-surface p-3">
          <Text variant="label">
            {met} av {reqs.length} krav oppfylt
          </Text>
        </View>

        <DemoNote>
          Kravene er eksempler. Kriteriene for Skaper er ikke bestemt, og
          ingenting blir vurdert.
        </DemoNote>


        {/* Muted until every requirement is met, as in the design (PDF p14):
            the button never invites an application that cannot qualify. */}
        <Button
          label="Søk om Skaper-rolle"
          variant="ink"
          disabled={met < reqs.length}
          onPress={() => router.push("/creator-welcome" as Href)}
        />
        <Button
          label="Se en skaperprofil"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: "/creator/[id]", params: { id: "u1" } })
          }
        />
        <Button
          label="Se Marketplace (forhåndsvisning)"
          variant="secondary"
          onPress={() => router.push("/marketplace")}
        />
      </ScrollView>
    </Screen>
  );
}
