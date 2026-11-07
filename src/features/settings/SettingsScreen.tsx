import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { profile } from "@/fixtures";
import { signOut } from "@/lib/signOut";

import { ExportSheet } from "./ExportSheet";
import { NavRow, SettingsSection } from "./settingsUi";

// Innstillinger, grouped as in the design (PDF p19): KONTO
// (Kontoinformasjon, Koblede kontoer, plus Preferanser: PDF p13 draws that
// page without an entry, so it sits with the account rows) · APP (Varsler,
// Personvern, Språk og region, Tilgjengelighet) · DATA (Eksporter data,
// Hjelp og støtte) · Logg ut.
// Each row opens its PDF sub-screen (p19–p20, p28) as a page (Phase 12 H4c);
// Eksporter data and Logg ut are short confirmations and stay sheets. Every
// toggle is local and persists nothing; nothing is exported, sent or deleted
// (BLOCKED_CONTRACT_GAP — no account, session, preference or support backend).
export default function SettingsScreen() {
  const guest = useGuestMode();
  const [exportOpen, setExportOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signIn, setSignIn] = useState<string | null>(null);

  // Account pages are account-only: guests get the sign-in prompt.
  const gated = (action: string, open: () => void) => () =>
    guest.isGuest ? setSignIn(action) : open();
  const go = (href: string) => () => router.push(href as Href);

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Innstillinger" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <SettingsSection title="Konto">
          <NavRow
            icon="person-outline"
            label="Kontoinformasjon"
            onPress={gated("se kontoinformasjon", go("/settings/account"))}
          />
          <NavRow
            icon="link-outline"
            label="Koblede kontoer"
            onPress={gated("koble kontoer", go("/settings/linked"))}
          />
          <NavRow
            icon="options-outline"
            label="Preferanser"
            onPress={gated("endre preferanser", go("/settings/preferences"))}
          />
          <NavRow
            icon="card-outline"
            label="Betaling"
            onPress={go("/payments")}
          />
        </SettingsSection>

        <SettingsSection title="App">
          <NavRow
            icon="notifications-outline"
            label="Varsler"
            value="På"
            onPress={go("/settings/notifications")}
          />
          <NavRow
            icon="lock-closed-outline"
            label="Personvern"
            onPress={go("/privacy")}
          />
          <NavRow
            icon="globe-outline"
            label="Språk og region"
            value="Norsk"
            onPress={go("/settings/language")}
          />
          <NavRow
            icon="accessibility-outline"
            label="Tilgjengelighet"
            onPress={go("/settings/accessibility")}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <NavRow
            icon="download-outline"
            label="Eksporter data"
            onPress={gated("eksportere data", () => setExportOpen(true))}
          />
          <NavRow
            icon="help-buoy-outline"
            label="Hjelp og støtte"
            onPress={go("/settings/help")}
          />
        </SettingsSection>

        {/* Om (Phase 15): version and licences. Vilkår, Personvernerklæring
            and Retningslinjer join this section when their texts exist. */}
        <SettingsSection title="Om">
          <NavRow
            icon="information-circle-outline"
            label="Om ThirdPlace"
            onPress={go("/settings/about")}
          />
        </SettingsSection>

        <Button
          label={guest.isGuest ? "Logg inn" : "Logg ut"}
          variant="secondary"
          onPress={() =>
            guest.isGuest ? setSignIn("logge inn") : setLogoutOpen(true)
          }
        />

        <Text variant="caption" tone="muted" className="px-1 text-center">
          {profile.memberSince}
        </Text>
      </ScrollView>

      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} />

      <Sheet
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Logg ut"
      >
        <Text variant="label" weight="regular">
          Vil du logge ut av ThirdPlace?
        </Text>

        <View className="mt-1 gap-2">
          <Button
            variant="ink"
            label="Logg ut"
            onPress={() => {
              setLogoutOpen(false);
              signOut();
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
    </Screen>
  );
}
