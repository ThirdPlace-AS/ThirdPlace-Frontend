import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  pageBody,
  Screen,
  Text,
  KeyboardAvoider,
  Button,
  Input,
} from "@/components/ui";
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
      <KeyboardAvoider>
        <ScrollView
          contentContainerClassName={pageBody.sections}
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
      </KeyboardAvoider>
    </Screen>
  );
}
