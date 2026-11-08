import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Icon, Screen, Text, Pressable as UIPressable } from "@/components/ui";
import { Button } from "@/components/Button";
import { RouteHeader } from "@/components/RouteHeader";
import { showToast } from "@/components/Toast";
import { confirmToast } from "@/copy";
import { profile } from "@/fixtures";

// Bli Skaper, per the design (PDF p14): the requirements to unlock the
// Skaper role (and with it Dashbord and Marketplace), each with its progress,
// and "Søk om Skaper-rolle". Master spec §10: the real creator criteria are not
// defined, so the three requirements are the design's illustrative copy —
// nothing is evaluated, and applying sends nothing (BLOCKED_CONTRACT_GAP).
export default function BecomeCreatorScreen() {
  const [applied, setApplied] = useState(false);
  const { hosted, required, rating } = profile.creatorPath;
  const reqs = [
    {
      label: `Arranger ${required} opplevelser`,
      meta: `${hosted} av ${required}`,
      progress: hosted / required,
      next: { label: "Legg til en opplevelse", href: "/add" as Href },
    },
    {
      label: "Gjennomsnittlig vurdering 4,0+",
      meta: `${rating} · oppfylt`,
      progress: 1,
    },
    {
      label: "Verifisert identitet",
      meta: "Ikke startet",
      progress: 0,
      next: { label: "Start verifisering", href: "/age-verification" as Href },
    },
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
          const next = "next" in r && !done ? r.next : undefined;
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
              {/* Next step for an open requirement (R30). */}
              {next ? (
                <UIPressable
                  accessibilityRole="link"
                  onPress={() => router.push(next.href)}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  className="self-start"
                  feedback="none"
                >
                  <Text variant="label" weight="semibold" tone="ember">
                    {next.label}
                  </Text>
                </UIPressable>
              ) : null}
            </View>
          );
        })}

        <View className="rounded-md border border-line bg-surface p-3">
          <Text variant="label">
            {met} av {reqs.length} krav oppfylt
          </Text>
        </View>

        {/* Muted until every requirement is met, as in the design (PDF p14):
            the button never invites an application that cannot qualify. An
            application ends at "sent": the spec has no auto-approval and a
            review decides (Phase 15); "Du er nå Skaper!" stays a deep link. */}
        <Button
          label={applied ? "Søknaden er sendt" : "Søk om Skaper-rolle"}
          variant="ink"
          disabled={applied || met < reqs.length}
          onPress={() => {
            setApplied(true);
            showToast(confirmToast.creatorApplied);
          }}
        />
        <Button
          label="Se en skaperprofil"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: "/creator/[id]", params: { id: "u1" } })
          }
        />
        <Button
          label="Se Marketplace"
          variant="secondary"
          onPress={() => router.push("/marketplace" as Href)}
        />
      </ScrollView>
    </Screen>
  );
}
