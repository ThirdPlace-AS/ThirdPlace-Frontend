import { GuestPage } from "@/components/GuestPage";
import { router, type Href } from "expo-router";
import { Pressable, View } from "react-native";

import {
  Icon,
  type IconName,
  Pressable as UIPressable,
  Text,
} from "@/components/ui";
import { businesses } from "@/fixtures";
import {
  switchToBusiness,
  switchToPersonal,
  useActiveBusinessId,
} from "@/lib/activeAccount";
import { useMyProfile } from "@/lib/myProfile";

// Account switcher, per the design (PDF p27): opened with a long press
// on the Profil tab. Lists the linked accounts — the personal Utforsker
// profile and the business workspace — plus "Administrer kontoer". A row
// makes its account the active one (src/lib/activeAccount.ts, G-Q8).
// BLOCKED_CONTRACT_GAP: no linked-account or session model; the switch is
// in memory and changes which account the screens name, nothing more.
function AccountSwitchPage() {
  const me = useMyProfile();
  const activeBiz = useActiveBusinessId();
  const biz = businesses[0];
  const rows: {
    title: string;
    hint: string;
    icon: IconName;
    onPress: () => void;
    active?: boolean;
  }[] = [
    {
      title: me.name,
      hint: "Utforsker",
      icon: "person-circle-outline",
      active: activeBiz === null,
      onPress: () => {
        switchToPersonal();
        router.back();
      },
    },
    {
      title: biz?.name ?? "Bedrift",
      hint: "Dashbord",
      icon: "tp-business",
      active: !!biz && activeBiz === biz.id,
      onPress: () => {
        if (biz) switchToBusiness(biz.id);
        router.replace("/workspace" as Href);
      },
    },
  ];
  return (
    <View className="flex-1 justify-end p-gutter pb-28">
      {/* Tap-to-close backdrop is a SIBLING behind the card, never its
          ancestor (no nested buttons — invalid DOM on web). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lukk"
        onPress={() => router.back()}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        className="bg-black/50"
      />
      <View
        className="gap-2 self-end rounded-md bg-surface p-3"
        style={{ width: 280 }}
      >
        {rows.map((r) => (
          <UIPressable
            key={r.title}
            accessibilityRole="button"
            onPress={r.onPress}
            contentClassName="flex-row items-center gap-3 rounded-sm p-3"
          >
            <Icon name={r.icon} size="xl" tone="ink" />
            <View className="flex-1">
              <Text variant="label" weight="semibold">
                {r.title}
              </Text>
              <Text variant="caption" tone="muted">
                {r.hint}
              </Text>
            </View>
            {r.active ? (
              <Text variant="caption" weight="semibold" tone="success">
                ✓ Aktiv
              </Text>
            ) : null}
          </UIPressable>
        ))}
        <UIPressable
          accessibilityRole="button"
          onPress={() => router.replace("/settings" as Href)}
          contentClassName="items-center rounded-sm bg-surfaceMuted py-3"
        >
          <Text variant="label" weight="semibold">
            Administrer kontoer
          </Text>
        </UIPressable>
      </View>
    </View>
  );
}

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function AccountSwitch() {
  return (
    <GuestPage
      title="Bytt konto"
      message="Logg inn for å bytte konto."
      action="bytte konto"
    >
      <AccountSwitchPage />
    </GuestPage>
  );
}
