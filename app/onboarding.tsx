import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Switch } from "@/components/ui/Switch";
import {
  Icon,
  Screen,
  StepContent,
  StepHeader,
  type IconName,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { experiences, PERSONAS, type MockPersonaKey } from "@/fixtures";
import { checkBirthday, formatBirthdayInput } from "@/features/onboarding/age";
import { UnderageScreen } from "@/features/onboarding/UnderageScreen";
import { resetTo } from "@/lib/navigation";

// Onboarding (DEMO), 8 steps per the design (PDF p2–p3): role → "Dette er
// deg" (with the 18+ birthday gate, TP-D-001) → "Hvem er du?" → "Hva ser du
// etter?" → "Hva liker du?" (min 5) → "Dine preferanser" → "Nesten i mål"
// (permissions) → feed preview. Reached after the (inert) register form.
// Optional steps can be passed with nothing chosen — skipped means unknown
// (REG §9). Nothing is stored, no permission is requested and no account is
// created (BLOCKED_CONTRACT_GAP).
const STEP_COUNT = 8;

const INTENTS = [
  "Møte folk",
  "Utforske",
  "Arrangementer",
  "Friluftsliv",
  "Mat",
  "Uteliv",
  "Kreativt",
  "Rolig",
  "Familie",
];
const INTERESTS = [
  "Kaffe",
  "Jazz",
  "Løping",
  "Fotografi",
  "Keramikk",
  "Brettspill",
  "Klatring",
  "Vin",
  "Bakst",
  "Design",
  "Litteratur",
  "Yoga",
  "Sjakk",
  "Vinyl",
  "Matlaging",
  "Fotball",
  "Kunst",
  "Padel",
  "Sopp-tur",
  "Strikking",
  "Film",
  "Tech",
];
const MIN_INTERESTS = 5;
const IDENTITY: { label: string; options: string[] }[] = [
  { label: "Kjønn", options: ["Kvinne", "Mann", "Ikke-binær", "Vil ikke si"] },
  { label: "Personlighet", options: ["Introvert", "Ambivert", "Ekstrovert"] },
  {
    label: "Planleggingsstil",
    options: ["Spontan", "Fleksibel", "Planlegger"],
  },
];
const PREFERENCES: { label: string; options: string[] }[] = [
  { label: "Sosial komfort", options: ["Liten gruppe", "Middels", "Stor"] },
  { label: "Forbruksstil", options: ["Budsjett", "Moderat", "Raus"] },
  { label: "Energinivå", options: ["Rolig", "Balansert", "Høy"] },
  { label: "Alkohol", options: ["Nei", "Av og til", "Gjerne"] },
];
const DIET = ["Vegetar", "Vegansk", "Glutenfri", "Halal", "Ingen"];
const PERMISSIONS: {
  key: string;
  label: string;
  tag: string;
  hint: string;
  icon: IconName;
}[] = [
  {
    key: "location",
    label: "Posisjon",
    tag: "PÅKREVD",
    hint: "Slik finner vi steder og opplevelser nær deg",
    icon: "location-outline",
  },
  {
    key: "notifications",
    label: "Varsler",
    tag: "ANBEFALT",
    hint: "Få beskjed om plasser, venner og hendelser",
    icon: "notifications-outline",
  },
  {
    key: "contacts",
    label: "Kontakter",
    tag: "VALGFRITT",
    hint: "Finn venner som allerede er her",
    icon: "people-outline",
  },
];

const toggleIn = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

export default function Onboarding() {
  const { setGuest } = useGuestMode();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<MockPersonaKey>("explorer");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [bio, setBio] = useState("");
  const [identity, setIdentity] = useState<Record<string, string>>({});
  const [nationality, setNationality] = useState("");
  const [intents, setIntents] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [diet, setDiet] = useState<string[]>([]);
  const [perms, setPerms] = useState<Record<string, boolean>>({
    location: true,
    notifications: true,
    contacts: false,
  });
  const [blocked, setBlocked] = useState(false);

  const age = checkBirthday(birthday);

  const canContinue = (() => {
    switch (step) {
      case 1:
        return (
          name.trim().length > 0 &&
          age.status !== "empty" &&
          age.status !== "invalid"
        );
      case 4:
        return interests.length >= MIN_INTERESTS;
      default:
        return true;
    }
  })();

  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));
  const next = () => {
    // Bedrift / Enterprise continue in the business branch (PDF p3–p5).
    if (step === 0 && (role === "business" || role === "enterprise")) {
      router.push("/business-onboarding");
      return;
    }
    if (step === 1 && age.status === "underage") {
      setBlocked(true);
      return;
    }
    if (step === STEP_COUNT - 1) {
      setGuest(false);
      resetTo("/map");
      return;
    }
    setStep((s) => s + 1);
  };

  if (blocked) return <UnderageScreen />;

  const cta =
    step === 6
      ? "Gi tillatelser"
      : step === STEP_COUNT - 1
        ? "Utforsk byen din"
        : "Fortsett";

  return (
    <Screen>
      <StepHeader
        current={step}
        total={STEP_COUNT}
        onBack={back}
        showProgress={step < STEP_COUNT - 1}
      />

      <ScrollView
        contentContainerClassName="gap-5 p-gutter pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <Shell
            title="Hvem er du?"
            subtitle="Velg hvordan du vil bruke ThirdPlace. Du kan endre dette senere."
          >
            {PERSONAS.map((p) => {
              const active = role === p.key;
              return (
                <Pressable
                  key={p.key}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: active,
                    disabled: !!p.locked,
                  }}
                  disabled={p.locked}
                  onPress={() => setRole(p.key)}
                  className={`flex-row items-center gap-3 rounded-lg border bg-surface p-4 ${
                    active ? "border-ink" : "border-line"
                  } ${p.locked ? "opacity-60" : ""}`}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-md bg-surfaceMuted">
                    <Icon name={p.icon as IconName} size="md" tone="ink" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-ink">
                      {p.label}
                    </Text>
                    <Text className="text-xs text-muted font-normal">
                      {p.hint}
                    </Text>
                  </View>
                  {p.locked ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-surfaceMuted px-2 py-0.5">
                      <Icon name="lock-closed" size="sm" tone="muted" />
                      <Text className="text-[10px] font-semibold text-muted">
                        LÅST
                      </Text>
                    </View>
                  ) : active ? (
                    <Icon name="checkmark-circle" size="lg" tone="ink" />
                  ) : null}
                </Pressable>
              );
            })}
          </Shell>
        ) : null}

        {step === 1 ? (
          <Shell
            title="Dette er deg"
            subtitle="Slik vil andre se deg på ThirdPlace."
          >
            <View className="items-center gap-2">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-surfaceMuted">
                <Icon name="camera-outline" size="lg" tone="ink" />
              </View>
              <Text className="text-sm font-semibold text-emberText">
                Legg til profilbilde
              </Text>
            </View>
            <Input
              label="Navn"
              placeholder="Fornavn Etternavn"
              value={name}
              onChangeText={setName}
              maxLength={60}
            />
            <View className="gap-1">
              <Input
                label="Fødselsdag"
                placeholder="dd.mm.åååå"
                keyboardType="numeric"
                value={birthday}
                onChangeText={(t) => setBirthday(formatBirthdayInput(t))}
                maxLength={10}
              />
              {age.status === "invalid" && birthday.length === 10 ? (
                <Text className="text-xs text-dangerText font-normal">
                  Sjekk datoen — bruk formatet dd.mm.åååå.
                </Text>
              ) : (
                <Text className="text-xs text-muted font-normal">
                  Du må være minst 18 år for å bruke ThirdPlace.
                </Text>
              )}
            </View>
            <Input
              label="Bio"
              placeholder="Fortell litt om deg selv …"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={160}
            />
          </Shell>
        ) : null}

        {step === 2 ? (
          <Shell
            title="Hvem er du?"
            subtitle="Dette hjelper oss å forstå deg — aldri synlig for andre uten samtykke."
          >
            {IDENTITY.map((g) => (
              <Group key={g.label} label={g.label}>
                {g.options.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    selected={identity[g.label] === o}
                    onPress={() =>
                      setIdentity((s) => ({
                        ...s,
                        [g.label]: s[g.label] === o ? "" : o,
                      }))
                    }
                  />
                ))}
              </Group>
            ))}
            <Input
              label="Nasjonalitet"
              placeholder="F.eks. Norge"
              value={nationality}
              onChangeText={setNationality}
              maxLength={40}
            />
            <Text className="text-xs text-muted font-normal">
              Alt her er valgfritt — trykk på et valg igjen for å fjerne det.
            </Text>
          </Shell>
        ) : null}

        {step === 3 ? (
          <Shell
            title="Hva ser du etter?"
            subtitle="Velg alt som passer, så skreddersyr vi byen etter deg."
          >
            <View className="flex-row flex-wrap gap-2">
              {INTENTS.map((i) => (
                <Chip
                  key={i}
                  label={i}
                  selected={intents.includes(i)}
                  onPress={() => setIntents((s) => toggleIn(s, i))}
                />
              ))}
            </View>
          </Shell>
        ) : null}

        {step === 4 ? (
          <Shell title="Hva liker du?" subtitle="Velg minst 5 interesser.">
            <View className="flex-row flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Chip
                  key={i}
                  label={i}
                  selected={interests.includes(i)}
                  onPress={() => setInterests((s) => toggleIn(s, i))}
                />
              ))}
            </View>
            <View
              className={`self-start rounded-full px-3 py-1 ${
                interests.length >= MIN_INTERESTS
                  ? "bg-success"
                  : "bg-surfaceMuted"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  interests.length >= MIN_INTERESTS ? "text-white" : "text-ink"
                }`}
              >
                {Math.min(interests.length, MIN_INTERESTS)} av {MIN_INTERESTS}{" "}
                valgt
                {interests.length >= MIN_INTERESTS ? " ✓" : ""}
              </Text>
            </View>
          </Shell>
        ) : null}

        {step === 5 ? (
          <Shell
            title="Dine preferanser"
            subtitle="Finjuster hvordan vi matcher deg."
          >
            {PREFERENCES.map((g) => (
              <Group key={g.label} label={g.label}>
                {g.options.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    selected={prefs[g.label] === o}
                    onPress={() =>
                      setPrefs((s) => ({
                        ...s,
                        [g.label]: s[g.label] === o ? "" : o,
                      }))
                    }
                  />
                ))}
              </Group>
            ))}
            <Group label="Matrestriksjoner">
              {DIET.map((o) => (
                <Chip
                  key={o}
                  label={o}
                  selected={diet.includes(o)}
                  onPress={() => setDiet((s) => toggleIn(s, o))}
                />
              ))}
            </Group>
          </Shell>
        ) : null}

        {step === 6 ? (
          <Shell
            title="Nesten i mål"
            subtitle="ThirdPlace fungerer best med disse tillatelsene."
          >
            {PERMISSIONS.map((p) => (
              <View
                key={p.key}
                className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
                  <Icon name={p.icon} size="md" tone="ink" />
                </View>
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-semibold text-ink">
                      {p.label}
                    </Text>
                    <Text className="rounded bg-surfaceMuted px-1.5 py-0.5 text-[9px] font-bold text-muted">
                      {p.tag}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted font-normal">
                    {p.hint}
                  </Text>
                </View>
                <Switch
                  value={!!perms[p.key]}
                  onValueChange={(v) => setPerms((s) => ({ ...s, [p.key]: v }))}
                  label={p.label}
                />
              </View>
            ))}
            <DemoNote>
              Ingen tillatelser blir spurt om i demoen. Posisjon kan du dele fra
              kartet.
            </DemoNote>
          </Shell>
        ) : null}

        {step === 7 ? (
          <View className="gap-4 pt-6">
            {experiences.slice(0, 3).map((e) => (
              <View
                key={e.id}
                className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3.5"
              >
                <View className="h-10 w-10 items-center justify-center rounded-md bg-surfaceMuted">
                  <Icon name="tp-experience" size="md" tone="ink" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold text-ink"
                    numberOfLines={1}
                  >
                    {e.title}
                  </Text>
                  <Text className="text-xs text-muted font-normal">
                    {e.when}
                  </Text>
                </View>
              </View>
            ))}
            <Text className="px-4 pt-2 text-center text-base text-muted font-normal">
              Her er noen ting som skjer i byen din.
            </Text>
            <DemoNote>
              Eksempler fra demoen — feeden er ikke personalisert ennå.
            </DemoNote>
          </View>
        ) : null}
      </ScrollView>

      <View className="px-gutter pb-3 pt-2">
        <Button
          label={cta}
          variant="ink"
          disabled={!canContinue}
          onPress={next}
        />
      </View>
    </Screen>
  );
}

// Wizard step body (design-system StepContent).
const Shell = StepContent;

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}
