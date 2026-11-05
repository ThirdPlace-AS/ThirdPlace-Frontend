import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { demoCopy } from "@/copy";

import { NavRow, SettingsSection, ToggleRow } from "./settingsUi";

// Personvern (DEMO), per the design (PDF p19, p21): SYNLIGHET toggles, then
// DATA — Blokkerte brukere, GDPR: Last ned dine data, Slett konto. Every
// control is local and writes nothing; nothing is exported or deleted.
// BLOCKED_CONTRACT_GAP: no consent store, visibility gate, export or deletion
// backend — the real visibility/consent model is not certified.
const BLOCKED = [
  {
    name: "Anonym bruker",
    why: "Upassende meldinger",
    when: "Blokkert 10. juli",
  },
  { name: "SpamKonto42", why: "Spam i gruppechat", when: "Blokkert 28. juni" },
];

export default function PrivacyScreen() {
  const [mapVisible, setMapVisible] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [discoverable, setDiscoverable] = useState(false);
  const [panel, setPanel] = useState<"blocked" | "export" | "delete" | null>(
    null,
  );
  const close = () => setPanel(null);
  // Data actions are account-only; guests get the sign-in prompt instead.
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const openPanel = (p: "blocked" | "export" | "delete") => () =>
    isGuest ? setSignIn(true) : setPanel(p);

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Personvern" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <DemoNote>{demoCopy.privacyNotSaved}</DemoNote>

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

        <SettingsSection title="Data">
          <NavRow
            icon="ban-outline"
            label="Blokkerte brukere"
            value={String(BLOCKED.length)}
            onPress={openPanel("blocked")}
          />
          <NavRow
            icon="download-outline"
            label="GDPR: Last ned dine data"
            onPress={openPanel("export")}
          />
          <NavRow
            icon="trash-outline"
            label="Slett konto"
            danger
            onPress={openPanel("delete")}
          />
        </SettingsSection>
      </ScrollView>

      <Sheet
        visible={panel === "blocked"}
        onClose={close}
        title="Blokkerte brukere"
      >
        <View className="gap-2">
          <Text className="text-sm text-muted font-normal">
            Blokkerte brukere kan ikke se profilen din, sende meldinger eller
            finne deg.
          </Text>
          {BLOCKED.map((b) => (
            <View
              key={b.name}
              className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-ink">{b.name}</Text>
                <Text className="text-xs text-muted font-normal">
                  {b.why} · {b.when}
                </Text>
              </View>
              <Text className="text-xs font-semibold text-emberText">
                Avblokkér
              </Text>
            </View>
          ))}
          <DemoNote>Eksempeldata — ingen blokkering endres.</DemoNote>
        </View>
      </Sheet>

      <Sheet
        visible={panel === "export"}
        onClose={close}
        title="Eksporter data"
      >
        <View className="gap-3">
          <Text className="text-sm text-muted font-normal">
            Få en kopi av alt ThirdPlace vet om deg (GDPR). Lenken sendes på
            e-post.
          </Text>
          <DemoNote>Ingen eksport lages, og ingen e-post sendes.</DemoNote>
          <Button label="Be om eksport" variant="ink" onPress={close} />
        </View>
      </Sheet>

      {/* Mounted only while open, so the typed «SLETT» never survives a close. */}
      {panel === "delete" ? (
        <DeleteAccountSheet visible onClose={close} />
      ) : null}
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="administrere dataene dine"
      />
    </Screen>
  );
}

// Slett konto (PDF p21/p27): reason chips + type «SLETT» to confirm. DEMO —
// nothing is deleted; the confirm button only closes the sheet.
function DeleteAccountSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const reasons = ["Bruker det ikke", "Personvern", "Annen app", "Annet"];
  const [reason, setReason] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  return (
    <Sheet visible={visible} onClose={onClose} title="Slett konto">
      <View className="gap-3">
        <Text className="text-sm font-semibold text-dangerText">
          Denne handlingen er permanent og kan ikke angres.
        </Text>
        <View className="gap-1 rounded-md bg-surfaceMuted p-3">
          <Text className="text-sm font-semibold text-ink">
            Når du sletter kontoen din:
          </Text>
          <Text className="text-xs text-ink font-normal">
            • Alle data slettes permanent
          </Text>
          <Text className="text-xs text-ink font-normal">
            • Opplevelser du har opprettet fjernes
          </Text>
          <Text className="text-xs text-ink font-normal">
            • Meldinger kan ikke gjenopprettes
          </Text>
        </View>
        <Text className="text-sm font-semibold text-ink">
          Hvorfor sletter du?
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {reasons.map((r) => (
            <Chip
              key={r}
              label={r}
              selected={reason === r}
              onPress={() => setReason(r)}
            />
          ))}
        </View>
        <Input
          label="Skriv «SLETT» for å bekrefte"
          value={confirm}
          onChangeText={setConfirm}
          maxLength={10}
        />
        <DemoNote>Ingen konto eller data blir slettet.</DemoNote>
        <Button
          label="Slett kontoen min"
          variant="secondary"
          disabled={confirm.trim() !== "SLETT"}
          onPress={onClose}
        />
        <Button label="Avbryt" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}
