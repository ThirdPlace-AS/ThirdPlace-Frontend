import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { Sheet } from "@/components/Sheet";
import {
  groupById,
  type ExperienceStatus,
  type MockExperience,
} from "@/fixtures";
import { colors } from "@/theme";

// Visual status of the experience (lifecycle bar). MOCK — not a real state
// machine or booking status (BLOCKED_CONTRACT_GAP).
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

type UserState = "none" | "joined" | "waitlisted";

export function ExperienceDetailSheet({
  experience,
  visible,
  onClose,
}: {
  experience: MockExperience | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!experience) return null;
  return (
    <Sheet visible={visible} onClose={onClose} title={experience.title}>
      {visible ? <Body experience={experience} onClose={onClose} /> : null}
    </Sheet>
  );
}

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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-3"
    >
      <Ionicons name={icon} size={18} color={colors.ink} />
      <Text className="flex-1 text-sm text-ink">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

function Body({
  experience,
  onClose,
}: {
  experience: MockExperience;
  onClose: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserState>(
    experience.status === "joined" ? "joined" : "none",
  );
  const group = groupById(experience.groupId);

  const go = (nav: () => void) => {
    onClose();
    nav();
  };

  const meta = statusMeta[experience.status];
  const joinedCount = experience.going + (user === "joined" ? 1 : 0);

  // Demo join state machine — purely local, no real attendance/booking.
  const primary = (() => {
    if (user === "joined")
      return { label: "Forlat", action: () => setUser("none") };
    if (user === "waitlisted")
      return { label: "Meld av venteliste", action: () => setUser("none") };
    if (experience.status === "cancelled")
      return { label: "Avlyst", action: undefined, disabled: true };
    if (experience.status === "full" || experience.status === "waitlist")
      return {
        label: "Sett meg på venteliste",
        action: () => setUser("waitlisted"),
      };
    return { label: "Bli med", action: () => setUser("joined") };
  })();

  return (
    <>
      {/* Lifecycle status bar */}
      <View className="flex-row items-center gap-2">
        <View className={`rounded-full px-3 py-1 ${meta.className}`}>
          <Text className="text-xs font-semibold text-onInk">{meta.label}</Text>
        </View>
        <Text className="text-sm text-muted">· {experience.when}</Text>
        <Text className="text-sm text-muted">
          · {joinedCount}/{experience.capacity} påmeldt
        </Text>
      </View>

      <Text className="text-sm text-muted">Vert: {experience.host}</Text>
      <Text className="text-sm text-muted">{experience.about}</Text>

      <View className="flex-row flex-wrap gap-2">
        {experience.tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </View>

      {/* Related screens */}
      <View className="gap-2">
        <LinkRow
          icon="people-outline"
          label={`Se deltakere (${experience.going})`}
          onPress={() =>
            go(() =>
              router.push({
                pathname: "/attendees/[id]",
                params: { id: experience.id },
              }),
            )
          }
        />
        {group ? (
          <LinkRow
            icon="people-circle-outline"
            label={`Gruppe: ${group.name}`}
            onPress={() =>
              go(() =>
                router.push({
                  pathname: "/group/[id]",
                  params: { id: group.id },
                }),
              )
            }
          />
        ) : null}
        <LinkRow
          icon="location-outline"
          label="Sjekk inn (GPS)"
          onPress={() =>
            go(() =>
              router.push({
                pathname: "/checkin/[id]",
                params: { id: experience.id },
              }),
            )
          }
        />
        <LinkRow
          icon="settings-outline"
          label="Administrer (vert)"
          onPress={() =>
            go(() =>
              router.push({
                pathname: "/host/[id]",
                params: { id: experience.id },
              }),
            )
          }
        />
      </View>

      {/* In-chat banner — shown once "joined"/"waitlisted" (DEMO link). */}
      {user !== "none" ? (
        <View className="flex-row items-center gap-2 rounded-md border border-line bg-surfaceMuted px-3 py-2">
          <Ionicons name="chatbubbles-outline" size={18} color={colors.ink} />
          <Text className="flex-1 text-sm text-ink">
            {user === "joined"
              ? "Du er med — gruppechatten er åpnet."
              : "Du står på venteliste — vi varsler deg ved ledig plass."}
          </Text>
          <DemoBadge />
        </View>
      ) : null}

      <View className="flex-row items-center gap-2">
        <DemoBadge />
        <Text className="flex-1 text-xs text-muted">
          Demo — ingen reell påmelding, venteliste eller chat skjer.
        </Text>
      </View>

      <Button
        label={primary.label}
        variant={user === "none" ? "ember" : "secondary"}
        disabled={primary.disabled}
        onPress={primary.action}
      />
    </>
  );
}
