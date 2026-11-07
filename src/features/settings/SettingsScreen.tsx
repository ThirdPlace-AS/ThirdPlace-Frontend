import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  ListRow,
  Screen,
  SearchBar,
  Text,
  type IconName,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { profile } from "@/fixtures";
import { signOut } from "@/lib/signOut";

import { ExportSheet } from "./ExportSheet";
import { PAGE_ROWS, searchSettings } from "./settingsIndex";
import { NavRow, SettingsSection } from "./settingsUi";

type Row = {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  /** What the page this row opens holds (search finds it). */
  inside?: readonly string[];
};

// Innstillinger, grouped as in the design (PDF p19): KONTO
// (Kontoinformasjon, Koblede kontoer, plus Preferanser: PDF p13 draws that
// page without an entry, so it sits with the account rows) · APP (Varsler,
// Personvern, Språk og region, Tilgjengelighet) · DATA (Eksporter data,
// Hjelp og støtte) · Logg ut.
// Each row opens its PDF sub-screen (p19–p20, p28) as a page (Phase 12 H4c);
// Eksporter data and Logg ut are short confirmations and stay sheets. Every
// toggle is local and persists nothing; nothing is exported, sent or deleted
// (BLOCKED_CONTRACT_GAP — no account, session, preference or support backend).
// Phase 18 (founder, screen benchmark): a search field at the top; the same
// rows are the results, plus what each one's page holds (settingsIndex.ts).
export default function SettingsScreen() {
  const guest = useGuestMode();
  const [exportOpen, setExportOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signIn, setSignIn] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Account pages are account-only: guests get the sign-in prompt.
  const gated = (action: string, open: () => void) => () =>
    guest.isGuest ? setSignIn(action) : open();
  const go = (href: string) => () => router.push(href as Href);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "Konto",
      rows: [
        {
          icon: "person-outline",
          label: "Kontoinformasjon",
          inside: PAGE_ROWS.Kontoinformasjon,
          onPress: gated("se kontoinformasjon", go("/settings/account")),
        },
        {
          icon: "link-outline",
          label: "Koblede kontoer",
          onPress: gated("koble kontoer", go("/settings/linked")),
        },
        {
          icon: "options-outline",
          label: "Preferanser",
          inside: PAGE_ROWS.Preferanser,
          onPress: gated("endre preferanser", go("/settings/preferences")),
        },
        { icon: "card-outline", label: "Betaling", onPress: go("/payments") },
      ],
    },
    {
      title: "App",
      rows: [
        {
          icon: "notifications-outline",
          label: "Varsler",
          value: "På",
          inside: PAGE_ROWS.Varsler,
          onPress: go("/settings/notifications"),
        },
        {
          icon: "lock-closed-outline",
          label: "Personvern",
          inside: PAGE_ROWS.Personvern,
          onPress: go("/privacy"),
        },
        {
          icon: "globe-outline",
          label: "Språk og region",
          value: "Norsk",
          inside: PAGE_ROWS["Språk og region"],
          onPress: go("/settings/language"),
        },
        {
          icon: "accessibility-outline",
          label: "Tilgjengelighet",
          inside: PAGE_ROWS.Tilgjengelighet,
          onPress: go("/settings/accessibility"),
        },
      ],
    },
    {
      title: "Data",
      rows: [
        {
          icon: "download-outline",
          label: "Eksporter data",
          onPress: gated("eksportere data", () => setExportOpen(true)),
        },
        {
          icon: "help-buoy-outline",
          label: "Hjelp og støtte",
          inside: PAGE_ROWS["Hjelp og støtte"],
          onPress: go("/settings/help"),
        },
      ],
    },
    // Om (Phase 15): version and licences. Vilkår, Personvernerklæring and
    // Retningslinjer join this section when their texts exist.
    {
      title: "Om",
      rows: [
        {
          icon: "information-circle-outline",
          label: "Om ThirdPlace",
          inside: PAGE_ROWS["Om ThirdPlace"],
          onPress: go("/settings/about"),
        },
      ],
    },
  ];

  const searching = query.trim().length > 0;
  const hits = searchSettings(sections, query);

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Innstillinger" />
      <ScrollView
        contentContainerClassName="gap-5 px-gutter py-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar
          placeholder="Søk i innstillinger"
          accessibilityLabel="Søk i innstillinger"
          value={query}
          onChangeText={setQuery}
        />

        {searching ? (
          hits.length > 0 ? (
            <SettingsSection>
              {hits.map((h) => (
                <View key={h.key} className="border-b border-line">
                  <ListRow
                    icon={h.row.icon}
                    title={h.title}
                    subtitle={h.where}
                    onPress={h.row.onPress}
                  />
                </View>
              ))}
            </SettingsSection>
          ) : (
            <Text variant="label" tone="muted" className="px-1">
              Fant ingen innstillinger for «{query.trim()}».
            </Text>
          )
        ) : (
          <>
            {sections.map((s) => (
              <SettingsSection key={s.title} title={s.title}>
                {s.rows.map((r) => (
                  <NavRow
                    key={r.label}
                    icon={r.icon}
                    label={r.label}
                    value={r.value}
                    onPress={r.onPress}
                  />
                ))}
              </SettingsSection>
            ))}

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
          </>
        )}
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
