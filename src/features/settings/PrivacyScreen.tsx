import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";

import { Screen } from "@/components/ui";
import { RouteHeader } from "@/components/RouteHeader";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";

import { ExportSheet } from "./ExportSheet";
import { BLOCKED_COUNT } from "./SettingsPages";
import { NavRow, SettingsSection, ToggleRow } from "./settingsUi";

// Personvern, per the design (PDF p19, p21): SYNLIGHET toggles, DATADELING
// (p21 "Data og personvern": Del aktivitet med venner, Personalisert innhold,
// Analytiske data; no hints, since what each one changes is not specified;
// "Vis profilen for alle" and "Vis på kartet" are the Synlighet rows), then
// DATA — Blokkerte brukere and Slett konto (pages since Phase 12 H4c) and
// GDPR: Last ned dine data (the shared export sheet). Every control is local
// and writes nothing; nothing is exported or deleted.
// BLOCKED_CONTRACT_GAP: no consent store, visibility gate, export or deletion
// backend — the real visibility/consent model is not certified.
export default function PrivacyScreen() {
  const [mapVisible, setMapVisible] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [discoverable, setDiscoverable] = useState(false);
  // PDF p21 "Data og personvern": data sharing (on, on, off as drawn).
  const [shareActivity, setShareActivity] = useState(true);
  const [personalised, setPersonalised] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  // Data actions are account-only; guests get the sign-in prompt instead.
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const gated = (open: () => void) => () =>
    isGuest ? setSignIn(true) : open();

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Personvern" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <SettingsSection title="Synlighet">
          <ToggleRow
            icon="map-outline"
            label="Synlig på kartet"
            hint="Andre kan se at du er innsjekket"
            value={mapVisible}
            onValueChange={setMapVisible}
          />
          <ToggleRow
            icon="person-outline"
            label="Offentlig profil"
            hint="Alle kan se profilen din"
            value={profileVisible}
            onValueChange={setProfileVisible}
          />
          <ToggleRow
            icon="search-outline"
            label="Vis i Utforsk folk"
            hint="Andre kan finne deg basert på felles interesser"
            value={discoverable}
            onValueChange={setDiscoverable}
          />
        </SettingsSection>

        <SettingsSection title="Datadeling">
          <ToggleRow
            icon="people-outline"
            label="Del aktivitet med venner"
            value={shareActivity}
            onValueChange={setShareActivity}
          />
          <ToggleRow
            icon="sparkles-outline"
            label="Personalisert innhold"
            value={personalised}
            onValueChange={setPersonalised}
          />
          <ToggleRow
            icon="analytics-outline"
            label="Analytiske data"
            value={analytics}
            onValueChange={setAnalytics}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <NavRow
            icon="ban-outline"
            label="Blokkerte brukere"
            value={String(BLOCKED_COUNT)}
            onPress={gated(() => router.push("/settings/blocked" as Href))}
          />
          <NavRow
            icon="download-outline"
            label="GDPR: Last ned dine data"
            onPress={gated(() => setExportOpen(true))}
          />
          <NavRow
            icon="trash-outline"
            label="Slett konto"
            danger
            onPress={gated(() => router.push("/settings/delete" as Href))}
          />
        </SettingsSection>
      </ScrollView>

      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} />
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="administrere dataene dine"
      />
    </Screen>
  );
}
