import { Linking, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { CategoryArt } from "@/components/illustrations/CategoryArt";
import { Sheet } from "@/components/Sheet";
import { AreaChips } from "@/components/pickers/AreaChips";
import type { MockArea } from "@/fixtures";

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
}: {
  visible: boolean;
  onClose: () => void;
  status: LocationStatus;
  areaLabel: string | null;
  selectedAreaName: string | null;
  onRequest: () => void;
  onSelectArea: (a: MockArea) => void;
}) {
  const denied = status === "denied";
  const unavailable = status === "unavailable";
  const granted = status === "granted";

  return (
    <Sheet visible={visible} onClose={onClose} title="Posisjon">
      <View className="items-center">
        <CategoryArt name="location" size={96} />
      </View>
      <Text variant="caption" tone="muted">
        Vi bruker posisjonen din bare til å vise steder og opplevelser i
        nærheten. Du kan også velge et område manuelt.
      </Text>

      {denied ? (
        <View className="flex-row items-start gap-2 rounded-md border border-line bg-surfaceMuted px-3 py-2">
          <Icon name="information-circle-outline" size="md" tone="muted" />
          <Text variant="caption" tone="muted" className="flex-1">
            Posisjon er avslått. Du kan slå den på i innstillinger, eller velge
            et område under.
          </Text>
        </View>
      ) : null}

      {unavailable ? (
        <View className="flex-row items-start gap-2 rounded-md border border-line bg-surfaceMuted px-3 py-2">
          <Icon name="warning-outline" size="md" tone="muted" />
          <Text variant="caption" tone="muted" className="flex-1">
            Fant ikke posisjonen din. Sjekk at posisjon er slått på i telefonen
            og prøv igjen, eller velg et område under.
          </Text>
        </View>
      ) : null}

      {granted && areaLabel ? (
        <View className="flex-row items-center gap-2 rounded-md border border-success bg-success/10 px-3 py-2">
          <Icon name="location" size="md" tone="success" />
          <Text variant="label" weight="regular" className="flex-1">
            {areaLabel}
          </Text>
        </View>
      ) : null}

      {!granted ? (
        <Button
          label={
            status === "requesting"
              ? "Henter posisjon…"
              : unavailable
                ? "Prøv igjen"
                : "Del posisjonen min"
          }
          variant="ink"
          disabled={status === "requesting"}
          onPress={onRequest}
        />
      ) : null}

      {/* Once location is turned off, the system will not ask again: the
          phone's settings for the app are the way back (Phase 15). */}
      {denied ? (
        <Button
          label="Åpne innstillinger"
          variant="secondary"
          onPress={() => void Linking.openSettings()}
        />
      ) : null}

      <View className="gap-2">
        <Text variant="label" weight="semibold">
          Velg område
        </Text>
        <AreaChips value={selectedAreaName ?? null} onChange={onSelectArea} />
      </View>
    </Sheet>
  );
}
