import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { DemoBadge } from "@/components/DemoBadge";
import { Sheet } from "@/components/Sheet";
import { colors } from "@/theme";

// Demo notifications — static fixtures, no real push/inbox (BLOCKED_CONTRACT_GAP).
const items = [
  {
    id: "n1",
    icon: "people-outline" as const,
    text: "Maria M. ble med på «Morgenkaffe & prat».",
    when: "2 t",
  },
  {
    id: "n2",
    icon: "chatbubbles-outline" as const,
    text: "Ny melding i «Løkka Lesesirkel».",
    when: "I går",
  },
  {
    id: "n3",
    icon: "star-outline" as const,
    text: "Oslo Kaffebar fikk en ny anmeldelse.",
    when: "2 d",
  },
];

export function NotificationsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Varsler">
      <View className="flex-row items-center gap-2">
        <DemoBadge />
        <Text className="flex-1 text-xs text-muted">
          Demo — statiske varsler, ingen reell push eller innboks.
        </Text>
      </View>
      <View className="gap-3">
        {items.map((n) => (
          <View key={n.id} className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
              <Ionicons name={n.icon} size={18} color={colors.ink} />
            </View>
            <Text className="flex-1 text-sm text-ink">{n.text}</Text>
            <Text className="text-xs text-muted">{n.when}</Text>
          </View>
        ))}
      </View>
    </Sheet>
  );
}
