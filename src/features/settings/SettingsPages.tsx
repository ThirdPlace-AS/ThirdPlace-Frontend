// Settings sub-pages (PDF p19–p21, p27–p28), pages since Phase 12 H4c
// (founder 2026-11-06: settings you read or fill in are pages, not sheets):
// /settings/account, /linked, /notifications, /language, /accessibility,
// /help, /blocked and /delete. Every toggle is local and persists nothing;
// nothing is exported, sent or deleted (BLOCKED_CONTRACT_GAP — no account,
// session, preference, consent or support backend). Confirmations go back,
// then toast in product voice.
import { router, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import {
  FormPage,
  Icon,
  Page,
  Pressable as UIPressable,
  Text,
  type IconName,
} from "@/components/ui";
import { confirmToast } from "@/copy";
import { useMyProfile } from "@/lib/myProfile";
import { setBlocked, useBlocked } from "@/lib/blocked";
import { goBackOr } from "@/lib/navigation";
import { signOut } from "@/lib/signOut";

import { NavRow, ToggleList } from "./settingsUi";

function Session({
  icon,
  name,
  meta,
  onSignOut,
}: {
  icon: IconName;
  name: string;
  meta: string;
  /** Other devices (PDF p19): "Logg ut". This device has none. */
  onSignOut?: () => void;
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
      {onSignOut ? (
        <UIPressable
          accessibilityRole="button"
          accessibilityLabel={`Logg ut ${name}`}
          onPress={onSignOut}
          haptic="selection"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text variant="label" weight="semibold">
            Logg ut
          </Text>
        </UIPressable>
      ) : null}
    </View>
  );
}

// Passord on Kontoinformasjon (PDF p19): "•••••••• · Endre", drawn like the
// fields above it.
function PasswordRow() {
  return (
    <View className="gap-1.5">
      <Text variant="label" weight="semibold">
        Passord
      </Text>
      <UIPressable
        accessibilityRole="button"
        accessibilityLabel="Passord. Endre"
        onPress={() => router.push("/settings/password" as Href)}
        pressedScale={0.99}
        contentClassName="min-h-12 flex-row items-center gap-2 rounded-md border border-line bg-surface px-3"
      >
        <Text variant="body" className="flex-1" numberOfLines={1}>
          {"•".repeat(8)}
        </Text>
        <Text variant="label" weight="semibold">
          Endre
        </Text>
      </UIPressable>
    </View>
  );
}

type DeviceSession = {
  id: string;
  icon: IconName;
  name: string;
  meta: string;
  current?: boolean;
};

// MOCK sessions (no session API: BLOCKED_CONTRACT_GAP); signing a device out
// only removes its row here.
const SESSIONS: DeviceSession[] = [
  {
    id: "this",
    icon: "phone-portrait-outline",
    name: "Denne enheten",
    meta: "Oslo · nå",
    current: true,
  },
  {
    id: "chrome",
    icon: "laptop-outline",
    name: "Chrome · Windows",
    meta: "Sist aktiv for 2 dager siden",
  },
];

function LinkRow({
  icon,
  label,
  href,
}: {
  icon: IconName;
  label: string;
  href: Href;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
      pressedScale={0.99}
    >
      <Icon name={icon} size="md" tone="ink" />
      <Text variant="label" weight="semibold" className="flex-1">
        {label}
      </Text>
      <Icon name="chevron-forward" size="sm" tone="muted" />
    </UIPressable>
  );
}

// Kontoinformasjon (PDF p19): E-post, Telefon, Passord, Aktive økter.
export function AccountScreen() {
  const [email, setEmail] = useState("ola@epost.no");
  const [phone, setPhone] = useState("+47 912 34 567");
  const [sessions, setSessions] = useState(SESSIONS);
  return (
    <FormPage
      title="Kontoinformasjon"
      footer={
        <Button
          label="Lagre endringer"
          variant="ink"
          onPress={() => {
            goBackOr("/settings" as Href);
            showToast(confirmToast.accountSaved);
          }}
        />
      }
    >
      <Input label="E-post" value={email} onChangeText={setEmail} />
      <Input label="Telefon" value={phone} onChangeText={setPhone} />
      <PasswordRow />
      <LinkRow
        icon="shield-checkmark-outline"
        label="Totrinnsbekreftelse"
        href="/two-factor"
      />
      <LinkRow
        icon="id-card-outline"
        label="Aldersverifisering"
        href="/age-verification"
      />
      <Text variant="title" accessibilityRole="header" className="pt-1">
        Aktive økter
      </Text>
      {sessions.map((s) => (
        <Session
          key={s.id}
          icon={s.icon}
          name={s.name}
          meta={s.meta}
          onSignOut={
            s.current
              ? undefined
              : () => {
                  setSessions((list) => list.filter((x) => x.id !== s.id));
                  showToast(confirmToast.sessionSignedOut);
                }
          }
        />
      ))}
      {sessions.some((s) => !s.current) ? (
        <UIPressable
          accessibilityRole="button"
          onPress={() => {
            setSessions((list) => list.filter((x) => x.current));
            showToast(confirmToast.otherSessionsSignedOut);
          }}
          haptic="selection"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          className="self-start"
        >
          <Text variant="label" weight="semibold" tone="danger">
            Logg ut alle andre enheter
          </Text>
        </UIPressable>
      ) : null}
    </FormPage>
  );
}

// Endre passord, from Passord on Kontoinformasjon. The fields and the
// 8-character minimum follow "Lag nytt passord" (PDF p1), plus the current
// password. MOCK: checked here and discarded; nothing is stored
// (BLOCKED_CONTRACT_GAP).
export function ChangePasswordScreen() {
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const short = pw.length > 0 && pw.length < 8;
  const mismatch = again.length > 0 && again !== pw;
  const ok = current.length > 0 && pw.length >= 8 && again === pw;
  return (
    <FormPage
      title="Endre passord"
      footer={
        <Button
          label="Lagre nytt passord"
          variant="ink"
          disabled={!ok}
          onPress={() => {
            goBackOr("/settings/account" as Href);
            showToast(confirmToast.passwordChanged);
          }}
        />
      }
    >
      <Input
        label="Nåværende passord"
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
      />
      <View className="gap-1">
        <Input
          label="Nytt passord"
          placeholder="Minst 8 tegn"
          secureTextEntry
          value={pw}
          onChangeText={setPw}
        />
        {short ? (
          <Text variant="caption" tone="danger">
            Passordet må ha minst 8 tegn.
          </Text>
        ) : null}
      </View>
      <View className="gap-1">
        <Input
          label="Bekreft passord"
          placeholder="Gjenta passordet"
          secureTextEntry
          value={again}
          onChangeText={setAgain}
        />
        {mismatch ? (
          <Text variant="caption" tone="danger">
            Passordene er ikke like.
          </Text>
        ) : null}
      </View>
    </FormPage>
  );
}

// Koblede kontoer (PDF p20).
export function LinkedAccountsScreen() {
  const me = useMyProfile();
  return (
    <Page title="Koblede kontoer">
      <Session
        icon="person-circle-outline"
        name={me.name}
        meta="Utforsker · aktiv nå"
      />
      <UIPressable
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        onPress={() => router.push("/workspace" as Href)}
        contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
        pressedScale={0.99}
      >
        <Icon name="tp-business" size="md" tone="ink" />
        <View className="flex-1">
          <Text variant="label" weight="semibold">
            Oslo Kaffebar AS
          </Text>
          <Text variant="caption" tone="muted">
            Bedrift
          </Text>
        </View>
        <Text variant="caption" weight="semibold">
          Bytt til
        </Text>
      </UIPressable>
      <Text variant="caption" tone="muted">
        Har du en bedrift eller er Skaper, kan du koble kontoene her. Hold inne
        Profil-fanen for å bytte.
      </Text>
    </Page>
  );
}

// Varsler (PDF p19): PUSH categories + STILLE TIMER.
export function NotificationSettingsScreen() {
  return (
    <Page title="Varsler">
      <Text variant="title" accessibilityRole="header">
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
          { label: "Chat", hint: "Nye meldinger", icon: "chatbubble-outline" },
          {
            label: "Anbefalinger",
            hint: "Nye matcher i nærheten",
            icon: "star-outline",
          },
        ]}
      />
      <Text variant="title" accessibilityRole="header">
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
    </Page>
  );
}

