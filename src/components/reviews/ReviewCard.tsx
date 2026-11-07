// One guest review (Phase 12 H4a), as in the founder's reference video:
// avatar, name, area, stars · age, then the text. "rail" clamps the text for
// the horizontal Vurderinger rail; "list" shows it all (all-reviews page).
import { View } from "react-native";

import { Avatar, Icon, Text } from "@/components/ui";

export type ReviewLike = {
  id: string;
  author: string;
  area?: string;
  rating: number;
  when: string;
  text: string;
};

export function Stars({ rating }: { rating: number }) {
  return (
    <View
      className="flex-row"
      accessible
      accessibilityLabel={`${rating} av 5 stjerner`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name={n <= Math.round(rating) ? "star" : "star-outline"}
          size="sm"
          tone="ink"
        />
      ))}
    </View>
  );
}

export function ReviewCard({
  review,
  variant = "rail",
}: {
  review: ReviewLike;
  variant?: "rail" | "list";
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-3">
        <Avatar name={review.author} size="md" decorative />
        <View className="flex-1">
          <Text variant="label" weight="semibold" numberOfLines={1}>
            {review.author}
          </Text>
          {review.area ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {review.area}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Stars rating={review.rating} />
        <Text variant="caption" tone="muted">
          · {review.when}
        </Text>
      </View>
      <Text
        variant="label"
        weight="regular"
        numberOfLines={variant === "rail" ? 4 : undefined}
      >
        {review.text}
      </Text>
    </View>
  );
}
