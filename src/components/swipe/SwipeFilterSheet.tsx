import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { CheckboxRow } from "@/components/CheckboxRow";
import { DemoBadge } from "@/components/DemoBadge";
import { TypeChip } from "@/components/map/TypeChip";
import { experiences, TIME_WINDOWS } from "@/fixtures";
import { colors, motion } from "@/theme";

import { tagIcon } from "./SwipeCard";
import {
  activeSwipeFilterCount,
  applySwipeFilters,
  DEFAULT_SWIPE_FILTERS,
  type SwipeFilters,
} from "./swipeFilters";

// Re-export the pure filter model so existing import sites (SwipeDeck, tests)
// keep importing from this module; the logic now lives in ./swipeFilters
// (no Reanimated, so it is unit-testable in isolation).
export {
  activeSwipeFilterCount,
  applySwipeFilters,
  DEFAULT_SWIPE_FILTERS,
  type SwipeFilters,
};

// The swipe "Filtre" panel. Carries the map Filtre look (a muted card-stack
// surface, white Section cards, a sticky "Fjern alt + Vis N" footer) with the
// swipe's finer facets: interests (tags) plus the data-backed "Når" (TimeWindow)
// and availability. The deck MODE (For deg / Denne uka / Ledige) lives only in
// the top tab bar — it is NOT duplicated here. It slides in from the LEFT edge
// (notifications enter from the right). Every facet filters the deck locally
// only. No invented ranking (BLOCKED_CONTRACT_GAP).

// A titled white card — the same "stack of cards on a muted sheet" look as the
// map's Filtre sheet.
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface px-5 py-5">
      <View className="gap-0.5">
        <Text className="text-base font-semibold text-ink">{title}</Text>
        {subtitle ? (
          <Text className="text-xs text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function SwipeFilterSheet({
  visible,
  value,
  onClose,
  onApply,
}: {
  visible: boolean;
  value: SwipeFilters;
  onClose: () => void;
  onApply: (f: SwipeFilters) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Mount the body only while open so the slide replays and the draft seeds
          fresh from `value` on each open. */}
      {visible ? (
        <FilterBody value={value} onClose={onClose} onApply={onApply} />
      ) : null}
    </Modal>
  );
}

function FilterBody({
  value,
  onClose,
  onApply,
}: {
  value: SwipeFilters;
  onClose: () => void;
  onApply: (f: SwipeFilters) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const translateX = useSharedValue(reduced ? 0 : -width);

  // Slide in from the LEFT on mount (mirror of the notifications screen, which
  // enters from the right).
  useEffect(() => {
    translateX.value = reduced
      ? 0
      : withTiming(0, { duration: motion.duration.base });
  }, [reduced, translateX, width]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const [draft, setDraft] = useState<SwipeFilters>(value);

  const allTags = Array.from(
    new Set(
      experiences
        .filter((e) => e.status !== "cancelled")
        .flatMap((e) => e.tags),
    ),
  );

  const toggleTag = (t: string) =>
    setDraft((d) => ({
      ...d,
      tags: d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t],
    }));

  const resultCount = applySwipeFilters(experiences, draft).length;
  const footerLabel =
    resultCount === 0 ? "Ingen forslag" : `Vis ${resultCount} forslag`;

  return (
    <Animated.View
      className="flex-1 gap-4 bg-surfaceMuted px-gutter pb-8"
      style={[slideStyle, { paddingTop: insets.top + 8 }]}
    >
      {/* Dark status-bar content over the light panel. */}
      <StatusBar style="dark" />

      {/* Header: back + title + close, like the notifications screen. */}
      <View className="flex-row items-center gap-2 border-b border-line pb-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tilbake"
          onPress={onClose}
          hitSlop={8}
          className="-ml-1 h-10 w-10 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-ink">Filtre</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lukk"
          onPress={onClose}
          hitSlop={8}
        >
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Honesty marker — local-only filtering, no server request. */}
        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — filtrerer kun forslagene lokalt, ingen serverforespørsel.
          </Text>
        </View>

        {/* Interesser — real local filter on the fixture's tags. */}
        <Section title="Interesser">
          <View className="flex-row flex-wrap gap-2">
            {allTags.map((t) => (
              <TypeChip
                key={t}
                label={t}
                icon={tagIcon(t)}
                selected={draft.tags.includes(t)}
                onPress={() => toggleTag(t)}
              />
            ))}
          </View>
        </Section>

        {/* Når — real local filter on the fixture's TimeWindow (day). */}
        <Section title="Når">
          <View className="flex-row flex-wrap gap-2">
            {TIME_WINDOWS.map((w) => (
              <TypeChip
                key={w}
                label={w}
                icon="calendar-outline"
                selected={draft.when === w}
                onPress={() =>
                  setDraft((d) => ({ ...d, when: d.when === w ? null : w }))
                }
              />
            ))}
          </View>
        </Section>

        {/* Tilgjengelighet — real local filter on capacity. */}
        <Section title="Tilgjengelighet">
          <CheckboxRow
            label="Ledige plasser"
            hint="Skjul fulle opplevelser"
            checked={draft.hasSpots}
            onToggle={() => setDraft((d) => ({ ...d, hasSpots: !d.hasSpots }))}
          />
        </Section>
      </ScrollView>

      {/* Sticky footer — "Fjern alt" link + wide primary "Vis N" button. */}
      <View className="flex-row items-center gap-2 border-t border-line pt-3">
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setDraft({ ...DEFAULT_SWIPE_FILTERS, mode: draft.mode })
          }
          className="px-2 py-3"
        >
          <Text className="text-base font-semibold text-ink underline">
            Fjern alt
          </Text>
        </Pressable>
        <View className="flex-1">
          <Button
            label={footerLabel}
            variant="ember"
            rounded="full"
            icon="search"
            disabled={resultCount === 0}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
}
