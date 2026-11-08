import { View } from "react-native";

import { Icon, Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { resetTo } from "@/lib/navigation";

// Safe blocked path for under-18s (TP-D-001). No data is kept; the only way on
// is back to the start.
export function UnderageScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-4 p-gutter">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surfaceMuted">
          <Icon name="hand-left-outline" size="xl" tone="ink" />
        </View>
        <Text variant="h1" className="text-center">
          ThirdPlace er for 18+
        </Text>
        <Text variant="body" tone="muted" className="px-4 text-center">
          Du må være minst 18 år for å lage en konto. Vi har ikke lagret noe av
          det du skrev inn.
        </Text>
        <View className="w-full pt-2">
          <Button
            label="Tilbake til start"
            variant="ink"
            onPress={() => resetTo("/welcome")}
          />
        </View>
      </View>
    </Screen>
  );
}
