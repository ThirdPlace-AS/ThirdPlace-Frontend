// Place page (/place/[id]), Phase 12: the video-style PlacePage (H5d) under
// the same top bar as the experience page. Lagret, an experience's venue
// row, "Flere steder i nærheten" and deep links open it; map pins open the
// same PlacePage in the map's page sheet (2026-11-09), Sveip's arrow in place
// (SwipeDetails, 2026-11-18).
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { PageScrollContext, scrollAnchorIn } from "@/components/pageScroll";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { placeCaption } from "@/components/experience/experienceMeta";
import { PlaceChatBar } from "@/components/map/content/PlaceChatBar";
import { markerId } from "@/components/map/types/mapPresentation";
import { PlacePage } from "@/components/place/PlacePage";
import { EmptyState, Header, Screen, StatusBarStyle } from "@/components/ui";
import { chatForPlace, placeById } from "@/fixtures";
import { PageTopBar } from "@/features/entity/PageTopBar";
import { goBackOr } from "@/lib/navigation";
import { elevation } from "@/theme";

// The floating chat card's height before it is measured (dp).
const CHAT_CARD = 96;

export default function PlaceScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const place = placeById(id);
  if (!place) {
    return (
      <Screen edges={["top", "bottom"]}>
        <Header title="Sted" />
        <EmptyState
          icon="location-outline"
          title="Fant ikke stedet"
          actionLabel="Til kartet"
          onAction={() => goBackOr("/map")}
        />
      </Screen>
    );
  }
  return <PlacePageBody place={place} />;
}

export function PlacePageBody({
  place,
  onBack,
}: {
  place: NonNullable<ReturnType<typeof placeById>>;
  /** Set where the page is open in place (Sveip's details). */
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  // The rating link scrolls to the page's reviews (pageScroll.ts).
  const scrollRef = useRef<ScrollView>(null);
  const boxRef = useRef<View>(null);
  const scrollToAnchor = useCallback(
    (anchor: View | null) =>
      scrollAnchorIn(boxRef.current, anchor, 16, (y) =>
        scrollRef.current?.scrollTo({ y, animated: true }),
      ),
    [],
  );
  const scroller = useMemo(() => ({ scrollToAnchor }), [scrollToAnchor]);
  // The floating chat card, as on the map's page: a place's chat, with its
  // last message and "Bli med i samtalen".
  const hasChat = chatForPlace(place.id) != null;
  const [cardH, setCardH] = useState(CHAT_CARD);
  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style="auto" />
      <PageTopBar
        // "Byrom · Kolsås" (Phase 19): what it is and where.
        caption={placeCaption(place)}
        shareMessage={`${place.name} på ThirdPlace: thirdplace.app/place/${place.id}`}
        savedKey={markerId("place", place.id)}
        onBack={onBack}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="px-gutter pt-4"
        // The page bottom (48) above the home indicator, or 24 above the
        // floating chat card.
        contentContainerStyle={{
          paddingBottom: hasChat
            ? Math.max(insets.bottom, 12) + 4 + cardH + 24
            : insets.bottom + 48,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageScrollContext.Provider value={scroller}>
          <View ref={boxRef}>
            <PlacePage
              place={place}
              onNavigate={(href: Href) => router.push(href)}
            />
          </View>
        </PageScrollContext.Provider>
      </ScrollView>
      {hasChat ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 bottom-0 px-gutter"
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
        >
          <View
            className="rounded-md border border-line bg-surface px-4 py-3"
            style={elevation.e2}
            onLayout={(e) => {
              const h = Math.round(e.nativeEvent.layout.height);
              if (h > 0 && h !== cardH) setCardH(h);
            }}
          >
            <PlaceChatBar placeId={place.id} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
