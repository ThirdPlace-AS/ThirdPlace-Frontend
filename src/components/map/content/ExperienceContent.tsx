import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Icon, Text, Pressable as UIPressable } from "@/components/ui";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { demoCopy } from "@/copy";
import { experienceById, groupById, type ExperienceStatus } from "@/fixtures";

import { useExperienceJoin } from "../hooks/useExperienceJoin";
import type { PushFn } from "../sheetTypes";
import { markerId } from "../types/mapPresentation";
import { DetailActions } from "./DetailActions";

const statusMeta: Record<
  ExperienceStatus,
  { label: string; className: string }
> = {
  open: { label: "Åpen", className: "bg-success" },
  waitlist: { label: "Venteliste", className: "bg-warning" },
  full: { label: "Fullt", className: "bg-muted" },
  joined: { label: "Påmeldt", className: "bg-ember" },
  cancelled: { label: "Avlyst", className: "bg-danger" },
};

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      onPress={onPress}
      contentClassName="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-3"
      pressedScale={0.99}
    >
      <Icon name={icon} size="md" tone="ink" />
      <Text variant="label" weight="regular" className="flex-1">
        {label}
      </Text>
      <Icon name="chevron-forward" size="md" tone="muted" />
    </UIPressable>
  );
}

// Experience detail body. The join action lives in the sheet's pinned bar
// (ExperienceJoinBar, PDF p6); both read the same local join state.
export function ExperienceContent({ id, push }: { id: string; push: PushFn }) {
  const experience = experienceById(id);
  const [user] = useExperienceJoin(
    id,
    experience?.status === "joined" ? "joined" : "none",
  );

  if (!experience) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke arrangementet.
      </Text>
    );
  }

  const meta = statusMeta[experience.status];
  const joinedCount = experience.going + (user === "joined" ? 1 : 0);
  const group = groupById(experience.groupId);

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <View className={`rounded-full px-3 py-1 ${meta.className}`}>
          <Text variant="caption" weight="semibold" tone="onInk">
            {meta.label}
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          · {experience.when}
        </Text>
        <Text variant="caption" tone="muted">
          · {joinedCount}/{experience.capacity} påmeldt
        </Text>
      </View>

      <Text variant="caption" tone="muted">
        Vert: {experience.host}
      </Text>
      <Text variant="caption" tone="muted">
        {experience.about}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {experience.tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </View>

      <DetailActions
        markerId={markerId("experience", experience.id)}
        title={experience.title}
      />

      {user !== "none" ? (
        <DemoNote>
          {user === "joined"
            ? demoCopy.joinedNoBackend
            : demoCopy.waitlistedNoBackend}
        </DemoNote>
      ) : null}

      <View className="gap-2">
        <LinkRow
          icon="people-outline"
          label={`Se deltakere (${experience.going})`}
          onPress={() => push({ kind: "attendees", id: experience.id })}
        />
        {group ? (
          <LinkRow
            icon="people-circle-outline"
            label={`Gruppe: ${group.name}`}
            onPress={() => push({ kind: "group", id: group.id })}
          />
        ) : null}
        <LinkRow
          icon="location-outline"
          label="Sjekk inn (GPS)"
          onPress={() => push({ kind: "checkin", id: experience.id })}
        />
        <LinkRow
          icon="settings-outline"
          label="Administrer (vert)"
          onPress={() => push({ kind: "host", id: experience.id })}
        />
      </View>
    </View>
  );
}
