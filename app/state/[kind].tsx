import { router, useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, View } from "react-native";
import { Icon, Screen, Text, type IconName } from "@/components/ui";
import {
  Illustration,
  type IllustrationName,
} from "@/components/illustrations/Illustration";
import { Button } from "@/components/Button";
import { showToast } from "@/components/Toast";
import { confirmToast } from "@/copy";
import { experienceById } from "@/fixtures";
import { resetTo } from "@/lib/navigation";

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

export default function SystemState() {
  const { kind } = useLocalSearchParams<{ kind: Kind }>();

  return (
    <Screen>
      <ScrollView contentContainerClassName="flex-grow justify-center gap-5 p-gutter">
        {kind === "offline" ? (
          <State
            icon="cloud-offline-outline"
            art="offline"
            title="Du er offline"
            body="Du ser kartet slik det var sist du hadde nett. Prøv igjen når du er tilkoblet."
          >
            <Button
              label="Prøv igjen"
              variant="ink"
              onPress={() => router.back()}
            />
          </State>
        ) : kind === "error" ? (
          <State
            icon="alert-circle-outline"
            art="error"
            title="Noe gikk galt"
            body="Vi klarte ikke å laste dette akkurat nå. Prøv igjen eller gå tilbake til kartet."
          >
            <Button
              label="Prøv igjen"
              variant="ink"
              onPress={() => router.back()}
            />
            <Button
              label="Til kartet"
              variant="secondary"
              onPress={() => resetTo("/map")}
            />
          </State>
        ) : kind === "maintenance" ? (
          <State
            icon="construct-outline"
            art="maintenance"
            title="Vi pusser opp!"
            body="ThirdPlace er nede for vedlikehold. Vi er snart tilbake."
          />
        ) : // PDF p27 "Sjekk status: status.thirdplace.app" is left out: no
        // status page exists.
        kind === "suspended" ? (
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
        ) : kind === "update" ? (
          <State
            icon="rocket-outline"
            art="update"
            title="Oppdatering kreves"
            body="Denne versjonen er for gammel. Oppdater appen for å fortsette."
          >
            <Button
              label="Oppdater nå"
              variant="ember"
              onPress={() =>
                // The store listing (BLOCKED: the app is not published yet).
                void Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.thirdplace.app",
                )
              }
            />
          </State>
        ) : kind === "invite" ? (
          <Invite />
        ) : (
          <State
            icon="help-circle-outline"
            title="Ukjent tilstand"
            body="Denne skjermen finnes ikke."
          >
            <Button
              label="Til kartet"
              variant="ink"
              onPress={() => resetTo("/map")}
            />
          </State>
        )}
      </ScrollView>
    </Screen>
  );
}

function State({
  icon,
  art,
  title,
  body,
  children,
}: {
  icon: IconName;
  /** Illustration for the PDF's art slot (offline, error, maintenance, update). */
  art?: IllustrationName;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="gap-5">
      <View className="items-center gap-3">
        {art ? (
          <Illustration name={art} width={176} />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceMuted">
            <Icon name={icon} size="2xl" tone="ink" />
          </View>
        )}
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
        onPress={() => resetTo("/map")}
      />
    </View>
  );
}
