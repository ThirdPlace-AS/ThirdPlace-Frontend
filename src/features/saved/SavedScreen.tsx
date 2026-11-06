import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import { HeartToggle, ListRow, Screen } from "@/components/ui";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { showToast } from "@/components/Toast";
import { EmptyState } from "@/components/states/StateView";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { businessById, experienceById, placeById } from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";
import { Illustration } from "@/components/illustrations/Illustration";
import { formatRating } from "@/lib/format";

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
                  meta: `Sted · ★ ${formatRating(p.rating)}`,
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
          <View
            accessibilityRole="radiogroup"
            className="flex-row flex-wrap gap-2 pb-2"
          >
            {FILTERS.map((f) => (
              <Chip
                key={f.label}
                label={f.label}
                size="sm"
                role="radio"
                selected={filter === f.key}
                onPress={() => setFilter(f.key)}
              />
            ))}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            illustration={<Illustration name="emptySaved" />}
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
            <ListRow
              variant="card"
              title={item.title}
              subtitle={item.meta}
              // Opens the saved item on the map (its detail), like a search hit.
              onPress={() =>
                router.navigate({
                  pathname: "/map",
                  params: { focus: item.key, at: String(Date.now()) },
                })
              }
              leading={
                place ? (
                  <Image
                    source={libImage(coverForPlace(place))}
                    contentFit="cover"
                    style={{ height: 48, width: 48, borderRadius: 10 }}
                    accessible={false}
                  />
                ) : (
                  <View className="h-12 w-12 rounded-md bg-surfaceMuted" />
                )
              }
              trailing={
                <HeartToggle
                  kind="bookmark"
                  selected
                  variant="ghost"
                  size="sm"
                  label={`Fjern ${item.title} fra lagret`}
                  onToggle={() => {
                    toggle(item.key);
                    showToast({
                      title: "Fjernet fra Lagret",
                      body: item.title,
                      icon: "bookmark-outline",
                      action: {
                        label: "Angre",
                        onPress: () => toggle(item.key),
                      },
                    });
                  }}
                />
              }
            />
          );
        }}
      />
    </Screen>
  );
}
