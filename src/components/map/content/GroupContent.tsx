import { router, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GuestLock } from "@/components/GuestLock";
import { SignInPrompt } from "@/components/SignInPrompt";
import { experiences, groupById, sessionsFor } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { shortSessionLabel } from "@/lib/dates";
import { membersLabel } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { ListRow, Text } from "@/components/ui";

import { Gallery } from "../Gallery";
import { useGuestMode } from "../hooks/useGuestMode";

// Phase 18 (founder, screen benchmark: Meetup, Spond): the page leads with
// "Neste møte", the group's next experience from the fixtures, and shows the
// group's "Regler" in its creator's words when it has any.
export function nextMeeting(groupId: string, now = new Date()) {
  let best: { id: string; title: string; start: Date; where: string } | null =
    null;
  for (const e of experiences) {
    if (e.groupId !== groupId || e.status === "cancelled") continue;
    const s = sessionsFor(e, now, 1)[0];
    if (s && (!best || s.start < best.start)) {
      best = {
        id: e.id,
        title: e.title,
        start: s.start,
        where: e.meetingPoint.name,
      };
    }
  }
  return best;
}

export function GroupContent({ id }: { id: string }) {
  const group = groupById(id);
  const { isGuest } = useGuestMode();
  // The creator of a group (made in Legg til) is already in it.
  const [member, setMember] = useState(group?.mine === true);
  const [promptOpen, setPromptOpen] = useState(false);

  if (!group) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke gruppen.
      </Text>
    );
  }

  // Joining is an account action: guests get the sign-in prompt, the
  // signed-in demo flips local state only (BLOCKED_CONTRACT_GAP).
  const toggle = () => {
    if (isGuest) return setPromptOpen(true);
    if (!member) haptics.light();
    setMember((m) => !m);
  };

  return (
    <View className="gap-4">
      <Gallery
        photos={group.photos.map(libImage)}
        height={200}
        label={group.name}
      />
      <Text variant="caption" tone="muted">
        {group.about}
      </Text>
      <Text variant="caption" tone="muted">
        {membersLabel(group.memberCount)}
      </Text>

      <NextMeeting groupId={group.id} />

      {group.rules ? (
        <View className="gap-1">
          <Text variant="body" weight="semibold" accessibilityRole="header">
            Regler
          </Text>
          <Text variant="label" weight="regular">
            {group.rules}
          </Text>
        </View>
      ) : null}

      <Card>
        <View className="gap-2">
          <Text variant="body" weight="semibold">
            Medlemmer
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {group.members.map((m) => (
              <Avatar key={m} initials={m} size="sm" />
            ))}
          </View>
        </View>
      </Card>

      {isGuest ? (
        <GuestLock message="Logg inn for å bli medlem og se gruppechatten." />
      ) : null}

      <Button
        label={member ? "Forlat gruppen" : "Bli medlem"}
        variant={member ? "secondary" : "ember"}
        onPress={toggle}
      />

      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action="bli medlem"
      />
    </View>
  );
}

function NextMeeting({ groupId }: { groupId: string }) {
  const [now] = useState(() => new Date());
  const next = nextMeeting(groupId, now);
  if (!next) return null;
  return (
    <View className="gap-2">
      <Text variant="body" weight="semibold" accessibilityRole="header">
        Neste møte
      </Text>
      <ListRow
        variant="card"
        icon="calendar-outline"
        title={next.title}
        subtitle={`${shortSessionLabel(next.start, now)} · ${next.where}`}
        onPress={() => router.push(`/experience/${next.id}` as Href)}
      />
    </View>
  );
}
