import { router, useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, View } from "react-native";
import { Icon, Screen, Text, type IconName, Button } from "@/components/ui";
import { SystemState } from "@/components/states/SystemState";
import { showToast } from "@/components/Toast";
import { confirmToast } from "@/copy";
import { experienceById } from "@/fixtures";
import NotFoundScreen from "@/features/system/NotFoundScreen";
import { goBackOr, resetTo } from "@/lib/navigation";

// System screens, per the design (PDF p26–p27): offline, error,
// maintenance, suspended account, required update, and the invite landing
// page. In a real build the backend or app shell would route here; in the
// demo they are reachable by deep link (thirdplace://state/<kind>) so the
// designs can be reviewed. No status, version or account check is real
// (BLOCKED_CONTRACT_GAP).
type Kind =
  | "offline"
  | "error"
  | "maintenance"
  | "suspended"
  | "update"
  | "invite";

export default function SystemStateRoute() {
  const { kind } = useLocalSearchParams<{ kind: Kind }>();

  // Review PR-05: one system page (SystemState). Suspended (copy waiting on
  // the founder, docs/decisions/COPY_DRAFT_SUPPORT_2026-11-23.md) and the
  // invite page keep their own layout.
  if (kind === "offline")
    return (
      <SystemState
        art="offline"
        title="Du er offline"
        body="Du ser kartet slik det var sist du hadde nett. Prøv igjen når du er tilkoblet."
        action={{ label: "Prøv igjen", onPress: () => goBackOr() }}
      />
    );
  if (kind === "error")
    return (
      <SystemState
        art="error"
        title="Noe gikk galt"
        body="Prøv igjen om litt."
        action={{ label: "Prøv igjen", onPress: () => goBackOr() }}
        secondary={{ label: "Til kartet", onPress: () => resetTo("/map") }}
      />
    );
  // No "snart tilbake": the app knows no time (no status page either; PDF
  // p27's "Sjekk status" is left out).
  if (kind === "maintenance")
    return (
      <SystemState
        art="maintenance"
        title="Vi pusser opp"
        body="ThirdPlace er nede for vedlikehold."
      />
    );
  if (kind === "update")
    return (
      <SystemState
        art="update"
        title="Oppdatering kreves"
        body="Denne versjonen er for gammel. Oppdater appen for å fortsette."
        back={false}
        action={{
          label: "Oppdater nå",
          // The store listing (BLOCKED: the app is not published yet).
          onPress: () =>
            void Linking.openURL(
              "https://play.google.com/store/apps/details?id=com.thirdplace.app",
            ),
        }}
      />
    );
  if (kind === "suspended" || kind === "invite")
    return (
      <Screen>
        <ScrollView contentContainerClassName="flex-grow justify-center gap-6 p-gutter">
          {kind === "suspended" ? (
            <State
              icon="ban-outline"
              title="Kontoen er suspendert"
              body="Kontoen din er stengt midlertidig fordi du har brutt retningslinjene våre."
            >
              <View className="gap-1 rounded-md border border-line bg-surface p-3">
                <Text variant="title" accessibilityRole="header">
                  Hva kan du gjøre
                </Text>
                <Text variant="label" weight="semibold">
                  Send klage
                </Text>
                <Text variant="caption" tone="muted">
                  Vi gjennomgår saken og svarer deg.
                </Text>
              </View>
              <Button
                label="Send klage"
                variant="ink"
                onPress={() => showToast(confirmToast.complaintSent)}
              />
            </State>
          ) : (
            <Invite />
          )}
        </ScrollView>
      </Screen>
    );
  return <NotFoundScreen />;
}

function State({
  icon,
  title,
  body,
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="gap-6">
      <View className="items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceMuted">
          <Icon name={icon} size="2xl" tone="ink" />
        </View>
        <Text variant="h1" weight="bold" className="text-center">
          {title}
        </Text>
        <Text variant="body" tone="muted" className="px-4 text-center">
          {body}
        </Text>
      </View>
      {children}
    </View>
  );
}

// Invite landing (PDF p26): what a shared invite link opens.
function Invite() {
  const exp = experienceById("e1");
  return (
    <View className="gap-4">
      <Text variant="caption" tone="muted" className="text-center">
        thirdplace.app/join/{exp?.id ?? "e1"}
      </Text>
      <Text variant="h1" className="text-center" accessibilityRole="text">
        {exp?.title ?? "Opplevelse"}
      </Text>
      <Text variant="caption" tone="muted" className="text-center">
        {exp?.when}
      </Text>
      <View className="gap-1 rounded-md border border-line bg-surface p-4">
        <Text variant="body" weight="semibold" className="text-center">
          Du er invitert!
        </Text>
        <Text variant="caption" tone="muted" className="text-center">
          Vert: {exp?.host}
        </Text>
      </View>
      <Button
        label="Åpne i ThirdPlace"
        variant="ember"
        onPress={() => {
          // Opens what the invite names, over the map, so back from it goes
          // to the map (review 2026-11-18 IJ25: it dropped the target).
          resetTo("/map");
          router.push(`/experience/${exp?.id ?? "e1"}`);
        }}
      />
    </View>
  );
}
