// Experience page (/experience/[id]): the shared ExperiencePage laid out as
// the reference video's page — top bar (back, caption, share, save), the page
// body and the join action as a floating card. Phase 12 H4c: a route, not an
// overlay, so Lagret, Mine planer, a chat's pinned experience and "Flere
// opplevelser" all open the same page with a real back (Sveip's arrow opens
// the same body in place, SwipeDetails, 2026-11-18).
// The map reaches it by dragging its experience sheet to the top snap.
// Short sub-views (deltakere, sjekk inn, administrer) open in a sheet over
// the page. Join/save use the shared stores; guests get the sign-in prompt
// (BLOCKED_CONTRACT_GAP).
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { PageScrollContext, scrollAnchorIn } from "@/components/pageScroll";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import { experienceCaption } from "@/components/experience/experienceMeta";
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import { DetailContent, titleFor } from "@/components/map/DetailContentRouter";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { markerId } from "@/components/map/types/mapPresentation";
import {
  EmptyState,
  Header,
  Screen,
  StatusBarStyle,
  Sheet,
} from "@/components/ui";
import { experienceById, type MockExperience } from "@/fixtures";
import { PageTopBar } from "@/features/entity/PageTopBar";
import { goBackOr } from "@/lib/navigation";
import { elevation, useRaisedEdge } from "@/theme";

// The floating join card's height before it is measured (0440: 110 dp on
// a 411 dp phone, the join bar wraps to two lines).
const JOIN_CARD = 110;

export default function ExperienceScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const exp = experienceById(id);
  if (!exp) {
    return (
      <Screen edges={["top", "bottom"]}>
        <Header title="Opplevelse" />
        <EmptyState
          icon="calendar-outline"
          title="Fant ikke opplevelsen"
          message="Den kan være avlyst eller fjernet."
          actionLabel="Til kartet"
          onAction={() => goBackOr("/map")}
        />
      </Screen>
    );
  }
  return <ExperiencePageBody exp={exp} />;
}

export function ExperiencePageBody({
  exp,
  onBack,
}: {
  exp: MockExperience;
  /** Set where the page is open in place (Sveip's details). */
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const edge = useRaisedEdge();
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
  const [sub, setSub] = useState<SheetTarget[]>([]);
  const [cardH, setCardH] = useState(JOIN_CARD);
  const top = sub[sub.length - 1];
  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style="auto" />
      <PageTopBar
        caption={experienceCaption(exp)}
        shareMessage={`${exp.title} på ThirdPlace: thirdplace.app/experience/${exp.id}`}
        savedKey={markerId("experience", exp.id)}
        onBack={onBack}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="px-6 pt-4"
        // The last section ends 24 above the floating join card.
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 12) + 4 + cardH + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageScrollContext.Provider value={scroller}>
          <View ref={boxRef}>
            <ExperiencePage
              exp={exp}
              onOpen={(t) => setSub([t])}
              onNavigate={(href: Href) => router.push(href)}
            />
          </View>
        </PageScrollContext.Provider>
      </ScrollView>
      {/* Join action as the reference's floating card. */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-0 px-gutter"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <View
          className={`rounded-md ${edge} bg-surface px-4 py-3`}
          style={elevation.e2}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (h > 0 && h !== cardH) setCardH(h);
          }}
        >
          <ExperienceJoinBar
            id={exp.id}
            onManage={() => setSub([{ kind: "host", id: exp.id }])}
          />
        </View>
      </View>
      {top ? (
        <Sheet
          visible
          onClose={() => setSub([])}
          title={titleFor(top)}
          onBack={
            sub.length > 1 ? () => setSub((s) => s.slice(0, -1)) : undefined
          }
        >
          <DetailContent target={top} push={(t) => setSub((s) => [...s, t])} />
        </Sheet>
      ) : null}
    </View>
  );
}
