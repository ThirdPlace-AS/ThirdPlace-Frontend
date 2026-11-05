import { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RouteHeader } from "@/components/RouteHeader";
import { DemoNote } from "@/components/DemoNote";
import { demoCopy } from "@/copy";

import { SettingsSection, ToggleRow } from "./settingsUi";

// Privacy / consent controls (DEMO). Reached from Settings → Personvern. Every
// control is a local toggle that writes nothing. BLOCKED_CONTRACT_GAP: there is
// no consent store, visibility gate, or personalization backend — the real
// visibility/consent model is not certified, so none of this takes effect.
export default function PrivacyScreen() {
  const [mapVisible, setMapVisible] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [shareActivity, setShareActivity] = useState(false);
  const [discoverable, setDiscoverable] = useState(true);
  const [personalize, setPersonalize] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Personvern" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <DemoNote>{demoCopy.privacyNotSaved}</DemoNote>

        <SettingsSection title="Synlighet">
          <ToggleRow
            icon="map-outline"
            label="Vis meg på kartet"
            hint="Naboer kan se omtrentlig område, aldri nøyaktig posisjon"
            value={mapVisible}
            onValueChange={setMapVisible}
          />
          <ToggleRow
            icon="person-outline"
            label="Offentlig profil"
            hint="Naboer kan åpne profilen din"
            value={profileVisible}
            onValueChange={setProfileVisible}
          />
          <ToggleRow
            icon="search-outline"
            label="Synlig i søk"
            value={discoverable}
            onValueChange={setDiscoverable}
          />
        </SettingsSection>

        <SettingsSection title="Aktivitet">
          <ToggleRow
            icon="share-social-outline"
            label="Del at jeg deltar"
            hint="Vis naboer når du blir med på noe"
            value={shareActivity}
            onValueChange={setShareActivity}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <ToggleRow
            icon="sparkles-outline"
            label="Persontilpasning"
            hint="Bruk aktiviteten min til å foreslå steder"
            value={personalize}
            onValueChange={setPersonalize}
          />
          <ToggleRow
            icon="stats-chart-outline"
            label="Del bruksstatistikk"
            value={analytics}
            onValueChange={setAnalytics}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
