import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DemoBadge } from "@/components/DemoBadge";
import { GuestLock } from "@/components/GuestLock";
import { colors } from "@/theme";

type VStatus = "unverified" | "pending" | "verified";

const meta: Record<
  VStatus,
  { label: string; icon: keyof typeof Ionicons.glyphMap; className: string }
> = {
  unverified: {
    label: "Uverifisert",
    icon: "close-circle",
    className: "bg-surfaceMuted",
  },
  pending: {
    label: "Venter på gjennomgang",
    icon: "time",
    className: "bg-warning",
  },
  verified: {
    label: "Verifisert",
    icon: "checkmark-circle",
    className: "bg-success",
  },
};

const steps = [
  "Last opp organisasjonsnummer",
  "Bekreft eierskap til stedet",
  "Gjennomgang av ThirdPlace",
];

export function VerificationContent() {
  const [status, setStatus] = useState<VStatus>("unverified");
  const m = meta[status];

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4">
        <View
          className={`h-12 w-12 items-center justify-center rounded-full ${m.className}`}
        >
          <Ionicons
            name={m.icon}
            size={24}
            color={status === "unverified" ? colors.muted : colors.onEmber}
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-wide text-muted">
            Status
          </Text>
          <Text className="text-base font-semibold text-ink">{m.label}</Text>
        </View>
      </View>

      <Card>
        <View className="gap-2">
          <Text className="text-base font-semibold text-ink">
            Slik verifiserer du
          </Text>
          {steps.map((s, i) => (
            <View key={s} className="flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-surfaceMuted">
                <Text className="text-xs font-semibold text-ink">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-sm text-ink">{s}</Text>
            </View>
          ))}
        </View>
      </Card>

      <GuestLock message="Logg inn som bedrift for å starte verifisering." />

      <View className="flex-row items-center gap-2">
        <DemoBadge />
        <Text className="flex-1 text-xs text-muted">
          Demo — ingen reell identitets- eller bedriftsverifisering skjer.
        </Text>
      </View>

      {status === "unverified" ? (
        <Button
          label="Start verifisering"
          variant="ember"
          onPress={() => setStatus("pending")}
        />
      ) : status === "pending" ? (
        <Button
          label="Simuler godkjenning"
          variant="ink"
          onPress={() => setStatus("verified")}
        />
      ) : (
        <Button
          label="Nullstill (demo)"
          variant="secondary"
          onPress={() => setStatus("unverified")}
        />
      )}
    </View>
  );
}
