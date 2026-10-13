import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoBadge } from "@/components/DemoBadge";
import { Sheet } from "@/components/Sheet";
import type { MockPlace } from "@/fixtures";
import { colors } from "@/theme";

// Visual place/experience detail (PDF 6). Participants, reviews and the "join"
// action are MOCK — no real attendance, reviews, or booking (BLOCKED_CONTRACT_GAP).
export function PlaceDetailSheet({
  place,
  visible,
  onClose,
}: {
  place: MockPlace | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!place) return null;
  return (
    <Sheet visible={visible} onClose={onClose} title={place.name}>
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={16} color={colors.ember} />
          <Text className="text-sm font-semibold text-ink">
            {place.rating.toFixed(1)}
          </Text>
          <Text className="text-sm text-muted">({place.reviews})</Text>
        </View>
        <Text className="text-sm text-muted">· {place.distance}</Text>
        <Text
          className={`text-sm ${place.openNow ? "text-success" : "text-muted"}`}
        >
          · {place.openNow ? "Åpent nå" : "Stengt"}
        </Text>
      </View>

      <Text className="text-sm text-muted">{place.about}</Text>

      <View className="flex-row flex-wrap gap-2">
        {place.tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </View>

      <View className="gap-2">
        <Text className="text-base font-semibold text-ink">Hvem kommer</Text>
        <View className="flex-row">
          {["M", "T", "Å", "+5"].map((a, i) => (
            <View
              key={a}
              className="h-9 w-9 items-center justify-center rounded-full border border-surface bg-surfaceMuted"
              style={{ marginLeft: i === 0 ? 0 : -10 }}
            >
              <Text className="text-xs font-semibold text-ink">{a}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <DemoBadge />
        <Text className="flex-1 text-xs text-muted">
          Demo — ingen reell påmelding eller betaling skjer.
        </Text>
      </View>
      <Button label="Bli med" variant="ember" onPress={onClose} />
    </Sheet>
  );
}
