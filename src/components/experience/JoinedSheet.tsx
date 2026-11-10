import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import { Button } from "@/components/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { haptics } from "@/lib/haptics";
import { showToast } from "@/components/Toast";
import {
  Icon,
  type IconName,
  Pressable as UIPressable,
  Sheet,
  Text,
} from "@/components/ui";
import {
  chatForExperience,
  type MockExperience,
  type MockSession,
} from "@/fixtures";
import { addToCalendar, calendarEventFor } from "@/lib/addToCalendar";
import { openDirections } from "@/lib/directions";

// "Du er med" (Phase 18, from the screen benchmark: Airbnb's trip
// confirmation, Uber's request card): after joining, the time and the
// meeting point, then what you usually do next. Each action closes the sheet
// first; the calendar, the maps app and the chat open after it has gone.
export function JoinedSheet({
  experience,
  session,
  when,
  onClose,
}: {
  experience: MockExperience;
  session: Pick<MockSession, "start" | "end"> | undefined;
  /** The chosen time as the join card shows it ("Ons 09:00"). */
  when: string;
  onClose: () => void;
}) {
  const chat = chatForExperience(experience.id);
  const reduced = useReducedMotion();
  // Joining is a real local completion: the success tick as the sheet opens
  // (user 2026-11-09: haptics where it makes sense).
  useEffect(() => {
    haptics.success();
  }, []);
  const later = (run: () => void) => () => {
    onClose();
    setTimeout(run, 240);
  };
  const actions: { label: string; icon: IconName; onPress: () => void }[] = [
    ...(session
      ? [
          {
            label: "Legg til i kalender",
            icon: "calendar-outline" as const,
            onPress: later(() => {
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
      onPress: later(() => {
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
            onPress: later(() => router.push(`/chat/${chat.id}` as Href)),
          },
        ]
      : []),
  ];
  return (
    <Sheet visible onClose={onClose} title="Du er med">
      <View className="gap-4">
        <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3">
          {/* The check springs in just after the sheet has slid up. The
              animated wrapper carries no className (dropped on a cold
              start, CLAUDE.md); the circle inside does. */}
          <Animated.View
            entering={
              reduced ? undefined : ZoomIn.delay(180).springify().damping(13)
            }
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-success/15">
              <Icon name="checkmark" size="md" tone="success" />
            </View>
          </Animated.View>
          <View className="flex-1 gap-0.5">
            <Text variant="label" weight="semibold" numberOfLines={2}>
              {experience.title}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {when} · {experience.meetingPoint.name}
            </Text>
          </View>
        </View>
        <View className="gap-1">
          {actions.map((a) => (
            <UIPressable
              key={a.label}
              accessibilityRole="button"
              onPress={a.onPress}
              contentClassName="flex-row items-center gap-3 rounded-md py-2.5"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
                <Icon name={a.icon} size="md" tone="ink" />
              </View>
              <Text variant="body" className="flex-1">
                {a.label}
              </Text>
            </UIPressable>
          ))}
        </View>
        <Button label="Ferdig" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}
