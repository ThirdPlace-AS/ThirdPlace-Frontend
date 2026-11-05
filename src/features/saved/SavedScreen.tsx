import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Icon, Screen } from "@/components/ui";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { showToast } from "@/components/Toast";
import { EmptyState } from "@/components/states/StateView";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { businessById, experienceById, placeById } from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";

type Kind = "place" | "experience" | "business";
type Row = {
  key: string;
  kind: Kind;
  title: string;
  meta: string;
  placeId?: string;
};
const FILTERS: { key: Kind | null; label: string }[] = [
  { key: null, label: "Alle" },
  { key: "place", label: "Steder" },
  { key: "experience", label: "Opplevelser" },
  { key: "business", label: "Bedrifter" },
];

// Lagret (DEMO), per the design (PDF p14) — the one unified Saved surface
// (REQUIRED_V1, master spec §11). Reads the same in-memory store the map's
// "Lagret" mode and the swipe deck write to, so a save anywhere shows here.
// BLOCKED_CONTRACT_GAP: persistence is contract-blocked (CB-5) — the list
// clears on reload.
export default function SavedScreen() {
  const { savedIds, toggle } = useMapSaved();
  const [filter, setFilter] = useState<Kind | null>(null);

  const rows = useMemo<Row[]>(
    () =>
      savedIds.flatMap((key): Row[] => {
        const [kind, id] = key.split(":") as [string, string];
        if (kind === "place") {
          const p = placeById(id);
          return p
            ? [
                {
                  key,
                  kind: "place",
                  title: p.name,
                  meta: `Sted · ★ ${p.rating.toFixed(1)}`,
                  placeId: p.id,
                },
              ]
            : [];
        }
        if (kind === "experience") {
          const e = experienceById(id);
          return e
            ? [
                {
                  key,
                  kind: "experience",
                  title: e.title,
                  meta: `Opplevelse · ${e.when}`,
                  placeId: e.placeId,
                },
              ]
            : [];
        }
        if (kind === "business") {
          const b = businessById(id);
          return b
            ? [
                {
                  key,
                  kind: "business",
                  title: b.name,
                  meta: `Bedrift · ${b.category}`,
                  placeId: b.placeId,
                },
              ]
            : [];
        }
        return [];
      }),
    [savedIds],
  );
  const visible = filter ? rows.filter((r) => r.kind === filter) : rows;

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Lagret" />
      <FlatList
        data={visible}
        keyExtractor={(r) => r.key}
        contentContainerClassName="gap-2 px-gutter pb-10 flex-grow"
        ListHeaderComponent={
          <View className="flex-row flex-wrap gap-2 pb-2">
            {FILTERS.map((f) => (
              <Chip
                key={f.label}
                label={f.label}
                selected={filter === f.key}
                onPress={() => setFilter(f.key)}
              />
            ))}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="Ingenting lagret – ennå"
            message="Lagre stedene og opplevelsene du ikke vil gå glipp av."
            actionLabel="Utforsk kartet"
            onAction={() => router.navigate("/map")}
          />
        }
        ListFooterComponent={
          rows.length > 0 ? (
            <View className="pt-3">
              <DemoNote>Lagret tømmes når appen startes på nytt.</DemoNote>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const place = item.placeId ? placeById(item.placeId) : undefined;
          return (
            <View className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3">
              {place ? (
                <Image
                  source={libImage(coverForPlace(place))}
                  contentFit="cover"
                  style={{ height: 48, width: 48, borderRadius: 10 }}
                  className="bg-surfaceMuted"
                />
              ) : (
                <View className="h-12 w-12 rounded-md bg-surfaceMuted" />
              )}
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-ink"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-muted font-normal">
                  {item.meta}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Fjern ${item.title} fra lagret`}
                hitSlop={8}
                onPress={() => {
                  toggle(item.key);
                  showToast({
                    title: "Fjernet fra Lagret",
                    body: item.title,
                    icon: "bookmark-outline",
                  });
                }}
              >
                <Icon name="bookmark" size="md" tone="ink" />
              </Pressable>
            </View>
          );
        }}
      />
    </Screen>
  );
}
