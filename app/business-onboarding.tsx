import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";

import { Switch } from "@/components/ui/Switch";
import {
  Icon,
  Screen,
  StepContent,
  StepHeader,
  StickyFooter,
  Text,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { OSLO_AREAS } from "@/fixtures";
import { checkBirthday, formatBirthdayInput } from "@/features/onboarding/age";
import { UnderageScreen } from "@/features/onboarding/UnderageScreen";
import { resetTo } from "@/lib/navigation";

// Business onboarding (DEMO), per the design (PDF p3–p5). It continues the
// role step ("1 av 8") with steps 2–8: Personen bak bedriften → Om bedriften →
// Hvor ligger dere? → Kontakt og sosialt → Tillatelser → Hva vil dere oppnå? →
// Se bedriften på kartet. Nothing is created, verified, charged or stored
// (BLOCKED_CONTRACT_GAP — no business, claim or subscription contract).
const TOTAL = 8;
const CATEGORIES = [
  "Kafé",
  "Bar",
  "Restaurant",
  "Butikk",
  "Kultur",
  "Verksted",
];
const GOALS = [
  "Finne samarbeidspartnere",
  "Følge konkurrenter",
  "Tiltrekke kunder",
  "Finne arrangementer å sponse",
  "Koble med lokale bedrifter",
  "Holde seg oppdatert på trender",
];
const TAGS = [
  "Spesialkaffe",
  "Brunsj",
  "Velvære",
  "Live-musikk",
  "Kortreist",
  "Vegansk",
  "Studentvennlig",
  "Hundevennlig",
];

const toggle = (l: string[], v: string) =>
  l.includes(v) ? l.filter((x) => x !== v) : [...l, v];

export default function BusinessOnboarding() {
  const { setGuest } = useGuestMode();
  const [step, setStep] = useState(2); // 1 = the shared role step
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  // The business branch skips the profile step, so it carries the 18+ gate
  // itself (TP-D-001).
  const [birthday, setBirthday] = useState("");
  const [blocked, setBlocked] = useState(false);
  const age = checkBirthday(birthday);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [about, setAbout] = useState("");
  const [web, setWeb] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState<string | null>(null);
  const [street, setStreet] = useState("");
  const [contact, setContact] = useState("");
  const [insta, setInsta] = useState("");
  const [fb, setFb] = useState("");
  const [menu, setMenu] = useState("");
  const [loc, setLoc] = useState(true);
  const [notif, setNotif] = useState(true);
  const [goals, setGoals] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const can =
    step === 2
      ? owner.trim().length > 0 &&
        email.includes("@") &&
        (age.status === "ok" || age.status === "underage")
      : step === 3
        ? name.trim().length > 1 && category !== null
        : step === 4
          ? area !== null
          : true;

  const back = () => (step === 2 ? router.back() : setStep((s) => s - 1));
  const next = () => {
    if (step === 2 && age.status === "underage") {
      setBlocked(true);
      return;
    }
    if (step === TOTAL) {
      setGuest(false);
      resetTo("/map");
    } else setStep((s) => s + 1);
  };
  const cta =
    step === 4
      ? "Bekreft plassering"
      : step === 6
        ? "Gi tillatelser"
        : step === TOTAL
          ? "Se bedriften din på kartet"
          : "Fortsett";

  if (blocked) return <UnderageScreen />;

  return (
    <Screen>
      <StepHeader current={step - 1} total={TOTAL} onBack={back} />

      {/* Edge-to-edge Android does not resize for the keyboard: the step and
          its footer move up themselves. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          // New step, new scroll: each step starts at its top.
          key={step}
          contentContainerClassName="gap-4 p-gutter pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {step === 2 ? (
            <Shell
              title="Personen bak bedriften"
              subtitle="Dette er deg som styrer bedriften. Kundene ser bare bedriften."
            >
              <View className="items-center gap-1">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceMuted">
                  <Icon name="person-outline" size="xl" tone="ink" />
                </View>
                <Text variant="caption" weight="semibold">
                  Legg til bilde
                </Text>
              </View>
              <Input
                label="Ditt navn"
                placeholder="Fornavn Etternavn"
                value={owner}
                onChangeText={setOwner}
              />
              <Input
                label="E-postadresse"
                placeholder="navn@bedrift.no"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Fødselsdag"
                placeholder="dd.mm.åååå"
                keyboardType="numeric"
                value={birthday}
                onChangeText={(t) => setBirthday(formatBirthdayInput(t))}
                maxLength={10}
              />
              <Text variant="caption" tone="muted">
                Du må være minst 18 år for å administrere en bedrift.
              </Text>
            </Shell>
          ) : null}

          {step === 3 ? (
            <Shell
              title="Om bedriften"
              subtitle="Slik presenteres dere på kartet og i søk."
            >
              <Input
                label="Bedriftsnavn"
                placeholder="F.eks. Oslo Kaffebar"
                value={name}
                onChangeText={setName}
              />
              <Label>Kategori</Label>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected={category === c}
                    onPress={() => setCategory(c)}
                  />
                ))}
              </View>
              <Input
                label="Beskrivelse"
                placeholder="Hva gjør stedet deres spesielt?"
                value={about}
                onChangeText={setAbout}
                multiline
              />
              <Input
                label="Nettside"
                placeholder="bedrift.no"
                value={web}
                onChangeText={setWeb}
              />
              <Input
                label="Telefon"
                placeholder="+47 …"
                keyboardType="numeric"
                value={phone}
                onChangeText={setPhone}
              />
            </Shell>
          ) : null}

          {step === 4 ? (
            <Shell
              title="Hvor ligger dere?"
              subtitle="Velg området, og skriv inn adressen."
            >
              <View className="flex-row flex-wrap gap-2">
                {OSLO_AREAS.map((a) => (
                  <Chip
                    key={a.name}
                    label={a.name}
                    selected={area === a.name}
                    onPress={() => setArea(a.name)}
                  />
                ))}
              </View>
              <Input
                label="Adresse"
                placeholder="Gate og nummer"
                value={street}
                onChangeText={setStreet}
              />
              <DemoNote>
                Kartpinne og adressesøk er ikke aktive i demoen.
              </DemoNote>
            </Shell>
          ) : null}

          {step === 5 ? (
            <Shell
              title="Kontakt og sosialt"
              subtitle="Hvordan kan kundene nå dere?"
            >
              <Input
                label="Kontakt-e-post"
                placeholder="hei@bedrift.no"
                keyboardType="email-address"
                value={contact}
                onChangeText={setContact}
              />
              <Input
                label="Instagram"
                placeholder="@bedrift"
                value={insta}
                onChangeText={setInsta}
              />
              <Input
                label="Facebook"
                placeholder="facebook.com/…"
                value={fb}
                onChangeText={setFb}
              />
              <Input
                label="Meny-URL (valgfritt)"
                placeholder="Lenke til meny"
                value={menu}
                onChangeText={setMenu}
              />
              <Text variant="caption" tone="muted">
                Alle felt kan endres senere fra dashbordet.
              </Text>
            </Shell>
          ) : null}

          {step === 6 ? (
            <Shell
              title="Tillatelser"
              subtitle="Bedriften trenger to tillatelser for å vises på kartet."
            >
              <Perm
                icon="location-outline"
                label="Posisjon"
                tag="PÅKREVD"
                hint="Bekrefter hvor bedriften ligger på kartet"
                value={loc}
                onChange={setLoc}
              />
              <Perm
                icon="notifications-outline"
                label="Varsler"
                tag="ANBEFALT"
                hint="Få beskjed om anmeldelser, chat og bestillinger"
                value={notif}
                onChange={setNotif}
              />
              <DemoNote>Ingen tillatelser blir spurt om i demoen.</DemoNote>
            </Shell>
          ) : null}

          {step === 7 ? (
            <Shell
              title="Hva vil dere oppnå?"
              subtitle="Velg det som passer best for dere."
            >
              <Label>Mål</Label>
              <View className="flex-row flex-wrap gap-2">
                {GOALS.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    selected={goals.includes(g)}
                    onPress={() => setGoals((s) => toggle(s, g))}
                  />
                ))}
              </View>
              <Label>Stikkord</Label>
              <View className="flex-row flex-wrap gap-2">
                {TAGS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={tags.includes(t)}
                    onPress={() => setTags((s) => toggle(s, t))}
                  />
                ))}
              </View>
            </Shell>
          ) : null}

          {step === 8 ? (
            <Shell
              title="Se bedriften på kartet"
              subtitle="Slik ser kundene dere når bedriften er verifisert."
            >
              <View className="gap-3 rounded-lg border border-line bg-surface p-4">
                <View className="flex-row items-center gap-1.5 self-start rounded-full border border-ember px-2.5 py-1">
                  <Icon name="eye-outline" size="sm" tone="ember" />
                  <Text variant="caption" weight="semibold" tone="ember">
                    Forhåndsvisning. Bare du ser den.
                  </Text>
                </View>
                <Text variant="body" weight="semibold">
                  {name || "Bedriften din"}
                </Text>
                <Text variant="caption" tone="muted">
                  {[category, street, area].filter(Boolean).join(" · ")}
                </Text>
              </View>
              <NextStep
                n={1}
                title="Verifiser bedriften"
                hint="Org.nummer eller dokumenter"
              />
              <NextStep
                n={2}
                title="Start abonnement"
                hint="Betaling er ikke aktiv i demoen"
              />
              <DemoNote>
                Bedriften opprettes ikke, og ingen verifisering eller betaling
                starter.
              </DemoNote>
            </Shell>
          ) : null}
        </ScrollView>

        <StickyFooter>
          <Button label={cta} variant="ink" disabled={!can} onPress={next} />
        </StickyFooter>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// Wizard step body (design-system StepContent).
const Shell = StepContent;

function Label({ children }: { children: string }) {
  return (
    <Text variant="label" weight="semibold">
      {children}
    </Text>
  );
}

function Perm({
  icon,
  label,
  tag,
  hint,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tag: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
        <Icon name={icon} size="md" tone="ink" />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text variant="body" weight="semibold">
            {label}
          </Text>
          <Text
            variant="caption"
            weight="bold"
            tone="muted"
            className="rounded-xs bg-surfaceMuted px-1.5 py-0.5"
          >
            {tag}
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      </View>
      <Switch value={value} onValueChange={onChange} label={label} />
    </View>
  );
}

function NextStep({
  n,
  title,
  hint,
}: {
  n: number;
  title: string;
  hint: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3.5">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-surfaceMuted">
        <Text variant="caption" weight="bold">
          {n}
        </Text>
      </View>
      <View className="flex-1">
        <Text variant="label" weight="semibold">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      </View>
    </View>
  );
}
