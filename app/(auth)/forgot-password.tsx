import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";

// "Glemt passord?" (PDF p1). DEMO — sends nothing (no backend); after
// "Send tilbakestillingslenke" the demo offers to open the reset screen.
export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  return (
    <Screen>
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
          />
          <Button
            label="Send tilbakestillingslenke"
            variant="ink"
            onPress={() => setSent(true)}
          />
          {sent ? (
            <>
              <DemoNote>
                Ingen e-post ble sendt. I demoen kan du åpne lenken direkte.
              </DemoNote>
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
    </Screen>
  );
}
