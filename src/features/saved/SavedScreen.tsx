import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

import { HeartToggle, ListRow, Screen } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gutterPx, motion } from "@/theme";
import { Chip } from "@/components/Chip";
import { RouteHeader } from "@/components/RouteHeader";
import { showToast } from "@/components/Toast";
import {
  ItemActionsSheet,
  ShareSheet,
} from "@/components/actions/ActionSheets";
import { EmptyState } from "@/components/states/StateView";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  businessById,
  experienceById,
  PLACE_KIND_LABEL,
  placeById,
  placeRating,
} from "@/fixtures";
import { experienceTypeLabel } from "@/components/map/services/itemType";
import { coverForPlace, libThumb } from "@/fixtures/images";
import { Illustration } from "@/components/illustrations/Illustration";
import { formatRating } from "@/lib/format";

// The list's padding and gaps as a style (review of the speed pass: no
// className on an animated component); the values the classes
// "gap-2 px-gutter pb-10 flex-grow" resolved to (NativeWind's rem is 14).
const LIST_CONTENT = {
  gap: 7,
  paddingHorizontal: gutterPx,
  paddingBottom: 35,
  flexGrow: 1,
};

type Kind = "place" | "experience" | "business";
type Row = {
  key: string;
  kind: Kind;
  title: string;
  meta: string;
  placeId?: string;
  // Phase 19: every saved thing opens a page, and "Vis på kartet" focuses a
  // pin (a saved business shows its place).
  href: Href;
  mapKey: string;
};
const FILTERS: { key: Kind | null; label: string }[] = [
  { key: null, label: "Alle" },
  // Bedrifter are places too; Steder holds the clubs and city spaces.
  { key: "place", label: "Steder" },
  { key: "experience", label: "Opplevelser" },
  { key: "business", label: "Bedrifter" },
];

// Lagret, per the design (PDF p14) — the one unified Saved surface
// (REQUIRED_V1, master spec §11). Reads the same in-memory store the map's
// "Lagret" mode and the swipe deck write to, so a save anywhere shows here.
// BLOCKED_CONTRACT_GAP: persistence is contract-blocked (CB-5) — the list
// clears on reload.
export default function SavedScreen() {
  const { savedIds, toggle } = useMapSaved();
  const { isGuest } = useGuestMode();
  const reduced = useReducedMotion();
  const savedExperienceCount = savedIds.filter((k) =>
    k.startsWith("experience:"),
  ).length;
  const [filter, setFilter] = useState<Kind | null>(null);
  // Long-press on a row (Phase 18): Fjern, Del, Vis på kartet.
  const [actionsFor, setActionsFor] = useState<{
    key: string;
    title: string;
  } | null>(null);
  const [shareFor, setShareFor] = useState<{
    key: string;
    title: string;
  } | null>(null);
  // The row put back with "Angre": the only row that fades in.
  const [restoredKey, setRestoredKey] = useState<string | null>(null);
  const unsave = (key: string, title: string) => {
    toggle(key);
    showToast({
      title: "Fjernet fra Lagret",
      body: title,
      icon: "bookmark-outline",
      action: {
        label: "Angre",
        onPress: () => {
          setRestoredKey(key);
          toggle(key);
        },
      },
    });
  };

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
                  kind: p.kind === "bedrift" ? "business" : "place",
                  title: p.name,
                  meta: `${PLACE_KIND_LABEL[p.kind]} · ★ ${formatRating(placeRating(p.id).score)}`,
                  placeId: p.id,
                  href: `/place/${p.id}` as Href,
                  mapKey: key,
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
                  meta: `${experienceTypeLabel(e)} · ${e.when}`,
                  placeId: e.placeId,
                  href: `/experience/${e.id}` as Href,
                  mapKey: key,
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
                  href: `/place/${b.placeId}` as Href,
                  mapKey: `place:${b.placeId}`,
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
      {/* Motion (user 2026-11-09: animations where they feel natural): an
          unsaved row fades out and the rows below close up; the one put back
          with "Angre" fades in. Nothing else fades in: not the list on
          opening, rows mounted while scrolling or rows a filter chip shows
          (review of the speed pass). */}
      <Animated.FlatList
        data={visible}
        keyExtractor={(r) => r.key}
        itemLayoutAnimation={
          reduced ? undefined : LinearTransition.duration(motion.duration.base)
        }
        contentContainerStyle={LIST_CONTENT}
        ListHeaderComponent={
          <View className="gap-3 pb-2">
            {/* Approved addition (2026-11-06): turn saved experiences into a
                group decision. Signed in, two or more saved experiences. */}
            {!isGuest && savedExperienceCount >= 2 ? (
              <ListRow
                variant="card"
                icon="people-outline"
                title="Sveip lagrede med venner"
                subtitle={`${savedExperienceCount} lagrede opplevelser`}
                onPress={() =>
                  router.push({
                    pathname: "/group-swipe",
                    params: { from: "saved" },
                  })
                }
              />
            ) : null}
            <View
              accessibilityRole="radiogroup"
              className="flex-row flex-wrap gap-2"
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
        ListFooterComponent={null}
        renderItem={({ item }) => {
          const place = item.placeId ? placeById(item.placeId) : undefined;
          return (
            // The animated wrapper carries no className (dropped on a cold
            // start, CLAUDE.md); the row inside keeps its own.
            <Animated.View
              entering={
                reduced || item.key !== restoredKey
                  ? undefined
                  : FadeIn.duration(motion.duration.base)
              }
              exiting={
                reduced ? undefined : FadeOut.duration(motion.duration.fast)
              }
            >
              <ListRow
                variant="card"
                title={item.title}
                subtitle={item.meta}
                onLongPress={() =>
                  setActionsFor({ key: item.key, title: item.title })
                }
                // Everything opens its page (a business opens its place).
                onPress={() => router.push(item.href)}
                leading={
                  place ? (
                    <Image
                      source={libThumb(coverForPlace(place))}
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
                    onToggle={() => unsave(item.key, item.title)}
                  />
                }
              />
            </Animated.View>
          );
        }}
      />
      {actionsFor ? (
        <ItemActionsSheet
          title={actionsFor.title}
          onClose={() => setActionsFor(null)}
          actions={[
            {
              label: "Fjern fra Lagret",
              icon: "bookmark-outline",
              afterClose: true,
              onPress: () => unsave(actionsFor.key, actionsFor.title),
            },
            {
              label: "Del",
              icon: "share-outline",
              afterClose: true,
              onPress: () => setShareFor(actionsFor),
            },
            {
              label: "Vis på kartet",
              icon: "map-outline",
              afterClose: true,
              onPress: () =>
                router.navigate({
                  pathname: "/map",
                  params: {
                    focus:
                      rows.find((r) => r.key === actionsFor.key)?.mapKey ??
                      actionsFor.key,
                    at: String(Date.now()),
                  },
                }),
            },
          ]}
        />
      ) : null}
      {shareFor ? (
        <ShareSheet
          title={shareFor.title}
          slug={shareFor.key.replace(":", "/")}
          onClose={() => setShareFor(null)}
        />
      ) : null}
    </Screen>
  );
}
