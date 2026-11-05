import { Link, router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";

// "Glemt passord?" (PDF p1). DEMO — sends nothing (no backend); after
// "Send tilbakestillingslenke" the demo offers to open the reset screen.
export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-6 p-gutter">
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
        <Link href="/login" className="text-sm font-semibold text-ember">
          Tilbake til innlogging
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
