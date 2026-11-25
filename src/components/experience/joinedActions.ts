import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";

import { showToast } from "@/components/Toast";
import type { IconName } from "@/components/ui";
import {
  chatForExperience,
  sessionsFor,
  type MockExperience,
  type MockSession,
} from "@/fixtures";
import { addToCalendar, calendarEventFor } from "@/lib/addToCalendar";
import { shortSessionLabel } from "@/lib/dates";
import { openDirections } from "@/lib/directions";

import { useExperienceSession } from "./useExperienceSession";

export type JoinedAction = {
  label: string;
  icon: IconName;
  onPress: () => void;
};

/**
 * The time the viewer joined: the picked one ("Velg tidspunkt") or the
 * next. Shared by the floating join card and the page's «Du er med» card
 * (PR-03) so both name the same time.
 */
export function useJoinSession(experience: MockExperience | undefined) {
  const [chosenId] = useExperienceSession(experience?.id ?? "");
  const [now] = useState(() => new Date());
  const sessions = useMemo(
    () => (experience ? sessionsFor(experience, now, 8) : []),
    [experience, now],
  );
  const session = sessions.find((s) => s.id === chosenId) ?? sessions[0];
  const when = session
    ? shortSessionLabel(session.start, now)
    : (experience?.when ?? "");
  return { session, when };
}

/**
 * What you usually do once you are in: the calendar, the maps app, the
 * chat. `wrap` lets a sheet close before the action runs (JoinedSheet);
 * the page card runs them straight away. The chat row is left out for an
 * experience without one.
 */
export function joinedActions(
  experience: MockExperience,
  session: Pick<MockSession, "start" | "end"> | undefined,
  wrap: (run: () => void) => () => void = (run) => run,
): JoinedAction[] {
  const chat = chatForExperience(experience.id);
  return [
    ...(session
      ? [
          {
            label: "Legg til i kalender",
            icon: "calendar-outline" as const,
            onPress: wrap(() => {
              void addToCalendar(calendarEventFor(experience, session)).then(
                (r) => {
                  if (r === "unavailable")
                    showToast({
                      title: "Fikk ikke åpnet kalenderen",
                      icon: "alert-circle-outline",
                    });
                },
              );
            }),
          },
        ]
      : []),
    {
      label: "Veibeskrivelse",
      icon: "navigate-outline",
      onPress: wrap(() => {
        void openDirections(experience.meetingPoint.coord).then((ok) => {
          if (!ok)
            showToast({
              title: "Fikk ikke åpnet kartappen",
              icon: "alert-circle-outline",
            });
        });
      }),
    },
    ...(chat
      ? [
          {
            label: "Til samtalen",
            icon: "chatbubbles-outline" as const,
            onPress: wrap(() => router.push(`/chat/${chat.id}` as Href)),
          },
        ]
      : []),
  ];
}
