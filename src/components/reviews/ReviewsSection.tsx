// "Vurderinger" section of an experience or place page (Phase 12 H4a), laid
// out like the founder's reference video: "★ 4,7 · 3 vurderinger" as the
// section title, a horizontal rail of review cards with hairline dividers, a
// grey "Vis alle vurderinger" button and the underlined "Slik fungerer
// vurderinger" link. Count and score are derived from the list shown.
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { Pressable, Sheet, Text } from "@/components/ui";
import { ratingOf } from "@/fixtures";
import { formatRating } from "@/lib/format";

import { ReviewCard, type ReviewLike } from "./ReviewCard";
import { sortReviews } from "./reviewSort";

/** "★ 4,7 · 3 vurderinger" (or "Ingen vurderinger ennå"). */
export function ratingTitle(reviews: readonly ReviewLike[]): string {
  const { score, count } = ratingOf(reviews);
  if (count === 0) return "Ingen vurderinger ennå";
  return `★ ${formatRating(score)} · ${count} ${count === 1 ? "vurdering" : "vurderinger"}`;
}

export function ReviewsSection({
  reviews,
  onShowAll,
}: {
  reviews: readonly ReviewLike[];
  onShowAll: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const newest = sortReviews(reviews, "newest");
  return (
    <View className="gap-4">
      <Text variant="h2" accessibilityRole="header">
        {ratingTitle(reviews)}
      </Text>
      {newest.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={292}
          decelerationRate="fast"
          // Plain style: the gap must hold on a cold start.
          contentContainerStyle={{ gap: 0 }}
        >
          {newest.map((r, i) => (
            <View
              key={r.id}
              style={{ width: 292 }}
              className={`pr-5 ${i > 0 ? "border-l border-line pl-5" : ""}`}
            >
              <ReviewCard review={r} />
            </View>
          ))}
        </ScrollView>
      ) : null}
      {newest.length > 0 ? (
        <Button
          label="Vis alle vurderinger"
          variant="secondary"
          onPress={onShowAll}
        />
      ) : null}
      <Pressable
        accessibilityRole="link"
        onPress={() => setInfoOpen(true)}
        hitSlop={8}
        className="self-center"
      >
        <Text variant="caption" tone="muted" className="underline">
          Slik fungerer vurderinger
        </Text>
      </Pressable>
      <RatingsInfoSheet visible={infoOpen} onClose={() => setInfoOpen(false)} />
    </View>
  );
}

/** What the rating line shows, in plain words (no policy claims). */
export function RatingsInfoSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Slik fungerer vurderinger"
    >
      <View className="gap-3">
        <Text variant="body">
          Snittet øverst er regnet ut fra alle vurderingene på denne siden.
        </Text>
        <Text variant="body">
          Du kan sortere dem etter dato eller antall stjerner, og søke i
          teksten.
        </Text>
        <Button label="Ok" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}
