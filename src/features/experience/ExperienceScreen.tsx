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
import { ScrollView, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ExperiencePage,
  PAGE_BAR_ROW,
} from "@/components/experience/ExperiencePage";
import { experienceCaption } from "@/components/experience/experienceMeta";
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import { DetailContent, titleFor } from "@/components/map/DetailContentRouter";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import type { SheetTarget } from "@/components/map/sheetTypes";
import { markerId } from "@/components/map/types/mapPresentation";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import {
  EmptyState,
  Header,
  HeartToggle,
  IconButton,
  Screen,
  StatusBarStyle,
  Text,
} from "@/components/ui";
import { experienceById, type MockExperience } from "@/fixtures";
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
  const { isGuest } = useGuestMode();
  const [signInFor, setSignInFor] = useState<string | null>(null);
  const [sub, setSub] = useState<SheetTarget[]>([]);
  const { isSaved, toggle } = useMapSaved();
  const savedKey = markerId("experience", exp.id);
  const saved = isSaved(savedKey);
  const top = sub[sub.length - 1];
  return (
    <View className="flex-1 bg-background">
      <StatusBarStyle style="auto" />
      {/* Page top bar (reference: back, small centred caption, share, heart). */}
      <View
        className="flex-row items-center gap-1 border-b border-line bg-background px-2"
        style={{ paddingTop: insets.top, height: insets.top + PAGE_BAR_ROW }}
      >
        <IconButton
          icon="arrow-back"
          label="Tilbake"
          onPress={() => goBackOr("/map")}
        />
        <Text
          variant="caption"
          weight="semibold"
          tone="muted"
          className="flex-1 text-center"
          numberOfLines={1}
        >
          {experienceCaption(exp)}
        </Text>
        <IconButton
          icon="share-outline"
          label="Del"
          onPress={() =>
            void Share.share({
              message: `${exp.title} på ThirdPlace: thirdplace.app/experience/${exp.id}`,
            }).catch(() => {})
          }
        />
        <HeartToggle
          selected={saved}
          variant="ghost"
          haptic={!isGuest}
          label={saved ? "Fjern fra lagret" : "Lagre"}
          onToggle={() => (isGuest ? setSignInFor("lagre") : toggle(savedKey))}
        />
      </View>
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
      <SignInPrompt
        visible={signInFor !== null}
        action={signInFor ?? "fortsette"}
        onClose={() => setSignInFor(null)}
      />
    </View>
  );
}
