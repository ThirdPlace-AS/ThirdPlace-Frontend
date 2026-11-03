import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { Input } from "@/components/Input";
import { experiences, OSLO_AREAS } from "@/fixtures";
import { colors } from "@/theme";

import { type AddDraft, type AddKind, EMPTY_DRAFT } from "./types";

// Bundled sample art reused as the demo photo pool (MOCK — no media contract).
const PHOTO_POOL = experiences.flatMap((e) => e.photos);

const KINDS: {
  kind: AddKind;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    kind: "place",
    label: "Sted",
    hint: "En kafé, bar eller et verksted",
    icon: "cafe-outline",
  },
  {
    kind: "experience",
    label: "Opplevelse",
    hint: "Noe som skjer til en bestemt tid",
    icon: "calendar-outline",
  },
  {
    kind: "group",
    label: "Gruppe",
    hint: "Et fellesskap folk kan bli med i",
    icon: "people-outline",
  },
];

const CATEGORIES: Record<AddKind, string[]> = {
  place: ["Kafé", "Bokcafé", "Vinbar", "Verksted", "Galleri", "Uterom"],
  experience: ["Konsert", "Lesesirkel", "Trening", "Matlaging", "Kunst", "Tur"],
  group: ["Hobby", "Sport", "Kultur", "Mat & drikke", "Natur", "Nabolag"],
};

const WHEN_OPTIONS = ["I kveld", "I morgen", "Denne helgen", "Neste uke"];

type StepKey =
  | "kind"
  | "name"
  | "category"
  | "where"
  | "when"
  | "photo"
  | "review";

function stepsFor(kind: AddKind | null): StepKey[] {
  const base: StepKey[] = ["kind", "name", "category", "where"];
  if (kind === "experience") base.push("when");
  base.push("photo", "review");
  return base;
}

const KIND_LABEL: Record<AddKind, string> = {
  place: "sted",
  experience: "opplevelse",
  group: "gruppe",
};

