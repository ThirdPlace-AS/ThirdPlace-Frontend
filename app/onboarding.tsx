import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { Logo } from "@/components/Logo";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { PERSONAS, type MockPersonaKey } from "@/fixtures";
import { colors } from "@/theme";

// Onboarding (DEMO). Reached from Welcome → "Kom i gang" (and after the inert
// register form). A short, local multi-step flow that creates NO account and
// stores nothing; it ends by entering the signed-in demo (useGuestMode false)
// on the map. BLOCKED_CONTRACT_GAP: no account, interest taxonomy, consent, or
// persona backend — every choice here is demo art.
const INTERESTS = [
  "Kaffe",
  "Konserter",
  "Bøker",
  "Løping",
  "Mat",
  "Kunst",
  "Vin",
  "Sykkel",
  "Verksted",
  "Jazz",
  "Natur",
  "Foto",
];

const STEPS = ["interesser", "posisjon", "modus", "klar"] as const;

export default function Onboarding() {
  const { setGuest } = useGuestMode();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [locationOn, setLocationOn] = useState(false);
  const [persona, setPersona] = useState<MockPersonaKey>("explorer");

  const last = step === STEPS.length - 1;
  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));
  const next = () => {
    if (last) {
      setGuest(false);
      router.replace("/map");
    } else {
      setStep((s) => s + 1);
    }
  };

  const toggleInterest = (tag: string) =>
    setInterests((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(tag)) nextSet.delete(tag);
      else nextSet.add(tag);
      return nextSet;
    });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Progress + back */}
      <View className="flex-row items-center gap-3 px-gutter pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tilbake"
          hitSlop={8}
          onPress={back}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-surfaceMuted"
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View className="flex-1 flex-row gap-1.5">
          {STEPS.map((s, i) => (
            <View
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-ember" : "bg-line"
              }`}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerClassName="grow gap-5 p-gutter pb-4">
        {step === 0 ? (
          <StepShell
            title="Hva liker du?"
            subtitle="Velg noen interesser så vi kan vise deg relevante møteplasser."
          >
            <View className="flex-row flex-wrap gap-2">
              {INTERESTS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={interests.has(tag)}
                  onPress={() => toggleInterest(tag)}
                />
              ))}
            </View>
          </StepShell>
        ) : null}

        {step === 1 ? (
          <StepShell
            title="Finn det i nærheten"
            subtitle="ThirdPlace bruker omtrentlig posisjon for å vise møteplasser rundt deg."
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => setLocationOn((v) => !v)}
              className={`items-center gap-3 rounded-2xl border p-6 ${
                locationOn
                  ? "border-ember bg-ember/5"
                  : "border-line bg-surface"
              }`}
            >
              <Ionicons
                name={locationOn ? "location" : "location-outline"}
                size={40}
                color={locationOn ? colors.ember : colors.muted}
              />
              <Text className="text-base font-semibold text-ink">
                {locationOn ? "Posisjon på (demo)" : "Slå på posisjon"}
              </Text>
              <Text className="text-center text-xs text-muted">
                {locationOn
                  ? "Du kan skru dette av når som helst."
                  : "Vi ber aldri om nøyaktig adresse."}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-2">
              <DemoBadge />
              <Text className="flex-1 text-xs text-muted">
                Demo — ingen reell posisjonstilgang bes om her.
              </Text>
            </View>
          </StepShell>
        ) : null}

        {step === 2 ? (
          <StepShell
            title="Hvordan vil du bruke ThirdPlace?"
            subtitle="Du kan bytte modus senere. Dette endrer ingenting ennå."
          >
            <View className="gap-3">
              {PERSONAS.map((p) => {
                const active = persona === p.key;
                return (
                  <Pressable
                    key={p.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setPersona(p.key)}
                    className={`flex-row items-center gap-3 rounded-2xl border p-4 ${
                      active
                        ? "border-ember bg-ember/5"
                        : "border-line bg-surface"
                    }`}
                  >
                    <Ionicons
                      name={p.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={active ? colors.ember : colors.ink}
                    />
                    <Text className="flex-1 text-base font-semibold text-ink">
                      {p.label}
                    </Text>
                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.ember}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <View className="flex-row items-center gap-2">
              <DemoBadge />
              <Text className="flex-1 text-xs text-muted">
                Demo — modus bytter ingen reell funksjon ennå.
              </Text>
            </View>
          </StepShell>
        ) : null}

        {step === 3 ? (
          <StepShell
            title="Klar!"
            subtitle="Velkommen til nabolaget. Utforsk kartet og finn din neste møteplass."
          >
            <View className="items-center gap-4 py-6">
              <Logo size={64} />
              <View className="flex-row items-center gap-2">
                <DemoBadge />
                <Text className="text-xs text-muted">
                  Demo — ingen konto opprettes.
                </Text>
              </View>
            </View>
          </StepShell>
        ) : null}
      </ScrollView>

      <View className="px-gutter pb-3">
        <Button
          label={last ? "Utforsk kartet" : "Neste"}
          variant="ember"
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
}

function StepShell({
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
        <Text className="text-2xl font-bold text-ink">{title}</Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}
