// Full-screen experience page (Phase 11 G5): the shared ExperiencePage laid
// out as the reference video's page — white top bar (back, caption, share,
// save), the page body, and the join action as a floating card — in an
// Overlay (Modal engine) for Sveip's expanded card. The map reaches the same
// page by dragging its experience sheet to the top snap (MapDetailSheet). Sub-views (sted, deltakere, gruppe, sjekk
// inn, vert) open in a sheet over the page; host profile and chat leave the
// overlay first (a route would render under the Modal). Join/save use the
// shared stores; guests get the sign-in prompt (BLOCKED_CONTRACT_GAP).
import { router, type Href } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import {
  HeartToggle,
  IconButton,
  Overlay,
  StatusBarStyle,
  Text,
  type OverlayEnter,
} from "@/components/ui";
import { experienceById, type MockExperience } from "@/fixtures";
import { elevation, useThemeColors } from "@/theme";

import { ExperienceJoinBar } from "../map/content/ExperienceJoinBar";
import { DetailContent, titleFor } from "../map/DetailContentRouter";
import { useGuestMode } from "../map/hooks/useGuestMode";
import { useMapSaved } from "../map/hooks/useMapSaved";
import type { SheetTarget } from "../map/sheetTypes";
import { markerId } from "../map/types/mapPresentation";
import { ExperiencePage } from "./ExperiencePage";
import { experienceCaption } from "./experienceMeta";

/** Height of the page top bar below the status bar (shared with the map
 * sheet's page chrome so both pages line up). */
export const PAGE_BAR_ROW = 52;

export function ExperiencePageOverlay({
  exp,
  onClose,
  onSwap,
  enter = "up",
}: {
  /** Experience to show; null = closed. */
  exp: MockExperience | null;
  onClose: () => void;
  /** Called when "Flere opplevelser i området" swaps the page. */
  onSwap?: (e: MockExperience) => void;
  enter?: OverlayEnter;
}) {
  const c = useThemeColors();
  // Keep the last experience on screen while the overlay animates out, and
  // let "Flere opplevelser i området" swap it in place.
  const [shown, setShown] = useState(exp);
  const [opened, setOpened] = useState(exp);
  if (exp !== opened) {
    setOpened(exp);
    if (exp) setShown(exp);
  }
  return (
    <Overlay
      visible={exp !== null}
      onClose={onClose}
      enter={enter}
      statusBarTranslucent
      style={{ backgroundColor: c.background }}
      accessibilityLabel={shown?.title}
    >
      {shown ? (
        <ExperiencePageBody
          exp={shown}
          onClose={onClose}
          onSwap={(e) => {
            setShown(e);
            onSwap?.(e);
          }}
        />
      ) : null}
    </Overlay>
  );
}

function ExperiencePageBody({
  exp,
  onClose,
  onSwap,
}: {
  exp: MockExperience;
  onClose: () => void;
  onSwap: (e: MockExperience) => void;
}) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { isGuest } = useGuestMode();
  const [signInFor, setSignInFor] = useState<string | null>(null);
  const [sub, setSub] = useState<SheetTarget[]>([]);
  const { isSaved, toggle } = useMapSaved();
  const savedKey = markerId("experience", exp.id);
  const saved = isSaved(savedKey);

  // Leave the overlay before navigating: a route would open under the Modal.
  const leaveTo = (href: Href) => {
    onClose();
    setTimeout(() => router.push(href), 260);
  };
  const top = sub[sub.length - 1];

  return (
    <View className="flex-1">
      <StatusBarStyle style="auto" />
      {/* Page top bar (reference: back, small centred caption, share, heart). */}
      <View
        className="flex-row items-center gap-1 border-b border-line bg-background px-2"
        style={{ paddingTop: insets.top, height: insets.top + PAGE_BAR_ROW }}
      >
        <IconButton icon="arrow-back" label="Tilbake" onPress={onClose} />
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
        ref={scrollRef}
        contentContainerClassName="px-gutter pb-40 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <ExperiencePage
          exp={exp}
          onOpen={(t) => setSub([t])}
          onOpenExperience={(id) => {
            const next = experienceById(id);
            if (!next) return;
            onSwap(next);
            scrollRef.current?.scrollTo({ y: 0, animated: false });
          }}
          onNavigate={leaveTo}
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
