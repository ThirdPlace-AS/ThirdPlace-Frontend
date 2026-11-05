import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { resetTo } from "@/lib/navigation";
import { colors } from "@/theme";

// Safe blocked path for under-18s (TP-D-001). No data is kept; the only way on
// is back to the start.
export function UnderageScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-4 p-gutter">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surfaceMuted">
          <Ionicons name="hand-left-outline" size={28} color={colors.ink} />
        </View>
        <Text className="text-center text-2xl font-bold text-ink">
          ThirdPlace er for 18+
        </Text>
        <Text className="px-4 text-center text-base text-muted">
          Du må være minst 18 år for å lage en konto. Vi har ikke lagret noe av
          det du skrev inn.
        </Text>
        <View className="w-full pt-2">
          <Button
            label="Tilbake til start"
            variant="ink"
            onPress={() => resetTo("/")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
