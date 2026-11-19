// All reviews of an experience or a place (Phase 12 H4a), a page as in the
// founder's reference video: back + search in the header, the big "★ 4,7",
// the count with a sort pill ("Nyeste ▾" → sort sheet with radios and
// "Lagre"), an optional search field and every review in full. Count and
// score come from the list (founder decision 2026-11-06: MOCK reviews).
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import { Button } from "@/components/Button";
import { ReviewCard, type ReviewLike } from "@/components/reviews/ReviewCard";
import {
  matchesReview,
  REVIEW_SORT_LABEL,
  sortReviews,
  type ReviewSort,
} from "@/components/reviews/reviewSort";
import {
  Header,
  Icon,
  IconButton,
  Pressable,
  Screen,
  SearchBar,
  Sheet,
  Text,
} from "@/components/ui";
import {
  experienceById,
  placeById,
  ratingOf,
  reviewsForExperience,
  reviewsForPlace,
} from "@/fixtures";
import { formatRating } from "@/lib/format";

export function AllReviewsScreen({ kind }: { kind: "experience" | "place" }) {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const reviews = useMemo<ReviewLike[]>(
    () =>
      kind === "experience" ? reviewsForExperience(id) : reviewsForPlace(id),
    [kind, id],
  );
  const name =
    kind === "experience" ? experienceById(id)?.title : placeById(id)?.name;
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const { score, count } = ratingOf(reviews);
  const list = useMemo(
    () => sortReviews(reviews, sort).filter((r) => matchesReview(r, query)),
    [reviews, sort, query],
  );

  return (
    <Screen edges={["top", "bottom"]}>
      <Header
        title={name ?? "Vurderinger"}
        border={false}
        trailing={
          <IconButton
            icon={searching ? "close" : "search"}
            label={searching ? "Lukk søk" : "Søk i vurderinger"}
            onPress={() => {
              setSearching((s) => !s);
              setQuery("");
            }}
          />
        }
      />
      {searching ? (
        <View className="px-gutter pb-3">
          <SearchBar
            placeholder="Søk i vurderinger"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      ) : null}
      <FlatList
        data={list}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-gutter pb-12"
        ListHeaderComponent={
          <View className="gap-1 pb-4 pt-2">
            <Text variant="display" accessibilityRole="header">
              {count ? `★ ${formatRating(score)}` : "Ingen vurderinger ennå"}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text variant="h2">
                {count} {count === 1 ? "vurdering" : "vurderinger"}
              </Text>
              {count > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Sorter: ${REVIEW_SORT_LABEL[sort]}`}
                  onPress={() => setSortOpen(true)}
                  contentClassName="flex-row items-center gap-1 rounded-full border border-line px-3 py-1.5"
                >
                  <Text variant="caption" weight="semibold">
                    {REVIEW_SORT_LABEL[sort]}
                  </Text>
                  <Icon name="chevron-down" size="sm" tone="ink" />
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View className="my-5 h-px bg-line" />}
        renderItem={({ item }) => <ReviewCard review={item} variant="list" />}
        ListEmptyComponent={
          query ? (
            <View className="gap-2 pt-4">
              <Text variant="body" weight="semibold">
                Ingen treff på «{query.trim()}»
              </Text>
              <Text variant="label" tone="muted" weight="regular">
                Prøv et annet ord.
              </Text>
            </View>
          ) : null
        }
      />
      <SortSheet
        visible={sortOpen}
        value={sort}
        onClose={() => setSortOpen(false)}
        onSave={(next) => {
          setSort(next);
          setSortOpen(false);
        }}
      />
    </Screen>
  );
}

function SortSheet({
  visible,
  value,
  onClose,
  onSave,
}: {
  visible: boolean;
  value: ReviewSort;
  onClose: () => void;
  onSave: (s: ReviewSort) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [shown, setShown] = useState(visible);
  // A fresh draft each time the sheet opens.
  if (visible !== shown) {
    setShown(visible);
    if (visible) setDraft(value);
  }
  return (
    <Sheet visible={visible} onClose={onClose} title="Sorter etter">
      <View accessibilityRole="radiogroup">
        {(Object.keys(REVIEW_SORT_LABEL) as ReviewSort[]).map((s) => {
          const on = s === draft;
          return (
            <Pressable
              key={s}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setDraft(s)}
              contentClassName="flex-row items-center justify-between border-b border-line py-4"
            >
              <Text variant="body" weight={on ? "semibold" : "regular"}>
                {REVIEW_SORT_LABEL[s]}
              </Text>
              <Icon
                name={on ? "radio-button-on" : "radio-button-off"}
                size="lg"
                tone="ink"
              />
            </Pressable>
          );
        })}
      </View>
      <View className="pt-4">
        <Button label="Lagre" variant="ink" onPress={() => onSave(draft)} />
      </View>
    </Sheet>
  );
}
