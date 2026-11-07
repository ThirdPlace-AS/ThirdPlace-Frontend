// Experience page (/experience/[id]): the shared ExperiencePage laid out as
// the reference video's page — top bar (back, caption, share, save), the page
// body and the join action as a floating card. Phase 12 H4c: a route, not an
// overlay, so Sveip's expand, Lagret, Mine planer, a chat's pinned
// experience and "Flere opplevelser" all open the same page with a real back.
// The map reaches it by dragging its experience sheet to the top snap.
// Short sub-views (deltakere, sjekk inn, administrer) open in a sheet over
// the page. Join/save use the shared stores; guests get the sign-in prompt
// (BLOCKED_CONTRACT_GAP).
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import { experienceCaption } from "@/components/experience/experienceMeta";
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import { DetailContent, titleFor } from "@/components/map/DetailContentRouter";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { markerId } from "@/components/map/types/mapPresentation";
import { Sheet } from "@/components/Sheet";
import { EmptyState, Header, Screen, StatusBarStyle } from "@/components/ui";
import { experienceById, type MockExperience } from "@/fixtures";
import { PageTopBar } from "@/features/entity/PageTopBar";
import { goBackOr } from "@/lib/navigation";
import { elevation } from "@/theme";

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

export function ExperiencePageBody({ exp }: { exp: MockExperience }) {
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SheetTarget[]>([]);
  const top = sub[sub.length - 1];
  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style="auto" />
      <PageTopBar
        caption={experienceCaption(exp)}
        shareMessage={`${exp.title} på ThirdPlace: thirdplace.app/experience/${exp.id}`}
        savedKey={markerId("experience", exp.id)}
      />
      <ScrollView
        contentContainerClassName="px-gutter pb-40 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <ExperiencePage
          exp={exp}
          onOpen={(t) => setSub([t])}
          onNavigate={(href: Href) => router.push(href)}
        />
      </ScrollView>
      {/* Join action as the reference's floating card. */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-0 px-gutter"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <View
          className="rounded-lg border border-line bg-surface px-4 py-3"
          style={elevation.e2}
        >
          <ExperienceJoinBar id={exp.id} />
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
