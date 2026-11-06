import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Icon, Screen, Text } from "@/components/ui";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/Button";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";

type Method = "sms" | "app";

// Totrinnsbekreftelse (PDF p2), from Innstillinger → Kontoinformasjon.
// Toggle, METODE (SMS / Autentiseringsapp), a QR placeholder for the app
// method, then "Aktiver 2FA" → "Bekreft identiteten". DEMO — no secret is
// generated and nothing is enabled (BLOCKED_CONTRACT_GAP).
export default function TwoFactor() {
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
    <Screen edges={["top"]}>
      <RouteHeader title="Totrinnsbekreftelse" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <Text variant="caption" tone="muted">
          Legg til et ekstra sikkerhetslag på kontoen din.
        </Text>
        <View className="flex-row items-center justify-between">
          <Text variant="body" weight="semibold">
            Aktiver 2FA
          </Text>
          <Switch value={on} onValueChange={setOn} label="Aktiver 2FA" />
        </View>

        {on ? (
          <>
            <Text variant="micro" weight="semibold" tone="muted">
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
                    <Text variant="body" weight="semibold">
                      {m.label}
                    </Text>
                    <Text variant="caption" tone="muted">
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
                <Text variant="micro" weight="semibold" tone="muted">
                  QR-kode
                </Text>
                <View className="items-center gap-2 rounded-lg border border-line bg-surface p-5">
                  <View
                    className="items-center justify-center rounded-md bg-surfaceMuted"
                    style={{ height: 128, width: 128 }}
                  >
                    <Icon name="qr-code-outline" size="3xl" tone="muted" />
                  </View>
                  <Text variant="caption" tone="muted">
                    Skann med autentiseringsappen
                  </Text>
                </View>
              </>
            ) : null}

            <Text variant="caption" tone="muted">
              Backupkoder lagres etter aktivering.
            </Text>
            <DemoNote>
              2FA slås ikke på, og du får ingen QR-kode eller backupkoder.
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
    </Screen>
  );
}
