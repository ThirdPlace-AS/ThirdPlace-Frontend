import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";

// Visual-only password-reset request. Inert; sends nothing (no backend).
export default function ForgotPassword() {
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
          <Button label="Send tilbakestillingslenke" variant="ink" />
        </View>
        <Link href="/login" className="text-sm font-semibold text-ember">
          Tilbake til innlogging
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
