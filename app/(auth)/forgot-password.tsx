import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";

// "Glemt passord?" (PDF p1). Sends nothing (no backend); after "Send
// tilbakestillingslenke" the screen offers to open the reset page.
export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
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
          <ScreenHeader
            title="Glemt passord?"
            subtitle="Skriv inn e-posten din, så sender vi deg en lenke for å tilbakestille passordet."
            showBack
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
            <Button
              label="Send tilbakestillingslenke"
              variant="ink"
              onPress={() => setSent(true)}
            />
            {sent ? (
              <>
                <Button
                  label="Åpne lenken"
                  variant="secondary"
                  onPress={() => router.push("/reset-password")}
                />
              </>
            ) : null}
          </View>
          <Link href="/login" asChild>
            <Pressable
              accessibilityRole="link"
              hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
              className="self-start"
            >
              <Text variant="label" weight="semibold">
                Tilbake til innlogging
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
