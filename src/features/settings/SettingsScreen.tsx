import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { DemoBadge } from "@/components/DemoBadge";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { profile } from "@/fixtures";

import { NavRow, SettingsSection, ToggleRow } from "./settingsUi";

// Settings route (DEMO). Reached from Profile → gear. Every toggle is local and
// persists nothing; account actions gate guests to the demo SignInPrompt.
// BLOCKED_CONTRACT_GAP: no account, session, preferences or notification backend.
export default function SettingsScreen() {
  const guest = useGuestMode();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [nearby, setNearby] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signIn, setSignIn] = useState<string | null>(null);

  const gated = (action: string, run: () => void) => () =>
    guest.isGuest ? setSignIn(action) : run();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Innstillinger" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — innstillinger lagres ikke og nullstilles ved omstart.
          </Text>
        </View>

        <SettingsSection title="Konto">
          <NavRow
            icon="person-outline"
            label="Rediger profil"
            onPress={() => router.back()}
          />
          <NavRow
            icon="mail-outline"
            label="E-post"
            value={guest.isGuest ? "—" : "ola@eksempel.no"}
            onPress={gated("endre e-post", () => {})}
          />
          <NavRow
            icon="link-outline"
            label="Koblede kontoer"
            onPress={gated("koble kontoer", () => {})}
          />
        </SettingsSection>

        <SettingsSection title="Varsler">
          <ToggleRow
            icon="notifications-outline"
            label="Push-varsler"
            hint="Nye invitasjoner, meldinger og svar"
            value={push}
            onValueChange={setPush}
          />
          <ToggleRow
            icon="mail-unread-outline"
            label="E-postvarsler"
            value={email}
            onValueChange={setEmail}
          />
          <ToggleRow
            icon="location-outline"
            label="I nærheten av meg"
            hint="Opplevelser som dukker opp i nabolaget"
            value={nearby}
            onValueChange={setNearby}
          />
        </SettingsSection>

        <SettingsSection title="Personvern og sikkerhet">
          <NavRow
            icon="lock-closed-outline"
            label="Personvern"
            onPress={() => router.push("/privacy")}
          />
          <NavRow
            icon="eye-off-outline"
            label="Blokkerte"
            value="0"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="App">
          <NavRow
            icon="language-outline"
            label="Språk"
            value="Norsk"
            onPress={() => {}}
          />
          <NavRow
            icon="document-text-outline"
            label="Vilkår"
            onPress={() => {}}
          />
          <NavRow
            icon="shield-outline"
            label="Personvernerklæring"
            onPress={() => {}}
          />
          <NavRow
            icon="information-circle-outline"
            label="Om ThirdPlace"
            value="v0 · demo"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection>
          <NavRow
            icon={guest.isGuest ? "log-in-outline" : "log-out-outline"}
            label={guest.isGuest ? "Logg inn" : "Logg ut"}
            danger={!guest.isGuest}
            onPress={() =>
              guest.isGuest ? setSignIn("logge inn") : setLogoutOpen(true)
            }
          />
        </SettingsSection>

        <Text className="px-1 text-center text-[11px] text-muted">
          Medlem siden {profile.memberSince.replace("Medlem siden ", "")} ·
          BLOCKED_CONTRACT_GAP
        </Text>
      </ScrollView>

      <Sheet
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Logg ut"
      >
        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — ingen reell økt avsluttes.
          </Text>
        </View>
        <Text className="text-sm text-ink">Vil du logge ut av ThirdPlace?</Text>
        <View className="mt-1 gap-2">
          <Button
            variant="ink"
            label="Logg ut"
            onPress={() => {
              setLogoutOpen(false);
              router.replace("/");
            }}
          />
          <Button
            variant="secondary"
            label="Avbryt"
            onPress={() => setLogoutOpen(false)}
          />
        </View>
      </Sheet>

      <SignInPrompt
        visible={signIn !== null}
        onClose={() => setSignIn(null)}
        action={signIn ?? ""}
      />
    </SafeAreaView>
  );
}
