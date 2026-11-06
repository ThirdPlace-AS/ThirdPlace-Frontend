import { Pressable, ScrollView, Text, View } from "react-native";

import {
  elevation,
  palette,
  radius,
  setSchemePreference,
  useScheme,
  useSchemePreference,
  type SchemePreference,
} from "@/theme";
import { Screen, Text as UIText } from "@/components/ui";
import { CategoryArt } from "@/components/illustrations/CategoryArt";
import {
  Illustration,
  type IllustrationName,
} from "@/components/illustrations/Illustration";
import type { ArtKey } from "@/assets/3d/manifest";

const ART_KEYS: ArtKey[] = [
  "cafe",
  "bar",
  "restaurant",
  "outdoors",
  "culture",
  "workshop",
  "tasting",
  "music",
  "hiking",
  "art",
  "sport",
  "social",
  "place",
  "experience",
  "location",
];
const ILLUSTRATIONS: IllustrationName[] = [
  "offline",
  "error",
  "maintenance",
  "update",
  "emptySaved",
  "emptyDeck",
  "emptyPlans",
];

const SAMPLE_BODY = "Finn ditt neste stamsted i nabolaget.";

function SpecimenLines() {
  return (
    <>
      <UIText variant="display">Velkommen hjem</UIText>
      <UIText variant="h1">Jazzkveld på Blå</UIText>
      <UIText variant="title">Grünerløkka Bokcafé</UIText>
      <UIText variant="body">{SAMPLE_BODY}</UIText>
      <UIText variant="label" weight="semibold">
        Bli med · Lagre · 0123456789
      </UIText>
      <UIText variant="caption" tone="muted">
        Lørdag 1. august · 20:00 · 1,2 km
      </UIText>
      <UIText variant="micro" tone="muted">
        Aktive samtaler · ÆØÅ æøå
      </UIText>
    </>
  );
}

// Design-system specimen (docs/design/DESIGN_SYSTEM.md). Dev-only preview of
// the semantic colours in both schemes, radius, elevation and the type scale —
// used for founder sign-off on the dark palette. Not part of the product UI.

const PREFS: SchemePreference[] = ["light", "dark", "system"];
const TYPE = [
  "display",
  "h1",
  "h2",
  "title",
  "body",
  "label",
  "caption",
  "micro",
] as const;
const RADII = ["xs", "sm", "md", "lg", "xl", "2xl", "full"] as const;
const RADIUS_CLASS: Record<(typeof RADII)[number], string> = {
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};
// Literal class names so Tailwind's content scan generates them.
const SWATCH_CLASS: Record<string, string> = {
  background: "bg-background",
  surface: "bg-surface",
  surfaceRaised: "bg-surfaceRaised",
  surfaceMuted: "bg-surfaceMuted",
  line: "bg-line",
  ink: "bg-ink",
  onInk: "bg-onInk",
  muted: "bg-muted",
  ember: "bg-ember",
  onEmber: "bg-onEmber",
  emberStrong: "bg-emberStrong",
  success: "bg-success",
  onSuccess: "bg-onSuccess",
  danger: "bg-danger",
  warning: "bg-warning",
  scrim: "bg-scrim",
  onMedia: "bg-onMedia",
  emberText: "bg-emberText",
  successText: "bg-successText",
  dangerText: "bg-dangerText",
  warningText: "bg-warningText",
};

export default function ThemeSandbox() {
  const scheme = useScheme();
  const pref = useSchemePreference();
  const hex = palette[scheme];

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-section p-gutter pb-20">
        <View className="gap-sm">
          <Text className="text-h1 font-bold text-ink">Designsystem</Text>
          <Text className="text-caption text-muted font-normal">
            Forhåndsvisning — aktiv modus: {scheme}
          </Text>
          <View
            className="flex-row gap-sm"
            accessibilityRole="radiogroup"
            accessibilityLabel="Fargemodus"
          >
            {PREFS.map((p) => {
              const selected = p === pref;
              return (
                <Pressable
                  key={p}
                  onPress={() => setSchemePreference(p)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={`h-11 justify-center rounded-full px-lg ${
                    selected ? "bg-ink" : "bg-surfaceMuted"
                  }`}
                >
                  <Text
                    className={`text-label font-medium ${
                      selected ? "text-onInk" : "text-ink"
                    }`}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Section title="Farger">
          <View className="flex-row flex-wrap gap-md">
            {Object.keys(hex).map((key) => (
              <View key={key} className="w-[30%] gap-xs">
                <View
                  className={`h-14 rounded-md border border-line ${SWATCH_CLASS[key] ?? ""}`}
                />
                <Text className="text-caption font-medium text-ink">{key}</Text>
                <Text className="text-micro text-muted font-normal">
                  {hex[key]}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Skrift">
          <View className="gap-xs rounded-lg border border-line bg-surface p-gutter">
            <UIText variant="micro" tone="muted">
              DM Sans · valgt 2026-11-05
            </UIText>
            <SpecimenLines />
          </View>
        </Section>

        <Section title="Typografi (Text-komponent)">
          {TYPE.map((t) => (
            <UIText key={t} variant={t}>
              {t} — Kaffe på Grünerløkka
            </UIText>
          ))}
        </Section>

        <Section title="Kategorikunst">
          <View className="flex-row flex-wrap gap-3">
            {ART_KEYS.map((k) => (
              <View key={k} className="items-center gap-1">
                <View className="rounded-lg bg-surface p-2">
                  <CategoryArt name={k} size={64} />
                </View>
                <UIText variant="micro" tone="muted">
                  {k}
                </UIText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Illustrasjoner">
          <View className="flex-row flex-wrap gap-3">
            {ILLUSTRATIONS.map((k) => (
              <View key={k} className="rounded-lg bg-surface p-2">
                <Illustration name={k} width={140} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Hjørner">
          <View className="flex-row flex-wrap gap-md">
            {RADII.map((r) => (
              <View key={r} className="items-center gap-xs">
                <View
                  className={`h-14 w-14 border border-line bg-surface ${RADIUS_CLASS[r]}`}
                />
                <Text className="text-micro text-muted font-normal">
                  {r} · {radius[r]}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Høyde (elevation)">
          <View className="flex-row gap-lg">
            {(["e1", "e2", "e3"] as const).map((e) => (
              <View
                key={e}
                style={elevation[e]}
                className="h-20 flex-1 items-center justify-center rounded-lg bg-surfaceRaised"
              >
                <Text className="text-label font-medium text-ink">{e}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Knapper">
          <View className="gap-md">
            <View className="h-12 items-center justify-center rounded-full bg-ink">
              <Text className="text-label font-semibold text-onInk">
                Logg inn
              </Text>
            </View>
            <View className="h-12 items-center justify-center rounded-full bg-ember">
              <Text className="text-label font-semibold text-onEmber">
                Opprett konto
              </Text>
            </View>
            <View className="h-12 items-center justify-center rounded-full bg-surfaceMuted">
              <Text className="text-label font-semibold text-ink">
                Fortsett med Google
              </Text>
            </View>
            <View className="h-12 items-center justify-center rounded-full bg-danger/15">
              <Text className="text-label font-semibold text-dangerText">
                Opasitet: bg-danger/15
              </Text>
            </View>
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-md">
      <Text className="text-micro font-medium uppercase text-muted">
        {title}
      </Text>
      {children}
    </View>
  );
}
