import { Link, router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

// Welcome / entry screen (visual only). Matches the auth flow in the screens PDF.
export default function Welcome() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-between p-gutter">
        <View className="flex-1 items-center justify-center gap-4">
          <Logo size={72} />
          <Text className="px-6 text-center text-base text-muted">
            Byen din, laget for deg. Oppdag nabolagets lune møteplasser.
          </Text>
        </View>

        <View className="gap-3">
          <Button
            label="Kom i gang"
            variant="ember"
            onPress={() => router.push("/register")}
          />
          <Button
            label="Fortsett som gjest"
            variant="secondary"
            onPress={() => router.replace("/map")}
          />
          <Text className="text-center text-sm text-muted">
            Allerede medlem?{" "}
            <Link href="/login" className="font-semibold text-ember">
              Logg inn
            </Link>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
