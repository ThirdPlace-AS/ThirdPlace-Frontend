import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  type BottomSheetHandleProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFocusEffect } from "expo-router";
import { Share, View, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FadeSwap,
  HeartToggle,
  BACK_ICON,
  IconButton,
  RootPortal,
  SheetHeader,
  StatusBarStyle,
  Text,
  useSheetChrome,
} from "@/components/ui";
import { SignInPrompt } from "@/components/SignInPrompt";
import { PAGE_BAR_ROW } from "@/components/experience/ExperiencePage";
import { chatForPlace, experienceById, placeById } from "@/fixtures";
import { elevation, gutterPx, useThemeColors } from "@/theme";

import { PageActionCard } from "./content/PageActionCard";
import { useGuestMode } from "./hooks/useGuestMode";
import { useMapSaved } from "./hooks/useMapSaved";
import { markViewed } from "./hooks/useRecentlyViewed";
import { DetailContent, titleFor } from "./DetailContentRouter";
import {
  atPageTop,
  isPageKind,
  PAGE_FROM,
  PAGE_SNAP,
  pageInfoFor,
  type PageInfo,
} from "./pageTarget";
import { backdropA11y, sheetA11yChrome, useSheetHandleA11y } from "./sheetA11y";
import type { PushFn, SheetTarget } from "./sheetTypes";

// Google-Maps-style expandable detail sheet (@gorhom/bottom-sheet) with three
// snaps — peek, mid, full. Marker taps open it at the peek; the user drags up
// for more or pulls down to dismiss. Above the peek a backdrop dims the map.
// Drilling in (reviews, attendees, …) swaps content on the in-sheet stack.
//
// Experiences (Phase 11 G5, the founder's reference video) and places of
// every kind (user 2026-11-09: "make businesses and places the same map
// details sheet as experience"): the page sheet is a modal sheet rendered in
// the app-root portal, above the tab bar, so its 100 % top snap is the
// full-screen page (ExperiencePage / PlacePage). While dragging up, the
// handle fades, the top corners square off and the page top bar (back,
// caption, share, save) grows in — all from gorhom's animatedIndex on the UI
// thread (styles only on Animated.View). Tried and dropped: hiding the tab
// bar (it resized gorhom's container and re-snapped the sheet) and handing
// off to a second full-screen page at the top (the sheet vanished for ~1 s
// while the page mounted). Back / ← at the top returns to the mid snap.
// Pushed views keep the normal header, padded below the status bar at the
// top snap. Groups keep the 92 % sheet docked above the tab bar.

// Page peek: handle + ✕ row + the top of the gallery (sized when the floating
// card sat above the peek: ≈ 24 + 56 + 120 + 100 dp; since 0342 the card
// shows only at the top snap and the peek keeps this floor).
const PAGE_PEEK_MIN = 300;

export type MapDetailSheetHandle = {
  /** Page → mid snap (Android back at the top snap). */
  collapse: () => void;
};

