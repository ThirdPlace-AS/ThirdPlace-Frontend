import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen, Text as UIText } from "@/components/ui";
import { CodeInput } from "@/components/auth/CodeInput";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { ScreenHeader } from "@/components/ScreenHeader";

const RESEND_SECONDS = 60;

// One-time-code screens (PDF p2). mode=email: "Sjekk innboksen" after
// register, continues into onboarding. mode=identity: "Bekreft identiteten"
// after turning on 2FA, returns to settings. DEMO — no code is sent; any 6
// digits are accepted, and the screen says so (BLOCKED_CONTRACT_GAP).
export default function VerifyCode() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const identity = mode === "identity";
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const confirm = () =>
    identity ? router.back() : router.replace("/onboarding");

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-6 p-gutter"
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={identity ? "Bekreft identiteten" : "Sjekk innboksen"}
          subtitle={
            identity
              ? "Skriv inn 6-sifret kode fra SMS eller appen din."
              : "Vi har sendt en 6-sifret kode til e-posten din. Skriv den inn her."
          }
          showBack
        />
        <CodeInput value={code} onChange={setCode} />
        <Button
          label="Bekreft"
          variant="ink"
          disabled={code.length < 6}
          onPress={confirm}
        />
        <View className="items-center gap-1">
          <UIText variant="caption" tone="muted">
            Fikk du ikke koden?{" "}
            <Text
              onPress={
                left <= 0
                  ? () => {
                      setResent(true);
                      setLeft(RESEND_SECONDS);
                    }
                  : undefined
              }
              className={`font-semibold ${left <= 0 ? "text-emberText" : "text-muted"}`}
            >
              Send på nytt
            </Text>
          </UIText>
          {left > 0 ? (
            <UIText variant="caption" tone="muted">
              Du kan sende ny kode om {left} sekunder
            </UIText>
          ) : null}
        </View>
        {identity ? (
          <View className="gap-0.5 rounded-md border border-line bg-surface p-3">
            <UIText variant="label" weight="semibold">
              Mistet tilgang?
            </UIText>
            <UIText variant="label" weight="semibold" tone="ember">
              Backupkoder er ikke aktive i demoen
            </UIText>
          </View>
        ) : null}
        <DemoNote>
          {resent
            ? "Ingen kode ble sendt på nytt — alle 6 siffer godtas i demoen."
            : "Ingen kode er sendt — alle 6 siffer godtas i demoen."}
        </DemoNote>
      </ScrollView>
    </Screen>
  );
}
