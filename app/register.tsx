import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Screen, Text } from "@/components/ui";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { resetTo } from "@/lib/navigation";
import { markAccountCreated, useSignupProgress } from "@/lib/signupProgress";

// Sign-up. From the welcome screen it is the last step after onboarding
// ("Lag kontoen din"); from "Registrer deg" it comes first and onboarding
// follows the code. BLOCKED_CONTRACT_GAP: no auth backend.
export default function Register() {
  const { onboarded } = useSignupProgress();
  const { setGuest } = useGuestMode();
  // Typed values stay on the device; nothing is checked or sent.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // A social sign-in creates the account without a code.
  const social = () => {
    const nextHref = markAccountCreated();
    if (nextHref === "/map") setGuest(false);
    resetTo(nextHref);
  };
  return (
    <Screen>
      {/* Edge-to-edge Android does not resize for the keyboard: pad instead,
          so the button under the fields can be scrolled to. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerClassName="gap-6 p-gutter"
          // The first tap on a button lands while the keyboard is open.
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center">
            <Logo size={48} />
          </View>
          <ScreenHeader
            // After onboarding this is the last step (founder 2026-11-06).
            title={onboarded ? "Lag kontoen din" : "Bli med i ThirdPlace"}
            subtitle={
              onboarded
                ? "Siste steg. Så er du klar til å utforske."
                : "Finn folk og steder i byen din."
            }
            showBack={onboarded}
          />
          <View className="gap-4">
            <Input
              label="E-postadresse"
              placeholder="navn@epost.no"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Passord"
              placeholder="Minst 8 tegn"
              secureTextEntry
              autoComplete="password-new"
              value={password}
              onChangeText={setPassword}
            />
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
            <SocialAuthButtons verb="Fortsett med" onContinue={social} />
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
      </KeyboardAvoidingView>
    </Screen>
  );
}
