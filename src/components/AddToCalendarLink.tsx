import { Pressable } from "react-native";

import { showToast } from "@/components/Toast";
import { Text } from "@/components/ui";
import type { MockExperience, MockSession } from "@/fixtures";
import { addToCalendar, calendarEventFor } from "@/lib/addToCalendar";
import { haptics } from "@/lib/haptics";

/** "Legg til i kalender" (Phase 16): the given time of an experience, in
 *  the phone's calendar app. A text link, like "Se alle tider". */
export function AddToCalendarLink({
  exp,
  session,
  tone = "ink",
}: {
  exp: Pick<MockExperience, "id" | "title" | "about" | "meetingPoint">;
  session: Pick<MockSession, "start" | "end"> | undefined;
  /** "ember" in plan rows, where the other actions are pink. */
  tone?: "ink" | "ember";
}) {
  if (!session) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Legg til ${exp.title} i kalender`}
      accessibilityHint="Åpner kalenderen med opplevelsen fylt inn"
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      onPress={() => {
        haptics.light();
        void addToCalendar(calendarEventFor(exp, session)).then((r) => {
          if (r === "unavailable")
            showToast({
              title: "Fikk ikke åpnet kalenderen",
              icon: "alert-circle-outline",
            });
        });
      }}
    >
      <Text
        variant="label"
        weight="semibold"
        tone={tone}
        className={tone === "ink" ? "underline" : "pt-1"}
      >
        Legg til i kalender
      </Text>
    </Pressable>
  );
}