// Memoised (speed pass 0345): its props from the map screen are stable, so the
// open page renders again only when its stack or snap changes.
export const MapDetailSheet = memo(
  forwardRef<
    MapDetailSheetHandle,
    {
      stack: SheetTarget[];
      // Snap index to animate to when a new target opens (0 peek / 1 mid).
      openIndex: number;
      // Bumped by the selection hook on every tap — re-snaps the sheet open even
      // when the target is unchanged, so a marker tap always shows the detail.
      openNonce: number;
      push: PushFn;
      onBack: () => void;
      onClose: () => void;
      /** Reports whether the experience page is full screen (top snap). */
      onPageChange?: (isPage: boolean) => void;
    }
  >(function MapDetailSheet(
    { stack, openIndex, openNonce, push, onBack, onClose, onPageChange },
    ref,
  ) {
    const chrome = useSheetChrome();
    const insets = useSafeAreaInsets();
    // The experience sheet renders at the app root (above the tab bar), so it
    // must leave with the map: a route opened from the page (host profile,
    // chat, Rediger) or another tab would otherwise sit under it. Published
    // only while the map screen is focused; it remounts at openIndex on return.
    const [focused, setFocused] = useState(true);
    useFocusEffect(
      useCallback(() => {
        setFocused(true);
        return () => setFocused(false);
      }, []),
    );
    const root = stack[0];
    const pageCapable = isPageKind(root?.kind);
    const { height: winH } = useWindowDimensions();
    // Short phones (H1, Phase 11 open item): at 35 % of a 640 dp screen only
    // the handle and ✕ showed above the floating join card. The page peek is
    // at least PAGE_PEEK_MIN dp, so the top of the gallery shows.
    const compact = winH < 700;
    const snapPoints = useMemo(
      () =>
        pageCapable
          ? [Math.max(Math.round(winH * 0.35), PAGE_PEEK_MIN), "60%", "100%"]
          : ["35%", "60%", "92%"],
      [pageCapable, winH],
    );

    const sheetRef = useRef<BottomSheet>(null);
    const animatedIndex = useSharedValue(openIndex);
    const [isPage, setIsPage] = useState(false);
    const open = stack.length > 0;
    const top = stack[stack.length - 1];
    const nested = stack.length > 1;
    const topIsExperience = top?.kind === "experience";
    // The top view is a page (experience or place): the page top bar, Del +
    // Lagre in the header and the header folding away at the top snap.
    const topIsPage = isPageKind(top?.kind);
    const pageInfo = useMemo(
      () => (topIsPage ? pageInfoFor(top) : null),
      [topIsPage, top],
    );
    // Re-snap only when the ROOT target changes (not on in-sheet push/back).
    const rootKey = root ? `${root.kind}:${root.id}` : null;
    // The page top bar clears the status bar; the handle row (24) sits above.
    const topPad = Math.max(0, insets.top - 24);

    // Page state from the sheet position, not onChange: a drag that reaches
    // the top and carries on into the content scroll never "snaps", so gorhom
    // does not report index 2. Drives back handling, the top bar's touch and
    // the status bar.
    const onTop = useCallback(
      (atTop: boolean) => setIsPage(pageCapable && atTop),
      [pageCapable],
    );
    useAnimatedReaction(
      () => atPageTop(animatedIndex.value),
      (atTop, prev) => {
        if (atTop !== prev) runOnJS(onTop)(atTop);
      },
      [onTop],
    );

    useImperativeHandle(ref, () => ({
      collapse: () => sheetRef.current?.snapToIndex(1),
    }));

    // Open → animate to the requested snap; closed → hide. `openNonce` is in
    // the deps so EVERY tap re-snaps the sheet open.
    useEffect(() => {
      if (open) sheetRef.current?.snapToIndex(openIndex);
      else sheetRef.current?.close();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, rootKey, openNonce]);

    useEffect(() => {
      onPageChange?.(isPage);
    }, [isPage, onPageChange]);

    // A floating action card on the full-screen page (PageActionCard, top snap
    // only; user 2026-11-09): an experience's join action (PDF p6 + video, "Bli
    // med"), a place's chat (user 2026-11-09: "a sticky action section but it
    // should focus on the chat"; PDF p6 draws a chat bar under places too).
    const footerKind: "experience" | "place" | null = !top
      ? null
      : topIsExperience
        ? "experience"
        : top.kind === "place" && chatForPlace(top.id)
          ? "place"
          : null;
    const footerId = footerKind && top ? top.id : null;

    // "Nylig sett": a place or experience whose detail actually opened.
    const topKind = top?.kind;
    const topId = top?.id;
    useEffect(() => {
      if (!topId) return;
      if (topKind === "place") {
        const p = placeById(topId);
        if (p) markViewed({ kind: "place", id: topId, title: p.name });
      } else if (topKind === "experience") {
        const e = experienceById(topId);
        if (e) markViewed({ kind: "experience", id: topId, title: e.title });
      }
    }, [topKind, topId]);

    // Keep this callback stable (no page state in its deps): gorhom renders it
    // as a component type, so a new identity remounts the card.
    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) =>
        footerKind && footerId ? (
          <BottomSheetFooter {...props}>
            <PageActionCard
              kind={footerKind}
              id={footerId}
              animatedIndex={animatedIndex}
              // The portal sheet reaches the screen bottom (gesture bar).
              bottomPad={pageCapable ? Math.max(insets.bottom, 12) : 12}
              compact={compact}
            />
          </BottomSheetFooter>
        ) : null,
      [
        footerKind,
        footerId,
        animatedIndex,
        pageCapable,
        insets.bottom,
        compact,
      ],
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={1}
          disappearsOnIndex={0}
          pressBehavior="close"
          {...backdropA11y}
        />
      ),
      [],
    );

    // Header: the experience page shows only ✕ in sheet mode and collapses it
    // as the page top bar grows in; pushed views keep back + title and move
    // below the status bar at the top snap.
    const headerStyle = useAnimatedStyle(() => {
      if (!pageCapable) return {};
      const t = interpolate(
        animatedIndex.value,
        [PAGE_FROM, PAGE_SNAP],
        [0, 1],
        Extrapolation.CLAMP,
      );
      // Always set every key: Reanimated keeps a prop that a later style
      // object leaves out (a pushed view kept maxHeight 0 and vanished).
      return topIsPage
        ? { maxHeight: 64 * (1 - t), opacity: 1 - t, paddingTop: 0 }
        : { maxHeight: 200, opacity: 1, paddingTop: topPad * t };
    }, [pageCapable, topIsPage, topPad]);

    const sheet = (
      <>
        {isPage ? <StatusBarStyle style="auto" /> : null}
        <BottomSheet
          ref={sheetRef}
          // Declarative open: mount already at the requested snap so the detail
          // shows on the first frame.
          index={open ? openIndex : -1}
          snapPoints={snapPoints}
          animatedIndex={animatedIndex}
          enableDynamicSizing={false}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          footerComponent={footerId ? renderFooter : undefined}
          onClose={() => {
            // Sync React state when the sheet is dismissed by gesture/backdrop.
            if (open) onClose();
          }}
          {...chrome}
          {...sheetA11yChrome}
          {...(pageCapable
            ? {
                backgroundComponent: PageBackground,
                handleComponent: PageHandle,
              }
            : null)}
        >
          {top ? (
            <>
              {pageCapable && pageInfo ? (
                <PageTopBar
                  animatedIndex={animatedIndex}
                  topPad={topPad}
                  interactive={isPage}
                  info={pageInfo}
                  onBack={() => sheetRef.current?.snapToIndex(1)}
                />
              ) : null}
              <Animated.View
                style={[
                  { paddingHorizontal: gutterPx, overflow: "hidden" },
                  headerStyle,
                ]}
              >
                <View className="pb-2">
                  <SheetHeader
                    title={topIsPage ? undefined : titleFor(top)}
                    onBack={nested ? onBack : undefined}
                    onClose={onClose}
                    actions={pageInfo ? <ShareSave info={pageInfo} /> : null}
                  />
                </View>
              </Animated.View>
              <BottomSheetScrollView
                contentContainerClassName={`gap-4 px-gutter ${pageCapable ? "pt-4" : ""} ${footerId ? "pb-36" : "pb-16"}`}
                keyboardShouldPersistTaps="handled"
              >
                {/* In-sheet push/back fades the new content in (was one frame). */}
                <FadeSwap swapKey={`${top.kind}:${top.id}`}>
                  <DetailContent target={top} push={push} />
                </FadeSwap>
              </BottomSheetScrollView>
            </>
          ) : (
            <View />
          )}
        </BottomSheet>
      </>
    );
    // Experiences: a modal sheet at the app root, above the tab bar, only while
    // the map is the focused screen.
    if (!pageCapable) return sheet;
    return focused ? <RootPortal>{sheet}</RootPortal> : null;
  }),
);

