import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

// Placeholder landing route. No product surfaces are wired to any API
// (Phase 0 / non-contract). The five primary surfaces
// (Map/Swipe/Add/Chat/Profile) will be added once the V2.2 contract is
// imported and approved.
export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-3 p-gutter">
        <Text className="text-2xl font-semibold text-ink">ThirdPlace</Text>
        <Text className="text-center text-muted">
          Phase 0 foundation. No contracts wired.
        </Text>
        <Link href="/_sandbox/gestures" className="mt-4 text-ember">
          Open gesture / animation smoke test →
        </Link>
      </View>
    </SafeAreaView>
  );
}
