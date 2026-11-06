import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Icon, Screen, Pressable as UIPressable, Text } from "@/components/ui";
import { DemoBadge } from "@/components/DemoBadge";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { DemoNote } from "@/components/DemoNote";
import { demoCopy } from "@/copy";

import { SettingsSection } from "./settingsUi";

// Payments (STRUCTURE ONLY). Reached from Settings → Betaling. This renders the
// layout of a payment-methods / history screen and NOTHING more. It never
// collects card, bank, or credential data and performs no transaction — that is
// both a prohibited action and BLOCKED_CONTRACT_GAP (no billing/payment backend).
export default function PaymentsScreen() {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Betaling" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <DemoNote>{demoCopy.paymentsStructureOnly}</DemoNote>

        <SettingsSection title="Betalingsmetoder">
          <View className="items-center gap-2 px-4 py-8">
            <Icon name="card-outline" size="xl" tone="muted" />
            <Text variant="label">Ingen betalingsmetoder</Text>
            <Text variant="caption" tone="muted" className="px-4 text-center">
              Her ville betalingsmetodene dine ligget.
            </Text>
          </View>
          <UIPressable
            accessibilityRole="button"
            onPress={() => setInfoOpen(true)}
            contentClassName="flex-row items-center gap-3 border-t border-line px-4 py-3.5"
            pressedScale={0.99}
          >
            <Icon name="add-circle-outline" size="md" tone="ink" />
            <Text variant="body" className="flex-1">
              Legg til betalingsmetode
            </Text>
            <DemoBadge />
          </UIPressable>
        </SettingsSection>

        <SettingsSection title="Historikk">
          <View className="items-center gap-2 px-4 py-8">
            <Icon name="receipt-outline" size="xl" tone="muted" />
            <Text variant="label">Ingen transaksjoner</Text>
            <Text variant="caption" tone="muted" className="px-4 text-center">
              Kvitteringer ville dukket opp her.
            </Text>
          </View>
        </SettingsSection>

        <Text variant="caption" tone="muted" className="px-1">
          {/* BLOCKED_CONTRACT_GAP: no payment/billing contract. */}
          Betaling er ikke tilgjengelig i demoen. Denne skjermen viser bare
          oppsettet — ingen kortdata samles inn og ingen betaling skjer.
        </Text>
      </ScrollView>

      <Sheet
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Betalingsmetode"
      >
        <DemoNote>{demoCopy.paymentsDemoScreen}</DemoNote>
        <View className="flex-row items-start gap-3 rounded-lg bg-surfaceMuted p-3">
          <Icon name="shield-checkmark-outline" size="lg" tone="success" />
          <Text variant="label" weight="regular" className="flex-1 leading-5">
            Denne demoen samler aldri inn kort-, bank- eller kontoopplysninger,
            og ingen ekte betaling kan skje. Et reelt betalingsskjema vil komme
            når betalingsflyten er fastsatt.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}
