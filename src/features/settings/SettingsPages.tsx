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

import { showToast } from "@/components/Toast";
import {
  FormPage,
  Icon,
  Page,
  Pressable as UIPressable,
  RadioMark,
  Section,
  Text,
  type IconName,
  Button,
  Chip,
  Input,
} from "@/components/ui";
import { confirmToast } from "@/copy";
import { businesses } from "@/fixtures";
import { gutterPx } from "@/theme";
import {
  switchToBusiness,
  switchToPersonal,
  useActiveBusinessId,
} from "@/lib/activeAccount";
import { useMyProfile } from "@/lib/myProfile";
import { getSignupEmail } from "@/lib/signupProgress";
import { setA11yPrefs, useA11yPrefs } from "@/lib/a11yPrefs";
import { setBlocked, useBlocked } from "@/lib/blocked";
import { goBackOr } from "@/lib/navigation";
import {
  setNotificationPref,
  useNotificationPrefs,
} from "@/lib/notificationPrefs";
import { signOut } from "@/lib/signOut";

import { NavRow, ToggleList, ToggleRow } from "./settingsUi";

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
    <View className="gap-2">
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
  // The address typed at sign-up (O6), else the demo persona's.
  const [email, setEmail] = useState(() => getSignupEmail() || "ola@epost.no");
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
      <Input
        label="E-post"
        type="email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Telefon"
        type="phone"
        value={phone}
        onChangeText={setPhone}
      />
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
      <Section title="Aktive økter" className="pt-2">
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
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            className="self-start"
          >
            <Text variant="label" weight="semibold" tone="danger">
              Logg ut alle andre enheter
            </Text>
          </UIPressable>
        ) : null}
      </Section>
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
        type="password"
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
      />
      <View className="gap-1">
        <Input
          label="Nytt passord"
          placeholder="Minst 8 tegn"
          type="newPassword"
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
          type="newPassword"
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
  // "aktiv nå" follows the account switch (G-Q8), not always Utforsker.
  const activeBiz = useActiveBusinessId();
  const biz = businesses[0];
  const bizActive = !!biz && activeBiz === biz.id;
  return (
    <Page title="Koblede kontoer">
      <UIPressable
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        disabled={!bizActive}
        dimWhenDisabled={false}
        onPress={switchToPersonal}
        contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
        pressedScale={0.99}
      >
        <Icon name="person-circle-outline" size="md" tone="ink" />
        <View className="flex-1">
          <Text variant="label" weight="semibold">
            {me.name}
          </Text>
          <Text variant="caption" tone="muted">
            {bizActive ? "Utforsker" : "Utforsker · aktiv nå"}
          </Text>
        </View>
        {bizActive ? (
          <Text variant="caption" weight="semibold">
            Bytt til
          </Text>
        ) : null}
      </UIPressable>
      <UIPressable
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        onPress={() => {
          if (biz) switchToBusiness(biz.id);
          router.push("/workspace" as Href);
        }}
        contentClassName="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
        pressedScale={0.99}
      >
        <Icon name="tp-business" size="md" tone="ink" />
        <View className="flex-1">
          <Text variant="label" weight="semibold">
            {biz?.name ?? "Bedrift"}
          </Text>
          <Text variant="caption" tone="muted">
            {bizActive ? "Bedrift · aktiv nå" : "Bedrift"}
          </Text>
        </View>
        <Text variant="caption" weight="semibold">
          {bizActive ? "Åpne" : "Bytt til"}
        </Text>
      </UIPressable>
      <Text variant="caption" tone="muted">
        Har du en bedrift eller er Skaper, kan du koble kontoene her. Hold inne
        Profil-fanen for å bytte.
      </Text>
    </Page>
  );
}

// Varsler (PDF p19): PUSH categories + STILLE TIMER. The switches keep
// their values in src/lib/notificationPrefs.ts (IJ4).
export function NotificationSettingsScreen() {
  const prefs = useNotificationPrefs();
  return (
    <Page title="Varsler" density="sections">
      <Section title="Push" rows>
        <ToggleList
          values={prefs}
          onChange={setNotificationPref}
          items={[
            // No timing hints ("24t og 1t før", "Push holdes til
            // morgenen"): the spec sets no reminder times (review
            // 2026-11-18 IJ5).
            { label: "Opplevelser", icon: "tp-experience" },
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
      </Section>
      <Section title="Stille timer" rows>
        <ToggleList
          values={prefs}
          onChange={setNotificationPref}
          items={[{ label: "Ikke forstyrr 23–08", icon: "moon-outline" }]}
        />
      </Section>
    </Page>
  );
}

// Språk og region (PDF p19). The app is in Norwegian only: p19's other
// languages, Valuta and Tidssone changed nothing and are hidden until they
// exist (review 2026-11-18 IJ6; which languages: IJ-Q8).
export function LanguageScreen() {
  return (
    <Page title="Språk og region" density="sections">
      <View className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-4">
        <Text variant="body">Norsk (bokmål)</Text>
        <RadioMark checked />
      </View>
    </Page>
  );
}

// Tilgjengelighet (PDF p19). Since Phase 15 each switch changes the app
// (src/lib/a11yPrefs.ts): Større tekst enlarges every Text, Reduser bevegelse
// turns animations off, Vis kun rullestolvennlige starts the map and Sveip
// with the step-free filter. p19's "Høy kontrast" and "Skjermleser-
// optimalisert" are hidden until their behaviour is defined (founder
// 2026-11-07); the phone's own screen reader works throughout.
export function AccessibilitySettingsScreen() {
  const prefs = useA11yPrefs();
  return (
    <Page title="Tilgjengelighet" density="sections">
      <View style={{ marginHorizontal: -gutterPx }}>
        <ToggleRow
          icon="text-outline"
          label="Større tekst"
          value={prefs.largerText}
          onValueChange={(v) => setA11yPrefs({ largerText: v })}
        />
        <ToggleRow
          icon="pause-circle-outline"
          label="Reduser bevegelse"
          hint="Demper animasjoner"
          value={prefs.reduceMotion}
          onValueChange={(v) => setA11yPrefs({ reduceMotion: v })}
        />
      </View>
      <Section title="Kart" rows>
        <View style={{ marginHorizontal: -gutterPx }}>
          <ToggleRow
            icon="accessibility-outline"
            label="Vis kun rullestolvennlige"
            hint="Filtrerer steder automatisk"
            value={prefs.wheelchairOnly}
            onValueChange={(v) => setA11yPrefs({ wheelchairOnly: v })}
          />
        </View>
      </Section>
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
      <Section title="Vanlige spørsmål">
        <View className="overflow-hidden rounded-md border border-line bg-surface">
          {faq.map((q) => (
            // Topics only: no answers exist yet, so the rows are not links.
            <NavRow key={q} icon="help-circle-outline" label={q} />
          ))}
        </View>
      </Section>
      <Button
        label="Opprett supportsak"
        variant="ink"
        // Phase 18: a short form (what it is about, what happened) before
        // the case is sent.
        onPress={() => router.push("/settings/support" as Href)}
      />
      {/* Phase 18 (screen benchmark): ideas, problems and praise. */}
      <Button
        label="Send tilbakemelding"
        variant="secondary"
        onPress={() => router.push("/settings/feedback" as Href)}
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
            variant="danger"
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
      {/* PDF p21's "permanent, kan ikke angres" and "Når du sletter
          kontoen din: …" are left out: the spec has deletion, anonymising and
          retention under legal holds, with timing the app must explain once it
          is decided (founder 2026-11-07, Phase 15). */}
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
