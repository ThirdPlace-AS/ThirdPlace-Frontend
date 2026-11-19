import { router, type Href } from "expo-router";
import { ScrollView, View } from "react-native";
import {
  Icon,
  pageBody,
  Pressable as UIPressable,
  Screen,
  Text,
  Button,
  LINK_SLOP,
} from "@/components/ui";
import { RouteHeader } from "@/components/RouteHeader";
import { profile } from "@/fixtures";

// Bli Skaper, per the design (PDF p14): the requirements to unlock the
// Skaper role (and with it Dashbord and Marketplace). Master spec §10: the real
// creator criteria are not defined, so the three requirements are the design's
// illustrative copy and nothing is evaluated (BLOCKED_CONTRACT_GAP). Review
// 2026-11-18 (G-01 = H-11, #25): no progress ("2 av 3", "oppfylt", bars), no
// "X av Y krav oppfylt" and no "Søk om Skaper-rolle" (it could never be
// pressed) until the criteria and the application exist (G-Q1, H-Q5).
export default function BecomeCreatorScreen() {
  const { required } = profile.creatorPath;
  const reqs: { label: string; next?: { label: string; href: Href } }[] = [
    {
      label: `Arranger ${required} opplevelser`,
      next: { label: "Legg til en opplevelse", href: "/add" as Href },
    },
    { label: "Gjennomsnittlig vurdering 4,0+" },
    {
      label: "Verifisert identitet",
      next: { label: "Start verifisering", href: "/age-verification" as Href },
    },
  ];

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Bli Skaper" />
      <ScrollView contentContainerClassName={pageBody.blocks}>
        <Text variant="caption" tone="muted">
          Kravene under viser veien til Skaper-rollen.
        </Text>

        {reqs.map((r) => {
          const next = r.next;
          return (
            <View
              key={r.label}
              className="gap-2 rounded-md border border-line bg-surface p-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
                  <Icon name="ellipse-outline" size="md" tone="muted" />
                </View>
                <View className="flex-1">
                  <Text variant="body" weight="semibold">
                    {r.label}
                  </Text>
                </View>
              </View>
              {/* Next step for an open requirement (R30). */}
              {next ? (
                <UIPressable
                  accessibilityRole="link"
                  onPress={() => router.push(next.href)}
                  hitSlop={LINK_SLOP}
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
