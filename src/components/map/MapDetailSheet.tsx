import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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

// Detail sheet — a bottom-docked Modal (matches the app's other sheets): slides up
// from the bottom edge, dims the map behind it, and closes on a backdrop tap, the
// close button, or Android back. Drilling in pushes onto the in-sheet stack
// (content swaps + a back chevron) instead of pushing a route.
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
  const open = stack.length > 0;
  const top = stack[stack.length - 1];
  const nested = stack.length > 1;

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={nested ? onBack : onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop: tap outside the card to close. Sibling BEHIND the opaque
            card, so taps on the card don't fall through to it. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lukk"
          onPress={onClose}
          className="absolute inset-0 bg-ink/40"
        />

        {top ? (
          <View
            className="max-h-[90%] rounded-t-lg bg-surface"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <View className="my-2 h-1 w-10 self-center rounded-full bg-line" />
            <View className="flex-row items-center gap-2 px-gutter pb-2">
              {nested ? (
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
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerClassName="gap-4 px-gutter pb-8"
              keyboardShouldPersistTaps="handled"
            >
              <Content target={top} push={push} />
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