export function AddWizard() {
  const [draft, setDraft] = useState<AddDraft>(EMPTY_DRAFT);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const steps = useMemo(() => stepsFor(draft.kind), [draft.kind]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const patch = (p: Partial<AddDraft>) => setDraft((d) => ({ ...d, ...p }));

  const canAdvance = (() => {
    switch (step) {
      case "kind":
        return draft.kind !== null;
      case "name":
        return draft.title.trim().length >= 3;
      case "category":
        return draft.category !== null;
      case "where":
        return (draft.area ?? "").trim().length > 0;
      case "when":
        return draft.when !== null;
      default:
        return true;
    }
  })();

  const isLast = step === "review";
  const next = () => (isLast ? setSubmitted(true) : setStepIndex((i) => i + 1));
  const back = () => setStepIndex((i) => Math.max(0, i - 1));
  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setStepIndex(0);
    setSubmitted(false);
  };

  if (submitted) {
    return <SubmittedState draft={draft} onReset={reset} />;
  }

  const progress = (stepIndex + 1) / steps.length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Progress + close */}
      <View className="gap-3 px-gutter pb-2 pt-1">
        <View className="h-1 overflow-hidden rounded-full bg-surfaceMuted">
          <View
            className="h-1 rounded-full bg-ember"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
        <Text className="text-xs text-muted">
          Steg {stepIndex + 1} av {steps.length}
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="gap-5 p-gutter"
        keyboardShouldPersistTaps="handled"
      >
        {step === "kind" ? (
          <StepShell
            title="Hva vil du dele?"
            subtitle="Velg hva du legger til i nabolaget."
          >
            <View className="gap-3">
              {KINDS.map((k) => (
                <SelectCard
                  key={k.kind}
                  icon={k.icon}
                  label={k.label}
                  hint={k.hint}
                  selected={draft.kind === k.kind}
                  onPress={() => patch({ kind: k.kind, category: null })}
                />
              ))}
            </View>
          </StepShell>
        ) : null}

        {step === "name" ? (
          <StepShell
            title="Gi det et navn"
            subtitle="Et tydelig navn og en kort beskrivelse."
          >
            <View className="gap-4">
              <Input
                label="Navn"
                placeholder="Hva heter det?"
                value={draft.title}
                onChangeText={(t) => patch({ title: t })}
                maxLength={60}
                autoFocus
              />
              <Input
                label="Kort beskrivelse"
                placeholder="Fortell litt om det …"
                value={draft.summary}
                onChangeText={(t) => patch({ summary: t })}
                multiline
                maxLength={240}
              />
            </View>
          </StepShell>
        ) : null}

        {step === "category" && draft.kind ? (
          <StepShell
            title="Velg kategori"
            subtitle="Dette hjelper folk å finne det."
          >
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES[draft.kind].map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={draft.category === c}
                  onPress={() => patch({ category: c })}
                />
              ))}
            </View>
          </StepShell>
        ) : null}

        {step === "where" ? (
          <StepShell title="Hvor er det?" subtitle="Velg et område i Oslo.">
            <View className="flex-row flex-wrap gap-2">
              {OSLO_AREAS.map((a) => (
                <Chip
                  key={a.name}
                  label={a.name}
                  selected={draft.area === a.name}
                  onPress={() => patch({ area: a.name })}
                />
              ))}
            </View>
          </StepShell>
        ) : null}

        {step === "when" ? (
          <StepShell
            title="Når skjer det?"
            subtitle="Velg et omtrentlig tidspunkt."
          >
            <View className="gap-3">
              {WHEN_OPTIONS.map((w) => (
                <SelectCard
                  key={w}
                  icon="time-outline"
                  label={w}
                  selected={draft.when === w}
                  onPress={() => patch({ when: w })}
                />
              ))}
            </View>
          </StepShell>
        ) : null}

        {step === "photo" ? (
          <StepShell
            title="Legg til et bilde"
            subtitle="Valgfritt — velg et bilde som passer."
          >
            <View className="flex-row flex-wrap gap-3">
              {PHOTO_POOL.map((src, i) => {
                const selected = draft.photoIndex === i;
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={`Bilde ${i + 1}`}
                    onPress={() => patch({ photoIndex: selected ? null : i })}
                    className={`overflow-hidden rounded-lg border-2 ${
                      selected ? "border-ember" : "border-transparent"
                    }`}
                  >
                    <Image
                      source={src}
                      style={{ width: 104, height: 104 }}
                      contentFit="cover"
                      transition={160}
                    />
                  </Pressable>
                );
              })}
            </View>
          </StepShell>
        ) : null}

        {step === "review" ? <ReviewStep draft={draft} /> : null}
      </ScrollView>

      {/* Sticky footer */}
      <View className="flex-row gap-3 border-t border-line bg-background px-gutter pb-2 pt-3">
        {stepIndex > 0 ? (
          <View className="flex-1">
            <Button label="Tilbake" variant="secondary" onPress={back} />
          </View>
        ) : null}
        <View className="flex-1">
          <Button
            label={isLast ? "Publiser" : "Neste"}
            variant={isLast ? "ember" : "ink"}
            disabled={!canAdvance}
            onPress={next}
          />
        </View>
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
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-5">
      <View className="gap-1.5">
        <Text className="text-2xl font-bold text-ink">{title}</Text>
        {subtitle ? (
          <Text className="text-base text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function SelectCard({
  icon,
  label,
  hint,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-lg border bg-surface px-4 py-4 ${
        selected ? "border-ember" : "border-line"
      } active:opacity-80`}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          selected ? "bg-ember" : "bg-surfaceMuted"
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={selected ? colors.onEmber : colors.ink}
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{label}</Text>
        {hint ? <Text className="text-sm text-muted">{hint}</Text> : null}
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.ember} />
      ) : null}
    </Pressable>
  );
}

function ReviewStep({ draft }: { draft: AddDraft }) {
  return (
    <View className="gap-5">
      <View className="gap-1.5">
        <Text className="text-2xl font-bold text-ink">Se over</Text>
        <Text className="text-base text-muted">
          Sjekk at alt stemmer før du publiserer.
        </Text>
      </View>
      <View className="overflow-hidden rounded-xl border border-line bg-surface">
        {draft.photoIndex !== null ? (
          <Image
            source={PHOTO_POOL[draft.photoIndex]}
            style={{ width: "100%", height: 160 }}
            contentFit="cover"
          />
        ) : null}
        <View className="gap-3 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-ink">
              {draft.title || "Uten navn"}
            </Text>
            <DemoBadge />
          </View>
          {draft.summary ? (
            <Text className="text-sm text-muted">{draft.summary}</Text>
          ) : null}
          <View className="gap-2 pt-1">
            {draft.kind ? (
              <SummaryRow
                icon="pricetag-outline"
                value={`${KIND_LABEL[draft.kind]} · ${draft.category ?? "—"}`}
              />
            ) : null}
            {draft.area ? (
              <SummaryRow icon="location-outline" value={draft.area} />
            ) : null}
            {draft.when ? (
              <SummaryRow icon="time-outline" value={draft.when} />
            ) : null}
          </View>
        </View>
      </View>
      <View className="flex-row items-start gap-2 rounded-lg border border-line bg-surfaceMuted px-4 py-3">
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.muted}
        />
        <Text className="flex-1 text-sm text-muted">
          Dette er en demo. Ingenting publiseres eller sendes — appen har ingen
          server ennå.
        </Text>
      </View>
    </View>
  );
}

function SummaryRow({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text className="text-sm text-ink">{value}</Text>
    </View>
  );
}

function SubmittedState({
  draft,
  onReset,
}: {
  draft: AddDraft;
  onReset: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center gap-5 p-gutter">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surfaceMuted">
          <Ionicons name="eye-off-outline" size={28} color={colors.ink} />
        </View>
        <View className="items-center gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-bold text-ink">
              {draft.title || "Utkast"}
            </Text>
            <DemoBadge label="IKKE PUBLISERT" />
          </View>
          <Text className="px-6 text-center text-base text-muted">
            Demo — ingenting ble publisert eller lagret. En ekte publisering
            krever innlogging og en server, som ikke er aktiv ennå.
          </Text>
        </View>
        <View className="w-full gap-3 pt-2">
          <Button label="Start på nytt" variant="ink" onPress={onReset} />
        </View>
      </View>
    </SafeAreaView>
  );
}
