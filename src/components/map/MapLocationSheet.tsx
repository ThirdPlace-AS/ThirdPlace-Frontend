import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Sheet } from "@/components/Sheet";
import { OSLO_AREAS, type MockArea } from "@/fixtures";

import type { LocationStatus } from "./hooks/useMapLocation";

// Location UX: contextual permission explainer + request, denied/unavailable
// fallback, and a manual Oslo-area picker so content stays browsable without GPS.
export function MapLocationSheet({
  visible,
  onClose,
  status,
  areaLabel,
  selectedAreaName,
  onRequest,
  onSelectArea,
  offline,
  onToggleOffline,
}: {
  visible: boolean;
  onClose: () => void;
  status: LocationStatus;
  areaLabel: string | null;
  selectedAreaName: string | null;
  onRequest: () => void;
  onSelectArea: (a: MockArea) => void;
  offline: boolean;
  onToggleOffline: () => void;
}) {
  const denied = status === "denied";
  const unavailable = status === "unavailable";
  const granted = status === "granted";

  return (
    <Sheet visible={visible} onClose={onClose} title="Posisjon">
      <Text className="text-sm text-muted font-normal">
        Vi bruker posisjonen din bare til å vise steder og opplevelser i
        nærheten. Du kan også velge et område manuelt.
      </Text>

      {denied ? (
        <View className="flex-row items-start gap-2 rounded-md border border-line bg-surfaceMuted px-3 py-2">
          <Icon name="information-circle-outline" size="md" tone="muted" />
          <Text className="flex-1 text-sm text-muted font-normal">
            Posisjon er avslått. Du kan slå den på i innstillinger, eller velge
            et område under.
          </Text>
        </View>
      ) : null}

      {unavailable ? (
        <View className="flex-row items-start gap-2 rounded-md border border-line bg-surfaceMuted px-3 py-2">
          <Icon name="warning-outline" size="md" tone="muted" />
          <Text className="flex-1 text-sm text-muted font-normal">
            Posisjon er ikke tilgjengelig her. Velg et område under for å
            fortsette.
          </Text>
        </View>
      ) : null}

      {granted && areaLabel ? (
        <View className="flex-row items-center gap-2 rounded-md border border-success bg-success/10 px-3 py-2">
          <Icon name="location" size="md" tone="success" />
          <Text className="flex-1 text-sm text-ink font-normal">
            {areaLabel}
          </Text>
        </View>
      ) : null}

      {!granted ? (
        <Button
          label={
            status === "requesting" ? "Henter posisjon…" : "Del posisjonen min"
          }
          variant="ink"
          disabled={status === "requesting"}
          onPress={onRequest}
        />
      ) : null}

      <View className="gap-2">
        <Text className="text-sm font-semibold text-ink">Velg område</Text>
        <View className="flex-row flex-wrap gap-2">
          {OSLO_AREAS.map((a) => (
            <Chip
              key={a.name}
              label={a.name}
              selected={selectedAreaName === a.name}
              onPress={() => onSelectArea(a)}
            />
          ))}
        </View>
      </View>

      {/* Simulate an offline/error state to exercise recovery. */}
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Simuler frakoblet"
        accessibilityState={{ checked: offline }}
        onPress={onToggleOffline}
        className="flex-row items-center justify-between rounded-md border border-line bg-surface px-4 py-3"
      >
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-base text-ink font-normal">
            Simuler frakoblet
          </Text>
        </View>
        <View
          className={`h-6 w-11 justify-center rounded-full px-0.5 ${
            offline ? "bg-ink" : "bg-surfaceMuted"
          }`}
        >
          <View
            className={`h-5 w-5 rounded-full bg-surface ${
              offline ? "self-end" : "self-start"
            }`}
          />
        </View>
      </Pressable>
    </Sheet>
  );
}
