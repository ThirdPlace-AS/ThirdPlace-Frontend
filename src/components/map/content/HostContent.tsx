import { useState } from "react";
import { Pressable, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { CancelSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { Card } from "@/components/Card";
import {
  attendeesForExperience,
  experienceById,
  type ExperienceStatus,
} from "@/fixtures";

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
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editNote, setEditNote] = useState(false);

  if (!exp) {
    return (
      <Text variant="caption" tone="muted">
        Fant ikke arrangementet.
      </Text>
    );
  }

  const attendees = attendeesForExperience(exp.id);

  return (
    <View className="gap-4">
      <View>
        <Text variant="body" weight="semibold">
          {exp.title}
        </Text>
        <Text variant="caption" tone="muted">
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
              <Icon name="people-outline" size="md" tone="ink" />
              <Text variant="body">
                Deltakere ({attendees.length}/{exp.capacity})
              </Text>
            </View>
            <Icon name="chevron-forward" size="md" tone="muted" />
          </View>
        </Card>
      </Pressable>

      {/* Host actions (PDF p6): Rediger opens the Add flow; Avlys confirms in
          a sheet first. The earlier "Marker som fullført" / "Gjenåpne"
          controls were invented and are removed. */}
      <View className="gap-3">
        <Button
          label="Rediger"
          variant="secondary"
          onPress={() => setEditNote(true)}
        />
        {editNote ? (
          <DemoNote>Redigering av opplevelser er ikke aktiv i demoen.</DemoNote>
        ) : null}
        {status === "cancelled" ? (
          <DemoNote>
            Avlyst i demoen — ingen ble varslet eller refundert.
          </DemoNote>
        ) : (
          <Button
            label="Avlys"
            variant="secondary"
            onPress={() => setCancelOpen(true)}
          />
        )}
      </View>
      {cancelOpen ? (
        <CancelSheet
          title={exp.title}
          going={exp.going}
          onClose={() => setCancelOpen(false)}
          onConfirm={() => setStatus("cancelled")}
        />
      ) : null}
    </View>
  );
}