// Språk og region (PDF p19).
export function LanguageScreen() {
  const langs = ["Norsk (bokmål)", "English", "Svenska", "Dansk"];
  const [lang, setLang] = useState(langs[0]);
  return (
    <Page title="Språk og region">
      <View className="gap-2" accessibilityRole="radiogroup">
        {langs.map((l) => (
          <UIPressable
            key={l}
            accessibilityRole="radio"
            accessibilityState={{ selected: lang === l }}
            haptic="selection"
            onPress={() => setLang(l)}
            contentClassName="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3.5"
            pressedScale={0.99}
          >
            <Text variant="body">{l}</Text>
            <Icon
              name={lang === l ? "radio-button-on" : "radio-button-off"}
              size="lg"
              tone="ink"
            />
          </UIPressable>
        ))}
      </View>
      <Text variant="title" accessibilityRole="header" className="pt-2">
        Region
      </Text>
      <View className="overflow-hidden rounded-lg border border-line bg-surface">
        <NavRow icon="cash-outline" label="Valuta" value="NOK (kr)" />
        <NavRow icon="time-outline" label="Tidssone" value="Oslo (CET)" />
      </View>
    </Page>
  );
}

// Tilgjengelighet (PDF p19).
export function AccessibilitySettingsScreen() {
  return (
    <Page title="Tilgjengelighet">
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
      <Text variant="title" accessibilityRole="header">
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
    </Page>
  );
}

