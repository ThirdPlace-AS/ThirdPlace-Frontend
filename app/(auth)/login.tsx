import { Link, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";

// Visual-only sign-in. Inputs are inert; no auth is performed (no backend).
export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-6 p-gutter">
        <View className="items-center">
          <Logo size={48} />
        </View>
        <ScreenHeader
          title="Velkommen tilbake"
          subtitle="Finn veien tilbake til ditt lokale fellesskap."
        />
        <View className="gap-4">
          <Input
            label="E-postadresse"
            placeholder="navn@epost.no"
            keyboardType="email-address"
          />
          <Input label="Passord" placeholder="••••••••" secureTextEntry />
          <Link
            href="/forgot-password"
            className="text-right text-sm font-semibold text-ember"
          >
            Glemt passord?
          </Link>
          <Button
            label="Logg inn"
            variant="ink"
            onPress={() => router.replace("/map")}
          />
        </View>
        <Text className="text-center text-sm text-muted">
          Har du ikke konto?{" "}
          <Link href="/register" className="font-semibold text-ember">
            Registrer deg
          </Link>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
