import { router, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { showToast } from "@/components/Toast";
import { FadeSwap, FormPage, Text } from "@/components/ui";
import { confirmToast } from "@/copy";
import { goBackOr } from "@/lib/navigation";

import { FindYouRows, SeeYouRows, SharingRows } from "./privacyRows";
import { SettingsSection } from "./settingsUi";

// Personvernsjekk (Phase 18, screen benchmark: WhatsApp's privacy checkup):
// Personvern's rows one question at a time. They are the same rows and the
// same store as on Personvern, and each switch takes effect at once, so
// leaving early keeps what was chosen. Reached from the card at the top of
// Personvern. In memory like Personvern (BLOCKED_CONTRACT_GAP).
const STEPS = [
  { key: "see", title: "Hvem kan se deg" },
  { key: "find", title: "Hvem kan finne og kontakte deg" },
  { key: "share", title: "Hva du deler" },
] as const;

export default function PrivacyCheckScreen() {
  const [step, setStep] = useState(0);
  const current = STEPS[step] ?? STEPS[0];
  const last = step === STEPS.length - 1;

  return (
    <FormPage
      title="Personvernsjekk"
      footer={
        <View className="flex-row gap-3">
          {step > 0 ? (
            <Button
              label="Forrige"
              variant="secondary"
              fullWidth={false}
              onPress={() => setStep((s) => s - 1)}
            />
          ) : null}
          <View className="flex-1">
            <Button
              label={last ? "Ferdig" : "Neste"}
              variant="ink"
              onPress={() => {
                if (!last) {
                  setStep((s) => s + 1);
                  return;
                }
                goBackOr("/privacy" as Href);
                showToast(confirmToast.privacyChecked);
              }}
            />
          </View>
        </View>
      }
    >
      <View className="gap-2 pt-2">
        <Text variant="caption" tone="muted">
          {step + 1} av {STEPS.length}
        </Text>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Personvernsjekk"
          accessibilityValue={{ min: 1, max: STEPS.length, now: step + 1 }}
          className="h-1.5 overflow-hidden rounded-full bg-surfaceMuted"
        >
          <View
            className="h-full rounded-full bg-ink"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </View>
      </View>
      <FadeSwap swapKey={current.key}>
        <View className="gap-3">
          <Text variant="h2" accessibilityRole="header">
            {current.title}
          </Text>
          <SettingsSection>
            {current.key === "see" ? <SeeYouRows /> : null}
            {current.key === "find" ? (
              <FindYouRows
                onBlocked={() => router.push("/settings/blocked" as Href)}
              />
            ) : null}
            {current.key === "share" ? <SharingRows /> : null}
          </SettingsSection>
        </View>
      </FadeSwap>
    </FormPage>
  );
}
