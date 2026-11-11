import { router, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { GuestLock } from "@/components/GuestLock";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ChatSection } from "@/components/experience/ExperienceSections";
import {
  PLACE_KIND_LABEL,
  areaLabel,
  chatById,
  experiences,
  groupById,
  groupMemberNames,
  placeById,
  sessionsFor,
  type MockGroup,
} from "@/fixtures";
import { interestById } from "@/fixtures/catalog/interests";
import { libImage } from "@/fixtures/images";
import { shortSessionLabel } from "@/lib/dates";
import { membersLabel } from "@/lib/format";
import { Chip, ListRow, Text } from "@/components/ui";

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

/** Most faces the member row shows; the rest are "og N andre". */
export const MAX_FACES = 12;

/** The member row (MOCK, Phase 19): the group's own faces first (`members`,
 *  initials), then made-up names, at most `max`; everyone else is counted. */
export function memberFaces(group: MockGroup, max = MAX_FACES) {
  type Face = { key: string; name?: string; initials?: string };
  const named = groupMemberNames(group).slice(group.members.length);
  const faces: Face[] = [
    ...group.members.map((initials, i) => ({ key: `own-${i}`, initials })),
    ...named.map((name) => ({ key: name, name })),
  ].slice(0, Math.min(max, group.memberCount));
  return { faces, others: Math.max(0, group.memberCount - faces.length) };
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
    setMember((m) => !m);
  };

  const topics = group.interests.flatMap((i) => {
    const label = interestById(i)?.label;
    return label ? [label] : [];
  });
  const home = group.homePlaceId ? placeById(group.homePlaceId) : undefined;
  const { faces, others } = memberFaces(group);
  const open = (href: Href) => router.push(href);

  return (
    <View className="gap-6">
      <View className="gap-3">
        <Gallery
          photos={group.photos.map(libImage)}
          height={200}
          label={group.name}
        />
        <Text variant="caption" tone="muted">
          {group.about}
        </Text>
        {topics.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {topics.map((t) => (
              <Chip key={t} label={t} size="sm" />
            ))}
          </View>
        ) : null}
        <Text variant="caption" tone="muted">
          {membersLabel(group.memberCount)}
        </Text>
      </View>

      <NextMeeting groupId={group.id} />

      {home ? (
        <View className="gap-3">
          <Text variant="h2" accessibilityRole="header">
            Møtes på
          </Text>
          <ListRow
            variant="card"
            icon="location-outline"
            title={home.name}
            subtitle={`${PLACE_KIND_LABEL[home.kind]} · ${areaLabel(home.coord)}`}
            onPress={() => open(`/place/${home.id}` as Href)}
          />
        </View>
      ) : null}

      {group.rules ? (
        <View className="gap-3">
          <Text variant="h2" accessibilityRole="header">
            Regler
          </Text>
          <Text variant="label" weight="regular">
            {group.rules}
          </Text>
        </View>
      ) : null}

      <View className="gap-3">
        <Text variant="h2" accessibilityRole="header">
          Medlemmer
        </Text>
        <View
          className="flex-row flex-wrap items-center gap-2"
          accessible
          accessibilityLabel={membersLabel(group.memberCount)}
        >
          {faces.map((f) => (
            <Avatar
              key={f.key}
              name={f.name}
              initials={f.initials}
              size="sm"
              decorative
            />
          ))}
          {others > 0 ? (
            <Text variant="label" tone="muted" className="ml-1">
              {`og ${others} andre`}
            </Text>
          ) : null}
        </View>
      </View>

      <ChatSection
        chat={group.chatId ? chatById(group.chatId) : undefined}
        onNavigate={open}
      />

      <View className="gap-3">
        {isGuest ? (
          <GuestLock message="Logg inn for å bli medlem og se gruppechatten." />
        ) : null}
        <Button
          label={member ? "Forlat gruppen" : "Bli medlem"}
          variant={member ? "secondary" : "ember"}
          onPress={toggle}
        />
      </View>

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
    <View className="gap-3">
      <Text variant="h2" accessibilityRole="header">
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
