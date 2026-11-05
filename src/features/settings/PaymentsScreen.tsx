import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Icon, Screen } from "@/components/ui";
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
            <Text className="text-sm font-medium text-ink">
              Ingen betalingsmetoder
            </Text>
            <Text className="px-4 text-center text-xs text-muted font-normal">
              Her ville betalingsmetodene dine ligget.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setInfoOpen(true)}
            className="flex-row items-center gap-3 border-t border-line px-4 py-3.5 active:bg-surfaceMuted"
          >
            <Icon name="add-circle-outline" size="md" tone="ink" />
            <Text className="flex-1 text-base text-ink font-normal">
              Legg til betalingsmetode
            </Text>
            <DemoBadge />
          </Pressable>
        </SettingsSection>

        <SettingsSection title="Historikk">
          <View className="items-center gap-2 px-4 py-8">
            <Icon name="receipt-outline" size="xl" tone="muted" />
            <Text className="text-sm font-medium text-ink">
              Ingen transaksjoner
            </Text>
            <Text className="px-4 text-center text-xs text-muted font-normal">
              Kvitteringer ville dukket opp her.
            </Text>
          </View>
        </SettingsSection>

        <Text className="px-1 text-[11px] text-muted font-normal">
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
          <Text className="flex-1 text-sm leading-5 text-ink font-normal">
            Denne demoen samler aldri inn kort-, bank- eller kontoopplysninger,
            og ingen ekte betaling kan skje. Et reelt betalingsskjema vil komme
            når betalingsflyten er fastsatt.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}
