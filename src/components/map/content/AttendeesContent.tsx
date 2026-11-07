import { View } from "react-native";

import { Avatar } from "@/components/Avatar";
import {
  attendeesForExperience,
  experienceById,
  people,
  profile,
} from "@/fixtures";
import { libImage, type LibraryKey } from "@/fixtures/images";
import { Text } from "@/components/ui";
import { goingLabel, useShowMeAsAttendee } from "@/lib/going";

import { useExperienceJoin } from "../hooks/useExperienceJoin";

// Who is going. Phase 16 (founder 2026-11-07, opt-in per person): the public
// list names the host and the people who chose "Vis meg som deltaker", then
// counts the rest ("og 3 andre"); "N skal" counts everyone. The host's own
// tools (`everyone`, from Administrer) list every guest. Once you have
// joined you count too, and you are named only if you opted in.
export function AttendeesContent({
  id,
  everyone = false,
}: {
  id: string;
  everyone?: boolean;
}) {
  const exp = experienceById(id);
  const [user] = useExperienceJoin(
    id,
    exp?.status === "joined" ? "joined" : "none",
  );
  const showMe = useShowMeAsAttendee();
  const joined = user === "joined";
  const all = attendeesForExperience(id);
  const list = everyone ? all : all.filter((a) => a.isHost || a.shown);
  const meShown = joined && (showMe || everyone);
  const total = all.length + (joined ? 1 : 0);
  const others = total - list.length - (meShown ? 1 : 0);
  const portrait = (name: string) =>
    people.find((p) => p.name === name)?.avatar as LibraryKey | undefined;

  return (
    <View className="gap-3">
      {exp ? (
        <Text variant="caption" tone="muted">
          {exp.title} · {goingLabel(total)}
        </Text>
      ) : null}
      {meShown ? (
        <View className="flex-row items-center gap-3">
          <Avatar
            initials="DU"
            source={libImage(profile.avatar as LibraryKey)}
          />
          <Text variant="body" className="flex-1">
            Du
          </Text>
        </View>
      ) : null}
      {total === 0 ? (
        <Text variant="caption" tone="muted">
          Ingen deltakere ennå.
        </Text>
      ) : (
        list.map((a) => {
          const key = portrait(a.name);
          return (
            <View key={a.id} className="flex-row items-center gap-3">
              <Avatar
                initials={a.initials}
                source={key ? libImage(key) : undefined}
              />
              <Text variant="body" className="flex-1">
                {a.name}
              </Text>
              {a.isHost ? (
                <View className="rounded-full bg-ink px-2 py-0.5">
                  <Text variant="caption" weight="semibold" tone="onInk">
                    Vert
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })
      )}
      {others > 0 ? (
        <Text variant="caption" tone="muted">
          og {others} {others === 1 ? "annen" : "andre"}
        </Text>
      ) : null}
    </View>
  );
}
