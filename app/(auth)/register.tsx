import { Link, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";

// Visual-only sign-up. Inert; no account is created (no backend).
export default function Register() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-6 p-gutter">
        <View className="items-center">
          <Logo size={48} />
        </View>
        <ScreenHeader
          title="Bli med i ThirdPlace"
          subtitle="Byen din, laget for deg."
        />
        <View className="gap-4">
          <Input
            label="E-postadresse"
            placeholder="navn@epost.no"
            keyboardType="email-address"
          />
          <Input label="Passord" placeholder="Minst 8 tegn" secureTextEntry />
          <Button
            label="Opprett konto"
            variant="ember"
            onPress={() => router.replace("/map")}
          />
        </View>
        <Text className="px-4 text-center text-xs text-muted">
          Ved å fortsette godtar du våre vilkår og personvernerklæring.
        </Text>
        <Text className="text-center text-sm text-muted">
          Allerede medlem?{" "}
          <Link href="/login" className="font-semibold text-ember">
            Logg inn
          </Link>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
