import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { useThemeColors } from "@/theme";

type Method = "sms" | "app";

// Totrinnsbekreftelse (PDF p2), from Innstillinger → Kontoinformasjon.
// Toggle, METODE (SMS / Autentiseringsapp), a QR placeholder for the app
// method, then "Aktiver 2FA" → "Bekreft identiteten". DEMO — no secret is
// generated and nothing is enabled (BLOCKED_CONTRACT_GAP).
export default function TwoFactor() {
  const colors = useThemeColors();
  const [on, setOn] = useState(true);
  const [method, setMethod] = useState<Method>("sms");
  const methods: {
    key: Method;
    label: string;
    hint: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      key: "sms",
      label: "SMS",
      hint: "Kode sendes til telefonen din",
      icon: "phone-portrait-outline",
    },
    {
      key: "app",
      label: "Autentiseringsapp",
      hint: "Google Authenticator, Authy, o.l.",
      icon: "key-outline",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Totrinnsbekreftelse" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <Text className="text-sm text-muted font-normal">
          Legg til et ekstra sikkerhetslag på kontoen din.
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">Aktiver 2FA</Text>
          <Switch value={on} onValueChange={setOn} label="Aktiver 2FA" />
        </View>

        {on ? (
          <>
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
              Metode
            </Text>
            {methods.map((m) => {
              const active = method === m.key;
              return (
                <Pressable
                  key={m.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => setMethod(m.key)}
                  className={`flex-row items-center gap-3 rounded-lg border bg-surface p-4 ${
                    active ? "border-ink" : "border-line"
                  }`}
                >
                  <Icon name={m.icon} size="md" tone="ink" />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-ink">
                      {m.label}
                    </Text>
                    <Text className="text-xs text-muted font-normal">
                      {m.hint}
                    </Text>
                  </View>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      active ? "border-ink bg-ink" : "border-line"
                    }`}
                  >
                    {active ? (
                      <Icon name="checkmark" size="sm" tone="onInk" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}

            {method === "app" ? (
              <>
                <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
                  QR-kode
                </Text>
                <View className="items-center gap-2 rounded-lg border border-line bg-surface p-5">
                  <View
                    className="items-center justify-center rounded-md bg-surfaceMuted"
                    style={{ height: 128, width: 128 }}
                  >
                    <Ionicons
                      name="qr-code-outline"
                      size={64}
                      color={colors.muted}
                    />
                  </View>
                  <Text className="text-xs text-muted font-normal">
                    Skann med autentiseringsappen
                  </Text>
                </View>
              </>
            ) : null}

            <Text className="text-xs text-muted font-normal">
              Backupkoder lagres etter aktivering.
            </Text>
            <DemoNote>
              Ingen 2FA aktiveres, og ingen QR-kode eller backupkode lages.
            </DemoNote>
            <Button
              label="Aktiver 2FA"
              variant="ink"
              onPress={() =>
                router.push({
                  pathname: "/verify-code",
                  params: { mode: "identity" },
                })
              }
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
