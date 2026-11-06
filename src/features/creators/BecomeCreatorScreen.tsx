import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Icon, Screen, Text as UIText } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { profile } from "@/fixtures";

// Bli Skaper (DEMO), per the design (PDF p14): the requirements to unlock the
// Skaper role (and with it Dashboard and Marketplace), each with its progress,
// and "Søk om Skaper-rolle". Master spec §10: the real creator criteria are not
// defined, so the three requirements are the design's illustrative copy —
// nothing is evaluated, and applying sends nothing (BLOCKED_CONTRACT_GAP).
export default function BecomeCreatorScreen() {
  const { hosted, required, rating } = profile.creatorPath;
  const [applied, setApplied] = useState(false);
  const reqs = [
    {
      label: `Arranger ${required} opplevelser`,
      meta: `${hosted} av ${required}`,
      progress: hosted / required,
    },
    {
      label: "Gjennomsnittlig vurdering 4.0+",
      meta: `${rating} — oppfylt`,
      progress: 1,
    },
    { label: "Verifisert identitet", meta: "Ikke startet", progress: 0 },
  ];
  const met = reqs.filter((r) => r.progress >= 1).length;

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Bli Skaper" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <UIText variant="caption" tone="muted">
          Oppfyll kravene under for å låse opp Skaper-rollen og få tilgang til
          Dashboard og Marketplace.
        </UIText>

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
                  <UIText variant="body" weight="semibold">
                    {r.label}
                  </UIText>
                  <Text
                    className={`font-normal text-xs ${done ? "text-successText" : "text-muted"}`}
                  >
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

        <View className="rounded-md bg-surfaceMuted p-3">
          <UIText variant="label">
            {met} av {reqs.length} krav oppfylt
          </UIText>
        </View>

        <DemoNote>
          Kravene er eksempler — Skaper-kriteriene er ikke bestemt ennå, og
          ingenting blir vurdert.
        </DemoNote>

        {applied ? (
          <View className="items-center gap-2 rounded-lg bg-surfaceMuted p-5">
            <UIText variant="h2" weight="bold">
              Du er nå Skaper!
            </UIText>
            <UIText variant="caption" tone="muted" className="text-center">
              Slik ser det ut når søknaden er godkjent: Dashboard og Marketplace
              låses opp.
            </UIText>
            <DemoNote>
              Forhåndsvisning — ingen søknad er sendt eller godkjent.
            </DemoNote>
          </View>
        ) : null}

        <Button
          label="Søk om Skaper-rolle"
          variant="ink"
          onPress={() => setApplied(true)}
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
