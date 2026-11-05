import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { OSLO_AREAS } from "@/fixtures";
import { resetTo } from "@/lib/navigation";
import { colors } from "@/theme";

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
      ? owner.trim().length > 0 && email.includes("@")
      : step === 3
        ? name.trim().length > 1 && category !== null
        : step === 4
          ? area !== null
          : true;

  const back = () => (step === 2 ? router.back() : setStep((s) => s - 1));
  const next = () => {
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="gap-3 px-gutter pb-2 pt-1">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tilbake"
            onPress={back}
            className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
          >
            <Ionicons name="arrow-back" size={20} color={colors.ink} />
          </Pressable>
          <Text className="text-xs font-medium text-muted">
            {step} av {TOTAL}
          </Text>
        </View>
        <View className="flex-row gap-1.5">
          {Array.from({ length: TOTAL }, (_, i) => (
            <View
              key={i}
              className={`h-1 flex-1 rounded-full ${i < step ? "bg-ink" : "bg-line"}`}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerClassName="gap-4 p-gutter pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {step === 2 ? (
          <Shell
            title="Personen bak bedriften"
            subtitle="Dette er admin-identiteten din — kundene ser bedriften, ikke deg."
          >
            <View className="items-center gap-1">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceMuted">
                <Ionicons name="person-outline" size={28} color={colors.ink} />
              </View>
              <Text className="text-xs font-semibold text-ink">
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
            subtitle="Gjør det lett for kunder å finne dere overalt."
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
            <Text className="text-xs text-muted">
              Alle felt kan endres senere fra dashbordet.
            </Text>
          </Shell>
        ) : null}

        {step === 6 ? (
          <Shell
            title="Tillatelser"
            subtitle="To ting trengs for at bedriften skal fungere på kartet."
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
            subtitle="Vi tilpasser kartet og feeden til målene deres."
          >
            <Label>Bedriftsintensjoner</Label>
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
            <Label>Interesse-tagger</Label>
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
            subtitle="Slik vil kundene se dere — når dere er verifisert."
          >
            <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
              <View className="flex-row items-center gap-1.5 self-start rounded-full border border-ember px-2.5 py-1">
                <Ionicons name="eye-outline" size={12} color={colors.ember} />
                <Text className="text-[11px] font-semibold text-ember">
                  Forhåndsvisning — kun synlig for deg
                </Text>
              </View>
              <Text className="text-base font-semibold text-ink">
                {name || "Bedriften din"}
              </Text>
              <Text className="text-xs text-muted">
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

      <View className="px-gutter pb-3 pt-2">
        <Button label={cta} variant="ink" disabled={!can} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-ink">{title}</Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <Text className="text-sm font-semibold text-ink">{children}</Text>;
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
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
        <Ionicons name={icon} size={18} color={colors.ink} />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-ink">{label}</Text>
          <Text className="rounded bg-surfaceMuted px-1.5 py-0.5 text-[9px] font-bold text-muted">
            {tag}
          </Text>
        </View>
        <Text className="text-xs text-muted">{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.ember, false: colors.line }}
        thumbColor={colors.surface}
        accessibilityLabel={label}
      />
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
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface p-3.5">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-surfaceMuted">
        <Text className="text-xs font-bold text-ink">{n}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">{title}</Text>
        <Text className="text-xs text-muted">{hint}</Text>
      </View>
    </View>
  );
}
