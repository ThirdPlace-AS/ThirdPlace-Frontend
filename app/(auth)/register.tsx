import { Link, router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";
import { resetTo } from "@/lib/navigation";

// Sign-up. BLOCKED_CONTRACT_GAP: no auth backend; the flow continues to
// code verification and onboarding.
export default function Register() {
  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-6 p-gutter"
        // The first tap on a button lands while the keyboard is open.
        keyboardShouldPersistTaps="handled"
      >
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
          <SocialAuthButtons
            verb="Fortsett med"
            onContinue={() => resetTo("/onboarding")}
          />
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
