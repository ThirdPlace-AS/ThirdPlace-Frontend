import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Sheet } from "@/components/Sheet";
import { DetailContent, titleFor } from "@/components/map/DetailContentRouter";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { colors } from "@/theme";

// Reusable detail sheet with an in-sheet navigation stack, for surfaces outside
// the map (people/groups/businesses index routes, nested list routes). Opening a
// target seeds the stack; drilling in (reviews, verification, place…) pushes a
// new target with a back chevron instead of a route, mirroring MapDetailSheet but
// on the plain Modal-based Sheet. Bodies are the existing DetailContent
// components — no new per-kind UI, no new contract.
export function DetailStackSheet({
  target,
  onClose,
}: {
  target: SheetTarget | null;
  onClose: () => void;
}) {
  const [stack, setStack] = useState<SheetTarget[]>(target ? [target] : []);

  // Reseed the stack whenever a new root target is opened (or cleared). Done as
  // a render-phase adjustment keyed on target identity (not an effect) so there
  // is no extra render pass — React drops the in-progress render and restarts.
  const [seededFor, setSeededFor] = useState<SheetTarget | null>(target);
  if (target !== seededFor) {
    setSeededFor(target);
    setStack(target ? [target] : []);
  }

  const top = stack[stack.length - 1];
  const nested = stack.length > 1;

  const push = (t: SheetTarget) => setStack((s) => [...s, t]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  return (
    <Sheet
      visible={target !== null}
      onClose={onClose}
      title={top ? titleFor(top) : ""}
      fullHeight
    >
      {top ? (
        <ScrollView
          contentContainerClassName="gap-4 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {nested ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tilbake"
              hitSlop={8}
              onPress={back}
              className="-ml-1 flex-row items-center gap-1 self-start active:opacity-70"
            >
              <Ionicons name="chevron-back" size={20} color={colors.ink} />
              <Text className="text-sm font-medium text-ink">Tilbake</Text>
            </Pressable>
          ) : null}
          <DetailContent target={top} push={push} />
        </ScrollView>
      ) : (
        <View />
      )}
    </Sheet>
  );
}
