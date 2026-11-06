import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  Icon,
  Screen,
  type IconName,
  Pressable as UIPressable,
  Text,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { demoCopy } from "@/copy";
import { profile } from "@/fixtures";
import { resetTo } from "@/lib/navigation";

import { NavRow, SettingsSection, ToggleRow } from "./settingsUi";

type Panel =
  | "account"
  | "linked"
  | "notifications"
  | "language"
  | "accessibility"
  | "export"
  | "help"
  | null;

// Innstillinger (DEMO), grouped as in the design (PDF p19): KONTO
// (Kontoinformasjon, Koblede kontoer) · APP (Varsler, Personvern, Språk og
// region, Tilgjengelighet) · DATA (Eksporter data, Hjelp og støtte) · Logg ut.
// Each row opens its PDF sub-screen (p19–p20, p28) as a sheet. Every toggle is
// local and persists nothing; nothing is exported, sent or deleted
// (BLOCKED_CONTRACT_GAP — no account, session, preference or support backend).
export default function SettingsScreen() {
  const guest = useGuestMode();
  const [panel, setPanel] = useState<Panel>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signIn, setSignIn] = useState<string | null>(null);
  const close = () => setPanel(null);

  const gated = (action: string, p: Panel) => () =>
    guest.isGuest ? setSignIn(action) : setPanel(p);

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Innstillinger" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <DemoNote>{demoCopy.settingsNotSaved}</DemoNote>

        <SettingsSection title="Konto">
          <NavRow
            icon="person-outline"
            label="Kontoinformasjon"
            onPress={gated("se kontoinformasjon", "account")}
          />
          <NavRow
            icon="link-outline"
            label="Koblede kontoer"
            onPress={gated("koble kontoer", "linked")}
          />
          <NavRow
            icon="card-outline"
            label="Betaling"
            onPress={() => router.push("/payments")}
          />
        </SettingsSection>

        <SettingsSection title="App">
          <NavRow
            icon="notifications-outline"
            label="Varsler"
            value="På"
            onPress={() => setPanel("notifications")}
          />
          <NavRow
            icon="lock-closed-outline"
            label="Personvern"
            onPress={() => router.push("/privacy")}
          />
          <NavRow
            icon="globe-outline"
            label="Språk og region"
            value="Norsk"
            onPress={() => setPanel("language")}
          />
          <NavRow
            icon="accessibility-outline"
            label="Tilgjengelighet"
            onPress={() => setPanel("accessibility")}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <NavRow
            icon="download-outline"
            label="Eksporter data"
            onPress={gated("eksportere data", "export")}
          />
          <NavRow
            icon="help-buoy-outline"
            label="Hjelp og støtte"
            onPress={() => setPanel("help")}
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
          {profile.memberSince} · demoversjon
        </Text>
      </ScrollView>

      <AccountSheet visible={panel === "account"} onClose={close} />
      <LinkedSheet visible={panel === "linked"} onClose={close} />
      <NotificationPrefsSheet
        visible={panel === "notifications"}
        onClose={close}
      />
      <LanguageSheet visible={panel === "language"} onClose={close} />
      <AccessibilitySheet visible={panel === "accessibility"} onClose={close} />
      <ExportSheet visible={panel === "export"} onClose={close} />
      <HelpSheet visible={panel === "help"} onClose={close} />

      <Sheet
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Logg ut"
      >
        <Text variant="label" weight="regular">
          Vil du logge ut av ThirdPlace?
        </Text>
        <DemoNote>{demoCopy.logoutNoSession}</DemoNote>
        <View className="mt-1 gap-2">
          <Button
            variant="ink"
            label="Logg ut"
            onPress={() => {
              setLogoutOpen(false);
              resetTo("/welcome");
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

type SheetProps = { visible: boolean; onClose: () => void };

// Kontoinformasjon (PDF p19): E-post, Telefon, Passord, Aktive økter.
function AccountSheet({ visible, onClose }: SheetProps) {
  const [email, setEmail] = useState("ola@eksempel.no");
  const [phone, setPhone] = useState("+47 912 34 567");
  return (
    <Sheet visible={visible} onClose={onClose} title="Kontoinformasjon">
      <View className="gap-3">
        <Input label="E-post" value={email} onChangeText={setEmail} />
        <Input label="Telefon" value={phone} onChangeText={setPhone} />
        <UIPressable
          accessibilityRole="button"
          onPress={() => {
            onClose();
            router.push("/two-factor");
          }}
          contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
          pressedScale={0.99}
        >
          <Icon name="shield-checkmark-outline" size="md" tone="ink" />
          <Text variant="label" weight="semibold" className="flex-1">
            Totrinnsbekreftelse
          </Text>
          <Icon name="chevron-forward" size="sm" tone="muted" />
        </UIPressable>
        <UIPressable
          accessibilityRole="button"
          onPress={() => {
            onClose();
            router.push("/age-verification");
          }}
          contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
          pressedScale={0.99}
        >
          <Icon name="id-card-outline" size="md" tone="ink" />
          <Text variant="label" weight="semibold" className="flex-1">
            Aldersverifisering
          </Text>
          <Icon name="chevron-forward" size="sm" tone="muted" />
        </UIPressable>
        <Text variant="micro" weight="semibold" tone="muted" className="pt-1">
          Aktive økter
        </Text>
        <Session
          icon="phone-portrait-outline"
          name="Denne enheten"
          meta="Oslo · nå"
        />
        <Session
          icon="laptop-outline"
          name="Chrome · Windows"
          meta="Sist aktiv for 2 dager siden"
        />
        <DemoNote>
          Dette er eksempeldata. Endringer lagres ikke, og ingen økter logges
          ut.
        </DemoNote>
        <Button label="Lagre endringer" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

function Session({
  icon,
  name,
  meta,
}: {
  icon: IconName;
  name: string;
  meta: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3">
      <Icon name={icon} size="md" tone="ink" />
      <View className="flex-1">
        <Text variant="label" weight="semibold">
          {name}
        </Text>
        <Text variant="caption" tone="muted">
          {meta}
        </Text>
      </View>
    </View>
  );
}

// Koblede kontoer (PDF p20).
function LinkedSheet({ visible, onClose }: SheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Koblede kontoer">
      <View className="gap-3">
        <Session
          icon="person-circle-outline"
          name={profile.name}
          meta="Utforsker · aktiv nå"
        />
        <UIPressable
          accessibilityRole="button"
          onPress={() => {
            onClose();
            router.push("/workspace" as Href);
          }}
          contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
          pressedScale={0.99}
        >
          <Icon name="tp-business" size="md" tone="ink" />
          <View className="flex-1">
            <Text variant="label" weight="semibold">
              Oslo Kaffebar AS
            </Text>
            <Text variant="caption" tone="muted">
              Bedrift · eksempel
            </Text>
          </View>
          <Text variant="caption" weight="semibold">
            Bytt til
          </Text>
        </UIPressable>
        <Text variant="caption" tone="muted">
          Har du en bedrift eller er skaper, kan kontoene kobles her og byttes
          med langt trykk på Profil-fanen.
        </Text>
        <DemoNote>
          Bedriftskontoen er et eksempel. Ingen kontoer er koblet.
        </DemoNote>
        <Button label="Lukk" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

function ToggleList({
  items,
  initial,
}: {
  items: {
    label: string;
    hint?: string;
    icon: IconName;
  }[];
  initial: Record<string, boolean>;
}) {
  const [state, setState] = useState(initial);
  return (
    <View className="overflow-hidden rounded-lg bg-surface">
      {items.map((i) => (
        <ToggleRow
          key={i.label}
          icon={i.icon}
          label={i.label}
          hint={i.hint}
          value={!!state[i.label]}
          onValueChange={(v) => setState((s) => ({ ...s, [i.label]: v }))}
        />
      ))}
    </View>
  );
}

// Varsler (PDF p19): PUSH categories + STILLE TIMER.
function NotificationPrefsSheet({ visible, onClose }: SheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Varsler">
      <View className="gap-3">
        <Text variant="micro" weight="semibold" tone="muted">
          Push
        </Text>
        <ToggleList
          initial={{
            Opplevelser: true,
            Venteliste: true,
            Venner: true,
            Chat: true,
          }}
          items={[
            {
              label: "Opplevelser",
              hint: "24t og 1t før, «skjer nå»",
              icon: "tp-experience",
            },
            {
              label: "Venteliste",
              hint: "Når plass åpner seg",
              icon: "time-outline",
            },
            {
              label: "Venner",
              hint: "Betydelige handlinger fra venner",
              icon: "people-outline",
            },
            {
              label: "Chat",
              hint: "Nye meldinger",
              icon: "chatbubble-outline",
            },
            {
              label: "Anbefalinger",
              hint: "Nye matcher i nærheten",
              icon: "star-outline",
            },
          ]}
        />
        <Text variant="micro" weight="semibold" tone="muted">
          Stille timer
        </Text>
        <ToggleList
          initial={{ "Ikke forstyrr 23–08": true }}
          items={[
            {
              label: "Ikke forstyrr 23–08",
              hint: "Push holdes til morgenen",
              icon: "moon-outline",
            },
          ]}
        />
        <DemoNote>Ingen push-varsler sendes i demoen.</DemoNote>
      </View>
    </Sheet>
  );
}

// Språk og region (PDF p19).
function LanguageSheet({ visible, onClose }: SheetProps) {
  const langs = ["Norsk (bokmål)", "English", "Svenska", "Dansk"];
  const [lang, setLang] = useState(langs[0]);
  return (
    <Sheet visible={visible} onClose={onClose} title="Språk og region">
      <View className="gap-2">
        {langs.map((l) => (
          <Pressable
            key={l}
            accessibilityRole="radio"
            accessibilityState={{ selected: lang === l }}
            onPress={() => setLang(l)}
            className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3.5"
          >
            <Text variant="body">{l}</Text>
            {lang === l ? (
              <View className="h-4 w-4 rounded-full bg-ink" />
            ) : null}
          </Pressable>
        ))}
        <Text variant="micro" weight="semibold" tone="muted" className="pt-2">
          Region
        </Text>
        <View className="overflow-hidden rounded-lg bg-surface">
          <NavRow
            icon="cash-outline"
            label="Valuta"
            value="NOK (kr)"
            onPress={() => {}}
          />
          <NavRow
            icon="time-outline"
            label="Tidssone"
            value="Oslo (CET)"
            onPress={() => {}}
          />
        </View>
        <DemoNote>
          Demoen finnes bare på norsk, så valget endrer ingenting.
        </DemoNote>
      </View>
    </Sheet>
  );
}

// Tilgjengelighet (PDF p19).
function AccessibilitySheet({ visible, onClose }: SheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Tilgjengelighet">
      <View className="gap-3">
        <ToggleList
          initial={{ "Reduser bevegelse": false }}
          items={[
            { label: "Større tekst", icon: "text-outline" },
            { label: "Høy kontrast", icon: "contrast-outline" },
            {
              label: "Reduser bevegelse",
              hint: "Demper animasjoner",
              icon: "pause-circle-outline",
            },
            { label: "Skjermleser-optimalisert", icon: "ear-outline" },
          ]}
        />
        <Text variant="micro" weight="semibold" tone="muted">
          Kart
        </Text>
        <ToggleList
          initial={{}}
          items={[
            {
              label: "Vis kun rullestolvennlige",
              hint: "Filtrerer steder automatisk",
              icon: "accessibility-outline",
            },
          ]}
        />
        <DemoNote>
          Valgene her lagres ikke. Appen følger allerede systemets «Reduser
          bevegelse».
        </DemoNote>
      </View>
    </Sheet>
  );
}

// Eksporter data (PDF p28, GDPR).
function ExportSheet({ visible, onClose }: SheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Eksporter data">
      <View className="gap-3">
        <Text variant="caption" tone="muted">
          Få en kopi av alt ThirdPlace vet om deg (GDPR).
        </Text>
        <ToggleList
          initial={{
            "Profil og preferanser": true,
            Chathistorikk: true,
            "Opplevelser og påmeldinger": true,
            Anmeldelser: true,
          }}
          items={[
            { label: "Profil og preferanser", icon: "person-outline" },
            { label: "Chathistorikk", icon: "chatbubble-outline" },
            { label: "Opplevelser og påmeldinger", icon: "tp-experience" },
            { label: "Anmeldelser", icon: "star-outline" },
            { label: "Betalingshistorikk", icon: "card-outline" },
          ]}
        />
        <DemoNote>Ingen eksport lages, og ingen e-post sendes.</DemoNote>
        <Button label="Be om eksport" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// Hjelp og støtte (PDF p20). Kept separate from safety reports and payment
// disputes (master spec §11).
function HelpSheet({ visible, onClose }: SheetProps) {
  const faq = [
    "Hvordan fungerer GPS-verifisering?",
    "Hva skjer når en opplevelse avlyses?",
    "Hvordan blir jeg Skaper?",
    "Refusjon og avbestilling",
  ];
  return (
    <Sheet visible={visible} onClose={onClose} title="Hjelp og støtte">
      <View className="gap-3">
        <Text variant="micro" weight="semibold" tone="muted">
          Vanlige spørsmål
        </Text>
        <View className="overflow-hidden rounded-lg bg-surface">
          {faq.map((q) => (
            <NavRow
              key={q}
              icon="help-circle-outline"
              label={q}
              onPress={() => {}}
            />
          ))}
        </View>
        <DemoNote>
          Svar og supportsaker er ikke koblet til noen tjeneste. Ingen sak blir
          opprettet.
        </DemoNote>
        <Button label="Opprett supportsak" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}
