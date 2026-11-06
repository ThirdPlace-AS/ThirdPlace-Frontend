import { Link, router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

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
          subtitle="Finn folk og steder i byen din."
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
        <View className="flex-row flex-wrap items-center justify-center">
          <Text variant="caption" tone="muted">
            Allerede medlem?{" "}
          </Text>
          <Link href="/login" asChild>
            <Pressable
              accessibilityRole="link"
              hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
            >
              <Text variant="caption" weight="semibold" tone="ember">
                Logg inn
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}
