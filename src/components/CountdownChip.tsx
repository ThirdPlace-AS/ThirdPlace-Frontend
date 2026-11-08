import { View } from "react-native";

import { Text } from "@/components/ui";
import { sessionsFor, type MockExperience } from "@/fixtures";
import { countdownLabel } from "@/lib/dates";

/** How long until the experience's next time ("I morgen"), or null. */
export function planCountdown(
  exp: MockExperience,
  now: Date = new Date(),
): string | null {
  const next = sessionsFor(exp, now).find(
    (s) => s.start.getTime() > now.getTime(),
  );
  return next ? countdownLabel(next.start, now) : null;
}

/** Countdown chip on upcoming plans (Mine planer, Neste plan): today and
 *  tonight in ink, later days quiet. Phase 16, after the section benchmark
 *  (Airbnb Trips, Meetup). Decorative for screen readers: the row's label
 *  carries the same words. */
export function CountdownChip({
  exp,
  now,
}: {
  exp: MockExperience;
  now?: Date;
}) {
  const label = planCountdown(exp, now);
  if (!label) return null;
  const soon = label === "I kveld" || label === "I dag";
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className={`self-start rounded-full px-2.5 py-1 ${
        soon ? "bg-ink" : "bg-surfaceMuted"
      }`}
    >
      <Text variant="caption" weight="semibold" tone={soon ? "onInk" : "ink"}>
        {label}
      </Text>
    </View>
  );
}
