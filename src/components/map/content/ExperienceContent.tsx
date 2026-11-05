import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { SignInPrompt } from "@/components/SignInPrompt";
import { demoCopy } from "@/copy";
import { experienceById, groupById, type ExperienceStatus } from "@/fixtures";
import { colors } from "@/theme";

import { useGuestMode } from "../hooks/useGuestMode";
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

type UserState = "none" | "joined" | "waitlisted";

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

export function ExperienceContent({ id, push }: { id: string; push: PushFn }) {
  const experience = experienceById(id);
  const [user, setUser] = useState<UserState>(
    experience?.status === "joined" ? "joined" : "none",
  );
  const { isGuest } = useGuestMode();
  const [promptOpen, setPromptOpen] = useState(false);
  // Join / waitlist are account actions: guests get the sign-in prompt, the
  // signed-in demo flips local state only (BLOCKED_CONTRACT_GAP).
  const gated = (run: () => void) => () =>
    isGuest ? setPromptOpen(true) : run();

  if (!experience) {
    return <Text className="text-sm text-muted">Fant ikke arrangementet.</Text>;
  }

  const meta = statusMeta[experience.status];
  const joinedCount = experience.going + (user === "joined" ? 1 : 0);
  const group = groupById(experience.groupId);

  const primary = (() => {
    if (user === "joined")
      return { label: "Forlat", action: () => setUser("none") };
    if (user === "waitlisted")
      return { label: "Meld av venteliste", action: () => setUser("none") };
    if (experience.status === "cancelled")
      return { label: "Avlyst", action: undefined, disabled: true };
    if (experience.status === "full" || experience.status === "waitlist")
      return {
        label: "Meld på venteliste",
        action: gated(() => setUser("waitlisted")),
      };
    return { label: "Bli med", action: gated(() => setUser("joined")) };
  })();

  return (
    <View className="gap-4">
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

      <DetailActions markerId={markerId("experience", experience.id)} />

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

      {user !== "none" ? (
        <DemoNote>
          {user === "joined"
            ? demoCopy.joinedNoBackend
            : demoCopy.waitlistedNoBackend}
        </DemoNote>
      ) : null}

      <Button
        label={primary.label}
        variant={user === "none" ? "ember" : "secondary"}
        disabled={primary.disabled}
        onPress={primary.action}
      />

      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action={primary.label.toLowerCase()}
      />
    </View>
  );
}
