import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";

import { Switch } from "@/components/ui/Switch";
import {
  FadeSwap,
  Icon,
  type IconName,
  pageBody,
  Pressable as UIPressable,
  Screen,
  StepContent,
  StepHeader,
  StickyFooter,
  Text,
  KeyboardAvoider,
  Button,
  Chip,
  Input,
} from "@/components/ui";
import { InterestPicker } from "@/components/pickers/InterestPicker";
import { experiences, PERSONAS, type MockPersonaKey } from "@/fixtures";
import { checkBirthday, formatBirthdayInput } from "@/features/onboarding/age";
import { UnderageScreen } from "@/features/onboarding/UnderageScreen";
import { startSession } from "@/lib/startSession";
import { OWN_PORTRAIT, updateMyProfile } from "@/lib/myProfile";
import {
  ONBOARDING_PREFERENCES,
  ONBOARDING_SOCIAL,
  setPreferences,
} from "@/lib/preferences";
import { markOnboarded } from "@/lib/signupProgress";
import { useStepBack } from "@/lib/useStepBack";
import { libThumb } from "@/fixtures/images";
import { showToast } from "@/components/Toast";
import { confirmToast } from "@/copy";

// Onboarding, 8 steps per the design (PDF p2–p3): role → "Dette er
// deg" (with the 18+ birthday gate, TP-D-001) → "Hvem er du?" → "Hva ser du
// etter?" → "Hva liker du?" (min 5) → "Dine preferanser" → "Nesten i mål"
// (permissions) → feed preview. Reached after the (inert) register form.
// Optional steps can be passed with nothing chosen — skipped means unknown
// (REG §9); their button reads "Hopp over" until something is picked.
// Founder regroup (2026-11-17, 0455): one topic per screen. Step 2 "Slik er
// du sosialt" holds Personlighet, Planleggingsstil, Sosial komfort and
// Energinivå; "Dine preferanser" holds Forbruksstil, Alkohol,
// Matrestriksjoner and, last, "Om deg (valgfritt)" with Kjønn and
// Nasjonalitet. Answers stay in memory for the session (src/lib/myProfile.ts,
// src/lib/preferences.ts); nothing is sent, no permission is requested and no
// account is created (BLOCKED_CONTRACT_GAP).
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
const MIN_INTERESTS = 5;
type ChoiceRow = { label: string; options: string[] };
const SOCIAL_STYLE: ChoiceRow[] = [
  { label: "Personlighet", options: ["Introvert", "Ambivert", "Ekstrovert"] },
  {
    label: "Planleggingsstil",
    options: ["Spontan", "Fleksibel", "Planlegger"],
  },
];
const ABOUT_YOU: ChoiceRow[] = [
  { label: "Kjønn", options: ["Kvinne", "Mann", "Ikke-binær", "Vil ikke si"] },
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
    tag: "ANBEFALT",
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
  const [step, setStep] = useState(0);
  // A step's keyboard closes with it (review 2026-11-18 O1: the numeric
  // keyboard from Fødselsdag stayed open on the next steps).
  useEffect(() => {
    Keyboard.dismiss();
  }, [step]);
  const [role, setRole] = useState<MockPersonaKey>("explorer");
  const [name, setName] = useState("");
  // Photo upload is not wired (no picker in the demo): the tap answers inline.
  // "Legg til profilbilde" sets the profile portrait from the bundled
  // library (BLOCKED_CONTRACT_GAP: no media upload contract).
  const [photo, setPhoto] = useState(false);
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
  // System back goes to the step before, like the header ← (0454).
  useStepBack(step > 0 && !blocked, back);
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
      // Answers stay on this screen underneath: back from "Lag kontoen
      // din" returns here. With an account already made, the session starts.
      // What was picked carries over: Profil, Rediger profil and
      // Preferanser show it for the rest of the session.
      setPreferences(prefs);
      updateMyProfile({
        name: name.trim(),
        ...(age.status === "ok" ? { age: age.age } : {}),
        bio: bio.trim(),
        interests,
        avatar: photo ? OWN_PORTRAIT : null,
      });
      const nextHref = markOnboarded();
      if (nextHref === "/map") startSession();
      else router.push(nextHref);
      return;
    }
    setStep((s) => s + 1);
  };

  if (blocked) return <UnderageScreen />;

  // Optional steps with nothing picked offer "Hopp over" instead.
  const picked = (rows: readonly { label: string }[], from: object) =>
    rows.some((r) => !!(from as Record<string, string>)[r.label]);
  const stepIsEmpty =
    step === 2
      ? !picked(SOCIAL_STYLE, identity) && !picked(ONBOARDING_SOCIAL, prefs)
      : step === 3
        ? intents.length === 0
        : step === 5
          ? !picked(ONBOARDING_PREFERENCES, prefs) &&
            diet.length === 0 &&
            !picked(ABOUT_YOU, identity) &&
            nationality.trim().length === 0
          : false;

  const cta =
    step === 6
      ? "Gi tillatelser"
      : step === STEP_COUNT - 1
        ? "Utforsk byen din"
        : stepIsEmpty
          ? "Hopp over"
          : "Fortsett";

  return (
    <Screen>
      <StepHeader
        current={step}
        total={STEP_COUNT}
        onBack={back}
        showProgress={step < STEP_COUNT - 1}
      />

      {/* Edge-to-edge Android does not resize for the keyboard: the step and
          its footer move up themselves. */}
      <KeyboardAvoider>
        {/* New step: fresh scroll at its top, faded in. */}
        <FadeSwap swapKey={step} style={{ flex: 1 }}>
          <ScrollView
            contentContainerClassName={pageBody.sections}
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
                        checked: active,
                        disabled: !!p.locked,
                      }}
                      disabled={p.locked}
                      onPress={() => setRole(p.key)}
                      className={`flex-row items-center gap-3 rounded-md border bg-surface p-4 ${
                        active ? "border-ink" : "border-line"
                      } ${p.locked ? "opacity-60" : ""}`}
                    >
                      <View className="h-10 w-10 items-center justify-center rounded-sm bg-surfaceMuted">
                        <Icon name={p.icon as IconName} size="md" tone="ink" />
                      </View>
                      <View className="flex-1">
                        <Text variant="body" weight="semibold">
                          {p.label}
                        </Text>
                        <Text variant="caption" tone="muted">
                          {p.hint}
                        </Text>
                      </View>
                      {p.locked ? (
                        <View className="flex-row items-center gap-1 rounded-full bg-surfaceMuted px-2 py-1">
                          <Icon name="lock-closed" size="sm" tone="muted" />
                          <Text
                            variant="caption"
                            weight="semibold"
                            tone="muted"
                          >
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
                <UIPressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    photo ? "Bytt profilbilde" : "Legg til profilbilde"
                  }
                  onPress={() => {
                    if (!photo) showToast(confirmToast.photoAdded);
                    setPhoto(true);
                  }}
                  className="items-center gap-2 self-center"
                >
                  <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surfaceMuted">
                    {photo ? (
                      <Image
                        source={libThumb("person-ola")}
                        contentFit="cover"
                        style={{ width: 96, height: 96 }}
                      />
                    ) : (
                      <Icon name="camera-outline" size="lg" tone="ink" />
                    )}
                  </View>
                  <Text variant="label" weight="semibold" tone="ember">
                    {photo ? "Bytt profilbilde" : "Legg til profilbilde"}
                  </Text>
                </UIPressable>
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
                    type="number"
                    value={birthday}
                    onChangeText={(t) => setBirthday(formatBirthdayInput(t))}
                    maxLength={10}
                  />
                  {age.status === "invalid" && birthday.length === 10 ? (
                    <Text variant="caption" tone="danger">
                      Sjekk datoen. Skriv den som dd.mm.åååå.
                    </Text>
                  ) : (
                    <Text variant="caption" tone="muted">
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
                title="Slik er du sosialt"
                subtitle="Alt er valgfritt. Trykk på et valg igjen for å fjerne det."
              >
                {SOCIAL_STYLE.map((g) => (
                  <ChoiceGroup
                    key={g.label}
                    row={g}
                    value={identity}
                    onChange={setIdentity}
                  />
                ))}
                {ONBOARDING_SOCIAL.map((g) => (
                  <ChoiceGroup
                    key={g.label}
                    row={g}
                    value={prefs}
                    onChange={setPrefs}
                  />
                ))}
              </Shell>
            ) : null}

            {step === 3 ? (
              <Shell
                title="Hva ser du etter?"
                subtitle="Velg alt som passer deg."
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
                {/* Every interest in the catalogue (Phase 19, founder
                    2026-11-08): the design's 22 first, then by category. */}
                <InterestPicker
                  value={interests}
                  onToggle={(i) => setInterests((s) => toggleIn(s, i))}
                />
                <View
                  className={`self-start rounded-full px-3 py-1 ${
                    interests.length >= MIN_INTERESTS
                      ? "bg-success"
                      : "bg-surfaceMuted"
                  }`}
                >
                  <Text
                    variant="caption"
                    weight="semibold"
                    tone={interests.length >= MIN_INTERESTS ? "onMedia" : "ink"}
                  >
                    {Math.min(interests.length, MIN_INTERESTS)} av{" "}
                    {MIN_INTERESTS} valgt
                    {interests.length >= MIN_INTERESTS ? " ✓" : ""}
                  </Text>
                </View>
              </Shell>
            ) : null}

            {step === 5 ? (
              <Shell
                title="Dine preferanser"
                subtitle="Velg det som betyr noe for deg. Alt er valgfritt."
              >
                {ONBOARDING_PREFERENCES.map((g) => (
                  <ChoiceGroup
                    key={g.label}
                    row={g}
                    value={prefs}
                    onChange={setPrefs}
                  />
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
                <View className="gap-4 pt-4">
                  <Text variant="title" accessibilityRole="header">
                    Om deg (valgfritt)
                  </Text>
                  {ABOUT_YOU.map((g) => (
                    <ChoiceGroup
                      key={g.label}
                      row={g}
                      value={identity}
                      onChange={setIdentity}
                    />
                  ))}
                  <Input
                    label="Nasjonalitet"
                    placeholder="F.eks. Norge"
                    value={nationality}
                    onChangeText={setNationality}
                    maxLength={40}
                  />
                </View>
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
                    className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-4"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
                      <Icon name={p.icon} size="md" tone="ink" />
                    </View>
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center gap-2">
                        <Text variant="body" weight="semibold">
                          {p.label}
                        </Text>
                        <Text
                          variant="caption"
                          weight="bold"
                          tone="muted"
                          className="rounded-xs bg-surfaceMuted px-2 py-1"
                        >
                          {p.tag}
                        </Text>
                      </View>
                      <Text variant="caption" tone="muted">
                        {p.hint}
                      </Text>
                    </View>
                    <Switch
                      value={!!perms[p.key]}
                      onValueChange={(v) =>
                        setPerms((s) => ({ ...s, [p.key]: v }))
                      }
                      label={p.label}
                    />
                  </View>
                ))}
              </Shell>
            ) : null}

            {step === 7 ? (
              <View className="gap-4 pt-6">
                {experiences.slice(0, 3).map((e) => (
                  <View
                    key={e.id}
                    className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-4"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-sm bg-surfaceMuted">
                      <Icon name="tp-experience" size="md" tone="ink" />
                    </View>
                    <View className="flex-1">
                      <Text variant="body" weight="semibold" numberOfLines={1}>
                        {e.title}
                      </Text>
                      <Text variant="caption" tone="muted">
                        {e.when}
                      </Text>
                    </View>
                  </View>
                ))}
                <Text
                  variant="body"
                  tone="muted"
                  className="px-4 pt-2 text-center"
                >
                  Her er noen ting som skjer i byen din.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </FadeSwap>

        <StickyFooter>
          <Button
            label={cta}
            variant="ink"
            disabled={!canContinue}
            onPress={next}
          />
        </StickyFooter>
      </KeyboardAvoider>
    </Screen>
  );
}

// Wizard step body (design-system StepContent).
const Shell = StepContent;

// One single-choice chip row; a second tap on the chosen chip clears it.
function ChoiceGroup({
  row,
  value,
  onChange,
}: {
  row: { label: string; options: readonly string[] };
  value: Record<string, string>;
  onChange: (
    update: (s: Record<string, string>) => Record<string, string>,
  ) => void;
}) {
  return (
    <Group label={row.label}>
      {row.options.map((o) => (
        <Chip
          key={o}
          label={o}
          selected={value[row.label] === o}
          onPress={() =>
            onChange((s) => ({
              ...s,
              [row.label]: s[row.label] === o ? "" : o,
            }))
          }
        />
      ))}
    </Group>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text variant="label" weight="semibold">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}
