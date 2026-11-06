import { Link, router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/Button";
import { DemoBadge } from "@/components/DemoBadge";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";

// Visual-only sign-up. Inert; no account is created (no backend).
export default function Register() {
  return (
    <Screen>
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
            onPress={() =>
              router.push({
                pathname: "/verify-code",
                params: { mode: "email" },
              })
            }
          />
          <View className="flex-row items-center justify-center gap-2">
            <DemoBadge />
            <Text variant="caption" tone="muted">
              Du får ingen konto, og det du skriver lagres ikke.
            </Text>
          </View>
          <SocialAuthButtons verb="Fortsett med" />
        </View>
        <Text variant="caption" tone="muted" className="px-4 text-center">
          Ved å fortsette godtar du våre vilkår og personvernerklæring.
        </Text>
        <Text variant="caption" tone="muted" className="text-center">
          Allerede medlem?{" "}
          <Link href="/login" asChild>
            <Text variant="caption" weight="semibold" tone="ember">
              Logg inn
            </Text>
          </Link>
        </Text>
      </ScrollView>
    </Screen>
  );
}