// Sheet background whose top corners square off on the way to the page snap.
function PageBackground({ style, animatedIndex }: BottomSheetBackgroundProps) {
  const c = useThemeColors();
  const chrome = useSheetChrome();
  const radius =
    (chrome.backgroundStyle.borderTopLeftRadius as number | undefined) ?? 28;
  const a = useAnimatedStyle(() => {
    const r = interpolate(
      animatedIndex.value,
      [PAGE_FROM, PAGE_SNAP],
      [radius, 0],
      Extrapolation.CLAMP,
    );
    return { borderTopLeftRadius: r, borderTopRightRadius: r };
  }, [radius]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { backgroundColor: c.surface }, elevation.e3, a]}
    />
  );
}

// Grab handle that fades out on the way to the page snap (still draggable).
function PageHandle({ animatedIndex }: BottomSheetHandleProps) {
  const c = useThemeColors();
  const a11y = useSheetHandleA11y();
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [PAGE_FROM, PAGE_SNAP],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));
  return (
    <View
      style={{ height: 24, alignItems: "center", justifyContent: "center" }}
      {...a11y}
    >
      <Animated.View
        style={[
          { width: 40, height: 4, borderRadius: 2, backgroundColor: c.line },
          a,
        ]}
      />
    </View>
  );
}

// The reference page's top bar: back (to 60 %), small centred caption, share
// and save. Grows in with the drag; tappable only once the page is settled.
/** Del + Lagre for a page (experience or place): in the page top bar, and
 *  next to ✕ in the sheet header at the lower snaps (they left the page
 *  body: no fact twice). */
function ShareSave({ info }: { info: PageInfo }) {
  const { isGuest } = useGuestMode();
  const { isSaved, toggle } = useMapSaved();
  const [promptOpen, setPromptOpen] = useState(false);
  const saved = isSaved(info.savedKey);
  return (
    <>
      <IconButton
        icon="share-outline"
        label="Del"
        onPress={() =>
          void Share.share({ message: info.shareMessage }).catch(() => {})
        }
      />
      <HeartToggle
        selected={saved}
        variant="ghost"
        label={saved ? "Fjern fra lagret" : "Lagre"}
        onToggle={() => (isGuest ? setPromptOpen(true) : toggle(info.savedKey))}
      />
      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action="lagre"
      />
    </>
  );
}

function PageTopBar({
  animatedIndex,
  topPad,
  interactive,
  info,
  onBack,
}: {
  animatedIndex: SharedValue<number>;
  topPad: number;
  interactive: boolean;
  info: PageInfo;
  onBack: () => void;
}) {
  const full = topPad + PAGE_BAR_ROW;
  const a = useAnimatedStyle(() => {
    const t = interpolate(
      animatedIndex.value,
      [PAGE_FROM, PAGE_SNAP],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { height: full * t, opacity: t };
  }, [full]);
  return (
    <Animated.View
      pointerEvents={interactive ? "auto" : "none"}
      style={[{ overflow: "hidden" }, a]}
    >
      <View
        className="flex-row items-center gap-1 border-b border-line px-2"
        style={{ paddingTop: topPad, height: full }}
      >
        <IconButton icon={BACK_ICON} label="Tilbake" onPress={onBack} />
        <Text
          variant="caption"
          weight="semibold"
          tone="muted"
          className="flex-1 text-center"
          numberOfLines={1}
        >
          {info.caption}
        </Text>
        <ShareSave info={info} />
      </View>
    </Animated.View>
  );
}
