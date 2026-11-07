import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  useWindowDimensions,
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

// Sign-in. BLOCKED_CONTRACT_GAP: no auth backend; signing in leaves guest mode.
export default function Login() {
  const { setGuest } = useGuestMode();
  // Typed values stay on the device; nothing is checked or sent.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Short phones (< 700 dp): tighter rhythm and a smaller mark, so "Logg
  // inn" clears the fold without changing the PDF order (social first).
  const short = useWindowDimensions().height < 700;
  const signIn = () => {
    setGuest(false);
    resetTo("/map");
  };
  return (
    <Screen>
      {/* Edge-to-edge Android does not resize for the keyboard: pad instead,
          so the button under the fields can be scrolled to. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerClassName={
            short ? "gap-4 px-gutter pb-gutter pt-1" : "gap-6 p-gutter"
          }
          // The first tap on a button lands while the keyboard is open.
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center">
            <Logo size={short ? 36 : 48} />
          </View>
          <ScreenHeader
            title="Velkommen tilbake"
            subtitle="Godt å se deg igjen."
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
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />
            <Link href="/forgot-password" asChild>
              <Pressable
                accessibilityRole="link"
                hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
                className="self-end"
              >
                <Text variant="label" weight="semibold" tone="ember">
                  Glemt passord?
                </Text>
              </Pressable>
            </Link>
            <SocialAuthButtons verb="Logg inn med" onContinue={signIn} />
            <Button label="Logg inn" variant="ink" onPress={signIn} />
          </View>
          <View className="flex-row flex-wrap items-center justify-center">
            <Text variant="caption" tone="muted">
              Har du ikke konto?{" "}
            </Text>
            <Link href="/register" asChild>
              <Pressable
                accessibilityRole="link"
                hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
              >
                <Text variant="caption" weight="semibold" tone="ember">
                  Registrer deg
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
