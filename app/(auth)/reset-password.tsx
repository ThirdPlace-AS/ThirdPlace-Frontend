import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";
import { resetTo } from "@/lib/navigation";

// "Lag nytt passord" (PDF p1), reached from the reset link. DEMO — the
// password is checked locally (8+ characters, both fields equal) and then
// discarded; nothing is stored (BLOCKED_CONTRACT_GAP).
export default function ResetPassword() {
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const short = pw.length > 0 && pw.length < 8;
  const mismatch = again.length > 0 && again !== pw;
  const ok = pw.length >= 8 && again === pw;

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-6 p-gutter"
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title="Lag nytt passord"
          subtitle="Velg et sterkt passord du ikke bruker andre steder."
          showBack
        />
        <View className="gap-4">
          <View className="gap-1">
            <Input
              label="Nytt passord"
              placeholder="Minst 8 tegn"
              secureTextEntry
              value={pw}
              onChangeText={setPw}
            />
            {short ? (
              <Text variant="caption" tone="danger">
                Passordet må ha minst 8 tegn.
              </Text>
            ) : null}
          </View>
          <View className="gap-1">
            <Input
              label="Bekreft passord"
              placeholder="Gjenta passordet"
              secureTextEntry
              value={again}
              onChangeText={setAgain}
            />
            {mismatch ? (
              <Text variant="caption" tone="danger">
                Passordene er ikke like.
              </Text>
            ) : null}
          </View>
          <Button
            label="Lagre nytt passord"
            variant="ink"
            disabled={!ok}
            onPress={() => resetTo("/login")}
          />
          <DemoNote>
            Passordet lagres ikke — ingen konto finnes i demoen.
          </DemoNote>
        </View>
      </ScrollView>
    </Screen>
  );
}
