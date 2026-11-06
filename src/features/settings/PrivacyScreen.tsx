import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Pressable, Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { showToastAfterSheet } from "@/components/Toast";
import { confirmToast } from "@/copy";

import { NavRow, SettingsSection, ToggleRow } from "./settingsUi";

// Personvern, per the design (PDF p19, p21): SYNLIGHET toggles, then
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
  // Avblokkér flips the row locally (nothing is sent or stored).
  const [unblocked, setUnblocked] = useState<ReadonlySet<string>>(new Set());
  const toggleBlocked = (name: string) =>
    setUnblocked((s) => {
      const next = new Set(s);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  // Data actions are account-only; guests get the sign-in prompt instead.
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);
  const openPanel = (p: "blocked" | "export" | "delete") => () =>
    isGuest ? setSignIn(true) : setPanel(p);

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
          <Text variant="caption" tone="muted">
            Blokkerte brukere kan ikke se profilen din, sende meldinger eller
            finne deg.
          </Text>
          {BLOCKED.map((b) => (
            <View
              key={b.name}
              className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
            >
              <View className="flex-1">
                <Text variant="label" weight="semibold">
                  {b.name}
                </Text>
                <Text variant="caption" tone="muted">
                  {unblocked.has(b.name)
                    ? "Ikke blokkert"
                    : `${b.why} · ${b.when}`}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  unblocked.has(b.name)
                    ? `Blokker ${b.name} igjen`
                    : `Avblokkér ${b.name}`
                }
                haptic="selection"
                hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
                onPress={() => toggleBlocked(b.name)}
              >
                <Text
                  variant="caption"
                  weight="semibold"
                  tone={unblocked.has(b.name) ? "ink" : "ember"}
                >
                  {unblocked.has(b.name) ? "Angre" : "Avblokkér"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </Sheet>

      <Sheet
        visible={panel === "export"}
        onClose={close}
        title="Eksporter data"
      >
        <View className="gap-3">
          <Text variant="caption" tone="muted">
            Få en kopi av alt ThirdPlace vet om deg (GDPR). Lenken sendes på
            e-post.
          </Text>

          <Button
            label="Be om eksport"
            variant="ink"
            onPress={() => {
              close();
              showToastAfterSheet(confirmToast.exportRequested);
            }}
          />
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

// Slett konto (PDF p21/p27): reason chips + type «SLETT» to confirm.
// BLOCKED_CONTRACT_GAP: nothing is deleted; the confirm closes and confirms.
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
        <Text variant="label" weight="semibold" tone="danger">
          Denne handlingen er permanent og kan ikke angres.
        </Text>
        <View className="gap-1 rounded-md bg-surfaceMuted p-3">
          <Text variant="label" weight="semibold">
            Når du sletter kontoen din:
          </Text>
          <Text variant="caption">• Alle data slettes permanent</Text>
          <Text variant="caption">• Opplevelser du har opprettet fjernes</Text>
          <Text variant="caption">• Meldinger kan ikke gjenopprettes</Text>
        </View>
        <Text variant="label" weight="semibold">
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

        <Button
          label="Slett kontoen min"
          variant="secondary"
          disabled={confirm.trim() !== "SLETT"}
          onPress={() => {
            onClose();
            showToastAfterSheet(confirmToast.accountDeleted);
          }}
        />
        <Button label="Avbryt" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}
