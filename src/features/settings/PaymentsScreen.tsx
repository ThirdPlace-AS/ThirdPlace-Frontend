import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { colors } from "@/theme";
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Betaling" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        <DemoNote>{demoCopy.paymentsStructureOnly}</DemoNote>

        <SettingsSection title="Betalingsmetoder">
          <View className="items-center gap-2 px-4 py-8">
            <Ionicons name="card-outline" size={32} color={colors.muted} />
            <Text className="text-sm font-medium text-ink">
              Ingen betalingsmetoder
            </Text>
            <Text className="px-4 text-center text-xs text-muted">
              Her ville betalingsmetodene dine ligget.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setInfoOpen(true)}
            className="flex-row items-center gap-3 border-t border-line px-4 py-3.5 active:bg-surfaceMuted"
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.ink} />
            <Text className="flex-1 text-base text-ink">
              Legg til betalingsmetode
            </Text>
            <DemoBadge />
          </Pressable>
        </SettingsSection>

        <SettingsSection title="Historikk">
          <View className="items-center gap-2 px-4 py-8">
            <Ionicons name="receipt-outline" size={32} color={colors.muted} />
            <Text className="text-sm font-medium text-ink">
              Ingen transaksjoner
            </Text>
            <Text className="px-4 text-center text-xs text-muted">
              Kvitteringer ville dukket opp her.
            </Text>
          </View>
        </SettingsSection>

        <Text className="px-1 text-[11px] text-muted">
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
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={colors.success}
          />
          <Text className="flex-1 text-sm leading-5 text-ink">
            Denne demoen samler aldri inn kort-, bank- eller kontoopplysninger,
            og ingen ekte betaling kan skje. Et reelt betalingsskjema vil komme
            når betalingsflyten er fastsatt.
          </Text>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
