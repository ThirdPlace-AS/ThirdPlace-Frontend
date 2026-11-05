import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Text, View } from "react-native";

import { IconButton } from "@/components/ui";
import { useThemeColors } from "@/theme";

import { DetailContent, titleFor } from "./DetailContentRouter";
import type { PushFn, SheetTarget } from "./sheetTypes";

// Google-Maps-style expandable detail sheet (@gorhom/bottom-sheet). Draggable
// with momentum between three snaps — peek (16%), mid (50%), full (92%). Marker
// taps open it at the peek so a slice of the detail shows right away; the user
// drags up for more or pulls down to dismiss. Above the peek a backdrop dims the
// map and closes the sheet on tap; at the peek there is NO backdrop so the map
// stays interactive (tapping the map collapses the sheet — handled in map.tsx).
// Drilling in (reviews, attendees, …) swaps content on the in-sheet stack with a
// back chevron instead of pushing a route.
export function MapDetailSheet({
  stack,
  openIndex,
  openNonce,
  push,
  onBack,
  onClose,
}: {
  stack: SheetTarget[];
  // Snap index to animate to when a new target opens (0 peek / 1 mid).
  openIndex: number;
  // Bumped by the selection hook on every tap — re-snaps the sheet open even
  // when the target is unchanged, so a marker tap always shows the detail.
  openNonce: number;
  push: PushFn;
  onBack: () => void;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const snapPoints = useMemo(() => ["35%", "60%", "92%"], []);

  const sheetRef = useRef<BottomSheet>(null);
  const open = stack.length > 0;
  const top = stack[stack.length - 1];
  const nested = stack.length > 1;
  // Re-snap only when the ROOT target changes (not on in-sheet push/back).
  const rootKey = stack[0] ? `${stack[0].kind}:${stack[0].id}` : null;

  // Open → animate to the requested snap; closed → hide. Driven imperatively so
  // the user can still drag freely once it is open. `openNonce` is in the deps
  // so EVERY tap re-snaps the sheet open, even when the target is unchanged or
  // the sheet was left mounted at a different snap. Belt-and-suspenders with the
  // declarative `index` prop below, which handles the first-mount open without
  // relying on effect timing.
  useEffect(() => {
    if (open) sheetRef.current?.snapToIndex(openIndex);
    else sheetRef.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rootKey, openNonce]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      // Declarative open: mount already at the requested snap so the detail
      // shows on the first frame (no wait for the effect to fire — fixes taps
      // that intermittently opened nothing on the SoftMap/web path).
      index={open ? openIndex : -1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      // No bottomInset: the sheet docks to the bottom of the screen content
      // (just above the tab bar) so it reads as sliding up from the nav instead
      // of floating in the middle of the map.
      backdropComponent={renderBackdrop}
      onClose={() => {
        // Sync React state when the sheet is dismissed by gesture/backdrop.
        if (open) onClose();
      }}
      handleIndicatorStyle={{ backgroundColor: colors.line }}
      backgroundStyle={{ backgroundColor: colors.surface }}
    >
      {top ? (
        <>
          <View className="flex-row items-center gap-2 pb-2 px-gutter">
            {nested ? (
              <IconButton
                icon="chevron-back"
                label="Tilbake"
                size="sm"
                onPress={onBack}
              />
            ) : null}
            <Text
              className="flex-1 text-xl font-bold text-ink"
              numberOfLines={1}
            >
              {titleFor(top)}
            </Text>
            <IconButton
              icon="close"
              label="Lukk"
              size="sm"
              tone="muted"
              onPress={onClose}
            />
          </View>
          <BottomSheetScrollView
            contentContainerClassName="gap-4 px-gutter pb-16"
            keyboardShouldPersistTaps="handled"
          >
            <DetailContent target={top} push={push} />
          </BottomSheetScrollView>
        </>
      ) : (
        <View />
      )}
    </BottomSheet>
  );
}
