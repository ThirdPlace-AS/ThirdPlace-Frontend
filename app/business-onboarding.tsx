import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";

import {
  FadeSwap,
  Field,
  Icon,
  pageBody,
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
import { DiscardChangesSheet } from "@/components/DiscardChangesSheet";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { AreaChips } from "@/components/pickers/AreaChips";
import { checkBirthday, formatBirthdayInput } from "@/features/onboarding/age";
import { submitPlace } from "@/fixtures/created";
import { UnderageScreen } from "@/features/onboarding/UnderageScreen";
import { resetTo } from "@/lib/navigation";
import { markOnboarded, setSignupEmail } from "@/lib/signupProgress";
import { useConfirmLeave } from "@/lib/useConfirmLeave";
import { useStepBack } from "@/lib/useStepBack";

// Business onboarding, per the design (PDF p3–p5). It continues the
// role step with steps 2–7: Personen bak bedriften → Om bedriften → Hvor
// ligger dere? → Kontakt og sosialt → Hva vil dere oppnå? → Se bedriften på
// kartet. Nothing is verified, charged or put on the map (BLOCKED_CONTRACT_GAP
// — no business, claim or subscription contract). Review 2026-11-18 (#17): no
// "Tillatelser" step (its switches asked the phone for nothing), the last
// button says "Fortsett" (the map does not show the business), the e-mail
// fills "Lag kontoen din", and the name is kept as an Innlevering
// (submitPlace) like a place sent from Legg til.
const TOTAL = 7;
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
  // A step's keyboard closes with it (review 2026-11-18 O1: the numeric
  // keyboard from Fødselsdag stayed open on the next steps).
  useEffect(() => {
    Keyboard.dismiss();
  }, [step]);
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
  // System back goes to the step before, like the header ← (0454).
  useStepBack(step > 2 && !blocked, back);
  // Leaving the form with anything filled in asks first (review 2026-11-18
  // H-12); the 18+ stop screen and the finish leave without asking.
  const texts = [owner, email, birthday, name, about, web, phone, street];
  const filled =
    [...texts, contact, insta, fb, menu].some((v) => v.trim().length > 0) ||
    category !== null ||
    area !== null ||
    goals.length > 0 ||
    tags.length > 0;
  const leave = useConfirmLeave(!blocked && filled);
  const next = () => {
    if (step === 2 && age.status === "underage") {
      setBlocked(true);
      return;
    }
    if (step === TOTAL) {
      if (name.trim()) submitPlace(name.trim(), area);
      setSignupEmail(email.trim());
      // As the explorer branch: the account comes last (founder 2026-11-06).
      const nextHref = markOnboarded();
      leave.allowLeave();
      if (nextHref === "/map") {
        setGuest(false);
        resetTo("/map");
      } else router.push(nextHref);
    } else setStep((s) => s + 1);
  };
  const cta = step === 4 ? "Bekreft plassering" : "Fortsett";

  if (blocked) return <UnderageScreen />;

  return (
    <Screen>
      <StepHeader current={step - 1} total={TOTAL} onBack={back} />

      {/* Edge-to-edge Android does not resize for the keyboard: the step and
          its footer move up themselves. */}
      <KeyboardAvoider>
        {/* New step: fresh scroll at its top, faded in. */}
        <FadeSwap swapKey={step} style={{ flex: 1 }}>
          <ScrollView
            contentContainerClassName={pageBody.blocks}
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
                  type="email"
                  value={email}
                  onChangeText={setEmail}
                />
                <Input
                  label="Fødselsdag"
                  placeholder="dd.mm.åååå"
                  type="number"
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
                <Field label="Kategori">
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
                </Field>
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
                  type="url"
                  value={web}
                  onChangeText={setWeb}
                />
                <Input
                  label="Telefon"
                  placeholder="+47 …"
                  type="phone"
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
                <AreaChips
                  value={area || null}
                  onChange={(a) => setArea(a.name)}
                />
                <Input
                  label="Adresse"
                  placeholder="Gate og nummer"
                  value={street}
                  onChangeText={setStreet}
                />
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
                  type="email"
                  value={contact}
                  onChangeText={setContact}
                />
                <Input
                  label="Instagram"
                  placeholder="@bedrift"
                  type="handle"
                  value={insta}
                  onChangeText={setInsta}
                />
                <Input
                  label="Facebook"
                  placeholder="facebook.com/…"
                  type="url"
                  value={fb}
                  onChangeText={setFb}
                />
                <Input
                  label="Meny-URL (valgfritt)"
                  placeholder="Lenke til meny"
                  type="url"
                  value={menu}
                  onChangeText={setMenu}
                />
              </Shell>
            ) : null}

            {step === 6 ? (
              <Shell
                title="Hva vil dere oppnå?"
                subtitle="Velg det som passer best for dere."
              >
                <Field label="Mål">
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
                </Field>
                <Field label="Stikkord">
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
                </Field>
              </Shell>
            ) : null}

            {step === 7 ? (
              <Shell
                title="Se bedriften på kartet"
                subtitle="Slik ser kundene dere når bedriften er verifisert."
              >
                <View className="gap-3 rounded-md border border-line bg-surface p-4">
                  <View className="flex-row items-center gap-2 self-start rounded-full border border-ember px-3 py-1">
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
              </Shell>
            ) : null}
          </ScrollView>
        </FadeSwap>

        <StickyFooter>
          <Button label={cta} variant="ink" disabled={!can} onPress={next} />
        </StickyFooter>
      </KeyboardAvoider>
      <DiscardChangesSheet
        visible={leave.asking}
        onStay={leave.stay}
        onDiscard={leave.leave}
      />
    </Screen>
  );
}

// Wizard step body (design-system StepContent).
const Shell = StepContent;

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
    <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-4">
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
