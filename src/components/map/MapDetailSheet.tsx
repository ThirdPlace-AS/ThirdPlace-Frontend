import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { businessById, experienceById, groupById, placeById } from "@/fixtures";
import { colors } from "@/theme";

import { AttendeesContent } from "./content/AttendeesContent";
import { BusinessContent } from "./content/BusinessContent";
import { CheckinContent } from "./content/CheckinContent";
import { ExperienceContent } from "./content/ExperienceContent";
import { GroupContent } from "./content/GroupContent";
import { HostContent } from "./content/HostContent";
import { PlaceContent } from "./content/PlaceContent";
import { ReviewsContent } from "./content/ReviewsContent";
import { VerificationContent } from "./content/VerificationContent";
import type { PushFn, SheetTarget } from "./sheetTypes";

function titleFor(t: SheetTarget): string {
  switch (t.kind) {
    case "place":
      return placeById(t.id)?.name ?? "Sted";
    case "business":
      return businessById(t.id)?.name ?? "Bedrift";
    case "experience":
      return experienceById(t.id)?.title ?? "Arrangement";
    case "group":
      return groupById(t.id)?.name ?? "Gruppe";
    case "reviews":
      return "Anmeldelser";
    case "attendees":
      return "Deltakere";
    case "host":
      return "Administrer";
    case "checkin":
      return "Innsjekk";
    case "verification":
      return "Verifisering";
  }
}

function Content({ target, push }: { target: SheetTarget; push: PushFn }) {
  switch (target.kind) {
    case "place":
      return <PlaceContent id={target.id} push={push} />;
    case "business":
      return <BusinessContent id={target.id} push={push} />;
    case "experience":
      return <ExperienceContent id={target.id} push={push} />;
    case "reviews":
      return <ReviewsContent id={target.id} />;
    case "attendees":
      return <AttendeesContent id={target.id} />;
    case "host":
      return <HostContent id={target.id} push={push} />;
    case "group":
      return <GroupContent id={target.id} />;
    case "checkin":
      return <CheckinContent id={target.id} />;
    case "verification":
      return <VerificationContent />;
  }
}

export function MapDetailSheet({
  stack,
  push,
  onBack,
  onClose,
}: {
  stack: SheetTarget[];
  push: PushFn;
  onBack: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  // Keep the sheet above the bottom tab bar (~49pt + bottom safe area).
  const tabBarHeight = 49 + insets.bottom;
  const snapPoints = useMemo(() => ["16%", "50%", "92%"], []);

  const open = stack.length > 0;
  const top = stack[stack.length - 1];

  return (
    <BottomSheet
      // Controlled: open → mid snap; closed → hidden. Children are always
      // rendered (empty View when closed) so gorhom can measure snap points.
      index={open ? 1 : -1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      bottomInset={tabBarHeight}
      onChange={(i) => {
        if (i === -1 && open) onClose();
      }}
      handleIndicatorStyle={{ backgroundColor: colors.line }}
      backgroundStyle={{ backgroundColor: colors.surface }}
    >
      {top ? (
        <>
          <View className="flex-row items-center gap-2 px-gutter pb-2">
            {stack.length > 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tilbake"
                onPress={onBack}
                className="-ml-2 h-9 w-9 items-center justify-center rounded-full"
              >
                <Ionicons name="chevron-back" size={22} color={colors.ink} />
              </Pressable>
            ) : null}
            <Text
              className="flex-1 text-xl font-bold text-ink"
              numberOfLines={1}
            >
              {titleFor(top)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lukk"
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full"
            >
              <Ionicons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>
          <BottomSheetScrollView
            contentContainerClassName="gap-4 px-gutter pb-16"
            keyboardShouldPersistTaps="handled"
          >
            <Content target={top} push={push} />
          </BottomSheetScrollView>
        </>
      ) : (
        <View />
      )}
    </BottomSheet>
  );
}
