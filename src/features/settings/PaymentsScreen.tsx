import { ScrollView, View } from "react-native";

import { Icon, pageBody, Screen, Text } from "@/components/ui";
import { RouteHeader } from "@/components/RouteHeader";

import { SettingsSection } from "./settingsUi";
import { GuestPage } from "@/components/GuestPage";

// Payments (STRUCTURE ONLY). Reached from Settings → Betaling. This renders the
// layout of a payment-methods / history screen and NOTHING more. It never
// collects card, bank, or credential data and performs no transaction — that is
// both a prohibited action and BLOCKED_CONTRACT_GAP (no billing/payment backend).
// No "Legg til betalingsmetode": it only opened "Betalingsmetoder kommer
// snart" (review 2026-11-18 IJ24).
function PaymentsScreenContent() {
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Betaling" />
      <ScrollView contentContainerClassName={pageBody.sections}>
        <SettingsSection title="Betalingsmetoder">
          <View className="items-center gap-2 px-4 py-8">
            <Icon name="card-outline" size="xl" tone="muted" />
            <Text variant="label">Ingen betalingsmetoder</Text>
            <Text variant="caption" tone="muted" className="px-4 text-center">
              Lagrede betalingsmetoder vises her.
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Historikk">
          <View className="items-center gap-2 px-4 py-8">
            <Icon name="receipt-outline" size="xl" tone="muted" />
            <Text variant="label">Ingen transaksjoner</Text>
            <Text variant="caption" tone="muted" className="px-4 text-center">
              Kvitteringene dine vises her.
            </Text>
          </View>
        </SettingsSection>

        {/* BLOCKED_CONTRACT_GAP: no payment/billing contract. Structure only:
            no card or bank inputs, nothing is charged. */}
      </ScrollView>
    </Screen>
  );
}

// Account-only (review 2026-11-18, IJ2): a guest sees the lock.
export default function PaymentsScreen() {
  return (
    <GuestPage
      title="Betaling"
      message="Logg inn for å se betaling."
      action="se betaling"
    >
      <PaymentsScreenContent />
    </GuestPage>
  );
}
