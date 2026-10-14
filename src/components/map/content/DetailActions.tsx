import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";

import { useMapSaved } from "../hooks/useMapSaved";

// Save / Share action row shared by detail content. Save toggles the in-memory
// demo store (persistence CONTRACT-BLOCKED CB-5). Share is a DEMO no-op — no real
// share sheet is invoked (that needs a contract/native entry point).
export function DetailActions({ markerId }: { markerId: string }) {
  const { isSaved, toggle } = useMapSaved();
  const saved = isSaved(markerId);

  return (
    <View className="flex-row gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? "Fjern fra lagret" : "Lagre"}
        accessibilityState={{ selected: saved }}
        onPress={() => toggle(markerId)}
        className={`flex-1 flex-row items-center justify-center gap-2 rounded-md border px-3 py-2.5 ${
          saved ? "border-ember bg-ember/10" : "border-line bg-surface"
        }`}
      >
        <Ionicons
          name={saved ? "heart" : "heart-outline"}
          size={18}
          color={saved ? colors.ember : colors.ink}
        />
        <Text
          className={`text-sm font-semibold ${saved ? "text-ember" : "text-ink"}`}
        >
          {saved ? "Lagret" : "Lagre"}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Del (demo)"
        onPress={() => {
          /* DEMO — no real share sheet. */
        }}
        className="flex-1 flex-row items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
      >
        <Ionicons name="share-outline" size={18} color={colors.ink} />
        <Text className="text-sm font-semibold text-ink">Del</Text>
      </Pressable>
    </View>
  );
}
