import type { ReactNode } from "react";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";

// Titled disclosure section (chevron). Collapsed by default. Content mounts only
// while expanded, so the collapse is instant and reduced-motion-safe by nature
// (no height animation to suppress). Used for the filter sheet's "Vis mer"
// language expander and "Tilgjengelighetsfunksjoner".
export function Accordion({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between py-2"
      >
        <Text className="text-base font-semibold text-ink">{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.ink}
        />
      </Pressable>
      {subtitle ? (
        <Text className="-mt-1 mb-1 text-xs text-muted">{subtitle}</Text>
      ) : null}
      {open ? <View>{children}</View> : null}
    </View>
  );
}
