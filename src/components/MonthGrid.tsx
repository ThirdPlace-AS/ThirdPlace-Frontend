import { View } from "react-native";

import { IconButton, Pressable as UIPressable, Text } from "@/components/ui";
import { dayMonthLabel, isoDay, monthTitle, monthWeeks } from "@/lib/dates";

const WEEKDAYS = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

// One month, Monday first (Phase 18, Mine planer's month view, after Google
// Calendar and Apple Calendar): a dot under each day that has something on
// it, the chosen day filled. Tapping the chosen day again clears it.
export function MonthGrid({
  month,
  marked,
  selected,
  onSelect,
  onMonthChange,
  today = new Date(),
}: {
  /** Any date in the month to show. */
  month: Date;
  /** Days with something on them, as "yyyy-mm-dd" → how many. */
  marked: Map<string, number>;
  selected: string | null;
  onSelect: (iso: string | null) => void;
  onMonthChange: (delta: -1 | 1) => void;
  today?: Date;
}) {
  const todayIso = isoDay(today);
  return (
    <View className="gap-2 rounded-lg border border-line bg-surface p-3">
      <View className="flex-row items-center">
        <Text
          variant="label"
          weight="semibold"
          className="flex-1"
          accessibilityRole="header"
        >
          {monthTitle(month)}
        </Text>
        <IconButton
          icon="chevron-back"
          label="Forrige måned"
          size="sm"
          onPress={() => onMonthChange(-1)}
        />
        <IconButton
          icon="chevron-forward"
          label="Neste måned"
          size="sm"
          onPress={() => onMonthChange(1)}
        />
      </View>
      <View className="flex-row">
        {WEEKDAYS.map((w) => (
          <Text
            key={w}
            variant="caption"
            tone="muted"
            className="flex-1 text-center"
            accessible={false}
          >
            {w}
          </Text>
        ))}
      </View>
      {monthWeeks(month).map((week, i) => (
        <View key={i} className="flex-row">
          {week.map((d, j) => {
            if (!d) return <View key={j} className="flex-1" />;
            const iso = isoDay(d);
            const count = marked.get(iso) ?? 0;
            const isSel = selected === iso;
            const label = `${dayMonthLabel(d)}${
              count > 0 ? `, ${count} ${count === 1 ? "plan" : "planer"}` : ""
            }`;
            return (
              <UIPressable
                key={j}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: isSel }}
                onPress={() => onSelect(isSel ? null : iso)}
                className="flex-1 items-center"
                contentClassName="items-center gap-0.5 py-1"
              >
                <View
                  className={`h-9 w-9 items-center justify-center rounded-full ${
                    isSel
                      ? "bg-ink"
                      : iso === todayIso
                        ? "border border-ink"
                        : ""
                  }`}
                >
                  <Text
                    variant="label"
                    weight={count > 0 ? "semibold" : "regular"}
                    tone={isSel ? "onInk" : "ink"}
                  >
                    {d.getDate()}
                  </Text>
                </View>
                <View
                  className={`h-1.5 w-1.5 rounded-full ${
                    count > 0 ? "bg-ember" : ""
                  }`}
                />
              </UIPressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
