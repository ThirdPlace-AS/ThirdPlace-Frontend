import { router, type Href } from "expo-router";
import { View } from "react-native";
import { createStore, useStore } from "zustand";

import {
  Avatar,
  Icon,
  Pressable as UIPressable,
  Sheet,
  Text,
} from "@/components/ui";
import { businesses } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import {
  switchToBusiness,
  switchToPersonal,
  useActiveBusinessId,
} from "@/lib/activeAccount";
import { useMyProfile } from "@/lib/myProfile";

// The account switcher (review 2026-11-18 PR-08, 0526): a long press on the
// Profil tab (PDF p27) opens one sheet; the chip at Profil's top that also
// opened it is gone (user 2026-11-26: the switch is the tab's long hold).
// The sheet lists the linked accounts with a ✓
// on the active one and «Administrer kontoer». The switch itself is the
// in-memory one in src/lib/activeAccount.ts (G-Q8). BLOCKED_CONTRACT_GAP: no
// linked-account or session model; only the accounts the fixtures link
// (personal + the first business). No Enterprise row or «Legg til konto»:
// founder question 10 is open.

/** Whether the sheet is open: the Profil tab's long press opens it from the
 *  tab bar, so it lives outside the screen. */
const store = createStore(() => ({ open: false }));
const selectOpen = (s: { open: boolean }) => s.open;

export function openAccountSheet() {
  store.setState({ open: true });
}

export function closeAccountSheet() {
  store.setState({ open: false });
}

export function useAccountSheetOpen(): boolean {
  return useStore(store, selectOpen);
}

/** The account you act as, for the chip and the sheet. */
function useActiveAccount() {
  const me = useMyProfile();
  const activeId = useActiveBusinessId();
  const biz = activeId ? businesses.find((b) => b.id === activeId) : undefined;
  return { me, biz };
}

type Row = {
  key: string;
  title: string;
  subtitle: string;
  active: boolean;
  avatar: React.ReactNode;
  onPress: () => void;
};

/** The linked accounts (PDF p27). Picking the business opens its
 *  Arbeidsflate, as the switcher always did; picking the personal account
 *  stays on Profil. */
export function AccountSheet() {
  const open = useAccountSheetOpen();
  const { me, biz: active } = useActiveAccount();
  const biz = businesses[0];
  const afterClose = (go: () => void) => {
    closeAccountSheet();
    // The sheet leaves first (its exit is 200 ms), then the page opens.
    setTimeout(go, 240);
  };
  const rows: Row[] = [
    {
      key: "personal",
      title: me.name,
      subtitle: "Utforsker",
      active: !active,
      avatar: (
        <Avatar
          name={me.name}
          source={me.avatar ? libImage(me.avatar) : undefined}
          size="md"
          decorative
        />
      ),
      onPress: () => {
        switchToPersonal();
        closeAccountSheet();
      },
    },
  ];
  if (biz) {
    rows.push({
      key: biz.id,
      title: biz.name,
      subtitle: "Bedrift",
      active: active?.id === biz.id,
      avatar: (
        <Avatar name={biz.name} icon="tp-business" size="md" decorative />
      ),
      onPress: () => {
        switchToBusiness(biz.id);
        afterClose(() => router.push("/workspace" as Href));
      },
    });
  }
  return (
    <Sheet visible={open} onClose={closeAccountSheet} title="Bytt konto">
      <View className="gap-1">
        {rows.map((r) => (
          <UIPressable
            key={r.key}
            accessibilityRole="button"
            accessibilityLabel={`${r.title}, ${r.subtitle}`}
            accessibilityState={{ selected: r.active }}
            onPress={r.onPress}
            contentClassName="flex-row items-center gap-3 rounded-sm py-3"
          >
            {r.avatar}
            <View className="flex-1">
              <Text variant="body" weight="semibold" numberOfLines={1}>
                {r.title}
              </Text>
              <Text variant="caption" tone="muted">
                {r.subtitle}
              </Text>
            </View>
            {r.active ? <Icon name="checkmark" size="md" tone="ink" /> : null}
          </UIPressable>
        ))}
        <UIPressable
          accessibilityRole="button"
          onPress={() => afterClose(() => router.push("/settings/linked"))}
          contentClassName="flex-row items-center gap-3 rounded-sm py-3"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
            <Icon name="settings-outline" size="md" tone="ink" />
          </View>
          <Text variant="body" className="flex-1">
            Administrer kontoer
          </Text>
        </UIPressable>
      </View>
    </Sheet>
  );
}