// Hjelp og støtte (PDF p20). Kept separate from safety reports and payment
// disputes (master spec §11).
export function HelpScreen() {
  const faq = [
    "Hvordan fungerer GPS-verifisering?",
    "Hva skjer når en opplevelse avlyses?",
    "Hvordan blir jeg Skaper?",
    "Refusjon og avbestilling",
  ];
  return (
    <Page title="Hjelp og støtte">
      <Text variant="title" accessibilityRole="header">
        Vanlige spørsmål
      </Text>
      <View className="overflow-hidden rounded-lg border border-line bg-surface">
        {faq.map((q) => (
          // Topics only: no answers exist yet, so the rows are not links.
          <NavRow key={q} icon="help-circle-outline" label={q} />
        ))}
      </View>
      <Button
        label="Opprett supportsak"
        variant="ink"
        onPress={() => showToast(confirmToast.supportCreated)}
      />
    </Page>
  );
}

// Blokkerte brukere (PDF p21): the shared block list (src/lib/blocked.ts),
// so a Blokker elsewhere shows up here. Avblokkér / Angre flip the row.
export function BlockedUsersScreen() {
  const list = useBlocked();
  return (
    <Page title="Blokkerte brukere">
      <Text variant="caption" tone="muted">
        Blokkerte brukere kan ikke se profilen din, sende meldinger eller finne
        deg.
      </Text>
      {list.map((b) => (
        <View
          key={b.key}
          className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
        >
          <View className="flex-1">
            <Text variant="label" weight="semibold">
              {b.name}
            </Text>
            <Text variant="caption" tone="muted">
              {b.blocked ? b.detail : "Ikke blokkert"}
            </Text>
          </View>
          <UIPressable
            accessibilityRole="button"
            accessibilityLabel={
              b.blocked ? `Avblokkér ${b.name}` : `Blokker ${b.name} igjen`
            }
            haptic="selection"
            hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
            onPress={() => setBlocked(b.key, !b.blocked)}
          >
            <Text
              variant="caption"
              weight="semibold"
              tone={b.blocked ? "ember" : "ink"}
            >
              {b.blocked ? "Avblokkér" : "Angre"}
            </Text>
          </UIPressable>
        </View>
      ))}
    </Page>
  );
}

// Slett konto (PDF p21/p27): reason chips + type «SLETT» to confirm.
// BLOCKED_CONTRACT_GAP: nothing is deleted; the confirm goes back and toasts.
export function DeleteAccountScreen() {
  const reasons = ["Bruker det ikke", "Personvern", "Annen app", "Annet"];
  const [reason, setReason] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  return (
    <FormPage
      title="Slett konto"
      footer={
        <>
          <Button
            label="Slett kontoen min"
            variant="secondary"
            disabled={confirm.trim() !== "SLETT"}
            onPress={() => {
              // Deleting ends the session like Logg ut (Phase 15).
              signOut();
              showToast(confirmToast.accountDeleted);
            }}
          />
          <Button
            label="Avbryt"
            variant="ink"
            onPress={() => goBackOr("/privacy" as Href)}
          />
        </>
      }
    >
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
    </FormPage>
  );
}
