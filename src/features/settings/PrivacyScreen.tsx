import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";

import { ListRow, Screen } from "@/components/ui";
import { RouteHeader } from "@/components/RouteHeader";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";

import { ExportSheet } from "./ExportSheet";
import { FindYouRows, SeeYouRows, SharingRows } from "./privacyRows";
import { NavRow, SettingsSection } from "./settingsUi";

// Personvern (PDF p19, p21). Phase 18 (founder, screen benchmark): the
// p19 SYNLIGHET rows are grouped by question, "Hvem kan se deg" and "Hvem
// kan finne og kontakte deg" (with Blokkerte brukere, moved up from DATA),
// and a "Personvernsjekk" walks through them one group at a time. DATADELING
// (p21 "Data og personvern": Del aktivitet med venner, Personalisert innhold,
// Analytiske data; no hints, since what each one changes is not specified)
// and DATA (GDPR: Last ned dine data, Slett konto) stay as drawn. The
// switches are one in-memory store (src/lib/privacyPrefs.ts) and write
// nothing; nothing is exported or deleted.
// BLOCKED_CONTRACT_GAP: no consent store, visibility gate, export or deletion
// backend — the real visibility/consent model is not certified.
export default function PrivacyScreen() {
  const [exportOpen, setExportOpen] = useState(false);
  // Account actions; guests get the sign-in prompt instead.
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState<string | null>(null);
  const gated = (action: string, open: () => void) => () =>
    isGuest ? setSignIn(action) : open();

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Personvern" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <ListRow
          variant="card"
          icon="shield-checkmark-outline"
          title="Personvernsjekk"
          subtitle="Gå gjennom hvem som ser deg og hva du deler"
          onPress={gated("gå gjennom personvernet", () =>
            router.push("/settings/privacy-check" as Href),
          )}
        />

        <SettingsSection title="Hvem kan se deg">
          <SeeYouRows />
        </SettingsSection>

        <SettingsSection title="Hvem kan finne og kontakte deg">
          <FindYouRows
            onBlocked={gated("administrere dataene dine", () =>
              router.push("/settings/blocked" as Href),
            )}
          />
        </SettingsSection>

        <SettingsSection title="Datadeling">
          <SharingRows />
        </SettingsSection>

        <SettingsSection title="Data">
          <NavRow
            icon="download-outline"
            label="GDPR: Last ned dine data"
            onPress={gated("administrere dataene dine", () =>
              setExportOpen(true),
            )}
          />
          <NavRow
            icon="trash-outline"
            label="Slett konto"
            danger
            onPress={gated("administrere dataene dine", () =>
              router.push("/settings/delete" as Href),
            )}
          />
        </SettingsSection>
      </ScrollView>

      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} />
      <SignInPrompt
        visible={signIn !== null}
        onClose={() => setSignIn(null)}
        action={signIn ?? ""}
      />
    </Screen>
  );
}
