import { useState } from "react";
import { View } from "react-native";

import { LeaveSheet } from "@/components/actions/ActionSheets";
import { Icon, Pressable as UIPressable, Text, Button } from "@/components/ui";
import type { MockExperience } from "@/fixtures";

import { useExperienceJoin } from "../map/hooks/useExperienceJoin";
import { joinedActions, useJoinSession } from "./joinedActions";

// «Du er med» on the page itself (review 2026-11-18 PR-03): once joined, the
// page keeps what JoinedSheet showed for a moment (the time and meeting
// point, then the calendar, the maps app and the chat) and the way out.
// Shown only to a signed-in viewer who joined and is not the host; the page
// decides that. Join state is local (BLOCKED_CONTRACT_GAP). Leaving says
// nothing about joining again: founder Q5 is open.
export function JoinedCard({ experience }: { experience: MockExperience }) {
  const [, setUser] = useExperienceJoin(experience.id, "none");
  const { session, when } = useJoinSession(experience);
  const [leaving, setLeaving] = useState(false);
  const actions = joinedActions(experience, session);
  return (
    <View className="gap-2 rounded-md border border-line bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-success/15">
          <Icon name="checkmark" size="md" tone="success" />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="label" weight="semibold" accessibilityRole="header">
            Du er med
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {when} · {experience.meetingPoint.name}
          </Text>
        </View>
      </View>
      <View>
        {actions.map((a) => (
          <UIPressable
            key={a.label}
            accessibilityRole="button"
            onPress={a.onPress}
            contentClassName="flex-row items-center gap-3 rounded-sm py-2"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
              <Icon name={a.icon} size="md" tone="ink" />
            </View>
            <Text variant="body" className="flex-1">
              {a.label}
            </Text>
            <Icon name="chevron-forward" size="sm" tone="muted" />
          </UIPressable>
        ))}
      </View>
      <Button
        label="Forlat"
        variant="ghost"
        size="sm"
        onPress={() => setLeaving(true)}
      />
      {leaving ? (
        <LeaveSheet
          title={`Vil du forlate «${experience.title}»?`}
          onClose={() => setLeaving(false)}
          // After the sheet has gone: leaving unmounts this card, and the
          // sheet with it (one Modal at a time, 200 ms exit).
          onConfirm={() => setTimeout(() => setUser("none"), 260)}
        />
      ) : null}
    </View>
  );
}
