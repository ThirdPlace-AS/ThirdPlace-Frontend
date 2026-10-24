import { useCallback, useMemo, useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const WEEKDAYS = ["M", "T", "O", "T", "F", "L", "S"]; // Norwegian, Monday-first
const MONTHS = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

type Cell = { key: string; day: number | null; date: string | null };
type Month = { year: number; month: number };

function monthCells(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < offset; i++)
    cells.push({ key: `b${i}`, day: null, date: null });
  for (let d = 1; d <= days; d++)
    cells.push({ key: iso(year, month, d), day: d, date: iso(year, month, d) });
  return cells;
}

// How many months to append each time the list nears its end (lazy "infinite"
// forward scroll). The list only ever grows forward from the current month.
const PAGE = 6;

function monthsFrom(start: Date, count: number): Month[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
}

// Demo month calendar with date-range selection (MOCK — dates do not filter any
// results; no booking contract). The months scroll vertically INSIDE a fixed
// height so the card matches the reference flow; the weekday header stays pinned
// above. Scrolling near the end appends more months (lazy forward infinite
// scroll). A plain inner ScrollView is used (not FlatList) so it nests cleanly
// inside the sheet's outer vertical ScrollView without virtualization warnings.
// Controlled: parent owns start/end ISO strings. `monthCount` is the initial seed.
export function Calendar({
  start,
  end,
  onChange,
  monthCount = 4,
}: {
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  monthCount?: number;
}) {
  const today = useMemo(() => {
    const n = new Date();
    return iso(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  const [months, setMonths] = useState<Month[]>(() =>
    monthsFrom(new Date(), monthCount),
  );
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setMonths((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      const next = monthsFrom(new Date(last.year, last.month + 1, 1), PAGE);
      return [...prev, ...next];
    });
    // Allow the next append once the new months have rendered.
    setTimeout(() => {
      loadingRef.current = false;
    }, 0);
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (
      contentOffset.y + layoutMeasurement.height >=
      contentSize.height - 240
    ) {
      loadMore();
    }
  };

  const press = (date: string) => {
    if (!start || (start && end)) {
      onChange(date, null); // begin a new range
    } else if (date >= start) {
      onChange(start, date); // close the range
    } else {
      onChange(date, null); // tapped before start → restart
    }
  };

  return (
    <View className="gap-2">
      {/* Pinned weekday header */}
      <View className="flex-row justify-between">
        {WEEKDAYS.map((w, i) => (
          <Text
            key={i}
            className="w-9 text-center text-xs font-medium text-muted"
          >
            {w}
          </Text>
        ))}
      </View>
      <ScrollView
        style={{ maxHeight: 320 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        {months.map(({ year, month }) => (
          <View key={`${year}-${month}`} className="gap-2 pb-5">
            <View className="flex-row flex-wrap">
              {monthCells(year, month).map((c) => {
                if (c.day === null)
                  return <View key={c.key} className="h-9 w-[14.28%]" />;
                const date = c.date!;
                const past = date < today;
                const isStart = date === start;
                const isEnd = date === end;
                const inRange =
                  start !== null && end !== null && date > start && date < end;
                const endpoint = isStart || isEnd;
                return (
                  <View key={c.key} className="h-9 w-[14.28%] items-center">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: endpoint,
                        disabled: past,
                      }}
                      disabled={past}
                      onPress={() => press(date)}
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        endpoint ? "bg-ink" : inRange ? "bg-ember/10" : ""
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          past
                            ? "text-line line-through"
                            : endpoint
                              ? "font-semibold text-onInk"
                              : "text-ink"
                        }`}
                      >
                        {c.day}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
            <Text className="text-sm text-ink">
              {MONTHS[month]} {year}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
