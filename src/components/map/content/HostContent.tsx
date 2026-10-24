import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  attendeesForExperience,
  experienceById,
  type ExperienceStatus,
} from "@/fixtures";
import { colors } from "@/theme";

import type { PushFn } from "../sheetTypes";

const statusLabel: Record<ExperienceStatus, string> = {
  open: "Åpen",
  waitlist: "Venteliste",
  full: "Fullt",
  joined: "Påmeldt",
  cancelled: "Avlyst",
};

export function HostContent({ id, push }: { id: string; push: PushFn }) {
  const exp = experienceById(id);
  const [status, setStatus] = useState<ExperienceStatus | null>(
    exp?.status ?? null,
  );

  if (!exp) {
    return <Text className="text-sm text-muted">Fant ikke arrangementet.</Text>;
  }

  const attendees = attendeesForExperience(exp.id);

  return (
    <View className="gap-4">
      <View>
        <Text className="text-base font-semibold text-ink">{exp.title}</Text>
        <Text className="text-sm text-muted">
          {exp.when} · Status: {status ? statusLabel[status] : "—"}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => push({ kind: "attendees", id: exp.id })}
      >
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="people-outline" size={20} color={colors.ink} />
              <Text className="text-base text-ink">
                Deltakere ({attendees.length}/{exp.capacity})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </View>
        </Card>
      </Pressable>

      <View className="gap-3">
        <Button label="Rediger arrangement" variant="secondary" />
        <Button
          label="Marker som fullført"
          variant="ink"
          disabled={status === "cancelled"}
          onPress={() => setStatus("joined")}
        />
        <Button
          label={status === "cancelled" ? "Gjenåpne" : "Avlys arrangement"}
          variant="secondary"
          onPress={() =>
            setStatus(status === "cancelled" ? exp.status : "cancelled")
          }
        />
      </View>
    </View>
  );
}
