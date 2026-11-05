import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { experienceById } from "@/fixtures";
import { resetTo } from "@/lib/navigation";
import { colors } from "@/theme";

// System screens (DEMO), per the design (PDF p26–p27): offline, error,
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow justify-center gap-5 p-gutter">
        {kind === "offline" ? (
          <State
            icon="cloud-offline-outline"
            title="Du er offline"
            body="Kartet bruker mellomlagrede fliser. Meldinger og handlinger sendes automatisk når du er på nett igjen."
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
            title="Vi pusser opp!"
            body="ThirdPlace er nede for vedlikehold. Vi er snart tilbake."
          >
            <Text className="text-center text-sm font-semibold text-ember">
              Sjekk status: status.thirdplace.app
            </Text>
          </State>
        ) : kind === "suspended" ? (
          <State
            icon="ban-outline"
            title="Kontoen er suspendert"
            body="Kontoen din er midlertidig suspendert på grunn av brudd på retningslinjene våre."
          >
            <View className="gap-1 rounded-md border border-line bg-surface p-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
                Hva kan du gjøre
              </Text>
              <Text className="text-sm font-semibold text-ink">Send klage</Text>
              <Text className="text-xs text-muted">
                Vi gjennomgår saken og svarer deg.
              </Text>
            </View>
            <Button label="Send klage" variant="ink" disabled />
          </State>
        ) : kind === "update" ? (
          <State
            icon="rocket-outline"
            title="Oppdatering kreves"
            body="En ny versjon av ThirdPlace er tilgjengelig med viktige forbedringer og sikkerhetsfikser."
          >
            <Button label="Oppdater nå" variant="ember" disabled />
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
        <DemoNote>
          Systemskjerm vist for gjennomgang — ingen reell status er sjekket.
        </DemoNote>
      </ScrollView>
    </SafeAreaView>
  );
}

function State({
  icon,
  title,
  body,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="gap-5">
      <View className="items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceMuted">
          <Ionicons name={icon} size={36} color={colors.ink} />
        </View>
        <Text className="text-center text-2xl font-bold text-ink">{title}</Text>
        <Text className="px-4 text-center text-base text-muted">{body}</Text>
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
      <Text className="text-center text-xs text-muted">
        thirdplace.app/join/{exp?.id ?? "e1"}
      </Text>
      <Text className="text-center text-2xl font-bold text-ink">
        {exp?.title ?? "Opplevelse"}
      </Text>
      <Text className="text-center text-sm text-muted">{exp?.when}</Text>
      <View className="gap-1 rounded-md border border-line bg-surface p-4">
        <Text className="text-center text-base font-semibold text-ink">
          Du er invitert!
        </Text>
        <Text className="text-center text-sm text-muted">
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
