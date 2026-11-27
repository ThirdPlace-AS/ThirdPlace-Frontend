import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  type BottomSheetHandleProps,
  BottomSheetScrollView,
  type BottomSheetScrollViewMethods,
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
import {
  Platform,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
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
import { PageScrollContext, scrollAnchorIn } from "@/components/pageScroll";
import { PAGE_BAR_ROW } from "@/components/experience/ExperiencePage";
import { chatForPlace, experienceById, placeById } from "@/fixtures";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  duration,
  easing,
  presentation,
  spring,
  useElevation,
  gutterPx,
  useThemeColors,
} from "@/theme";

import { PageActionCard } from "./content/PageActionCard";
import { MiniPin } from "./MiniPin";
import { useGuestMode } from "./hooks/useGuestMode";
import { useMapSaved } from "./hooks/useMapSaved";
import { markViewed } from "./hooks/useRecentlyViewed";
import { pagePeekHeight } from "./services/pinCamera";
import {
  STAGE_FALLBACK_MS,
  STAGE_REST_DELAY_MS,
  STAGE_SWAP_MS,
  SheetStageContext,
  sheetStage,
} from "./sheetStage";
import { DetailContent, titleFor } from "./DetailContentRouter";
import {
  atPageTop,
  isPageKind,
  PAGE_FROM,
  PAGE_SNAP,
  PAGE_SWAP,
  pageInfoFor,
  type PageInfo,
} from "./pageTarget";
import { backdropA11y, sheetA11yChrome, useSheetHandleA11y } from "./sheetA11y";
import type { PushFn, SheetTarget } from "./sheetTypes";

const SHEET_EASE = Easing.bezier(...easing.sheet);
const EXIT_EASE = Easing.bezier(...easing.exit);
// Drag releases spring on from the finger's speed (0572), see MapBrowseSheet.
const SHEET_SPRING = { ...spring.sheet };
// The backdrop under the full-screen page: not read by TalkBack (null, not
// undefined, or gorhom puts back its English default label).
const BACKDROP_SILENT = {
  accessible: false,
  accessibilityLabel: null,
  accessibilityHint: null,
  accessibilityRole: null,
} as const;

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

// Mounted while the map is focused (0384): closed, the page sheet waits in the
// portal at index -1 (its body sits below the screen inside gorhom's box-none
// containers, so taps reach the map, its buttons and the tab bar), and a
// marker tap only animates it up instead of mounting and measuring it first.
// While it slides closed it keeps showing what it showed; once it is down the
// content goes and the stages reset. Groups still mount their docked sheet
// when they open.

// Page peek: 35 % of the window, at least PAGE_PEEK_MIN (300 dp: handle + ✕
// row + the top of the gallery, sized when the floating card sat above the
// peek; since 0342 the card shows only at the top snap and the peek keeps
// this floor). Both live in services/pinCamera.ts, since the pin-tap camera
// centres the pin above this same peek.

const NO_STACK: SheetTarget[] = [];

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
    // only while the map screen is focused; on return it remounts
    // where it was (restore below).
    const [focused, setFocused] = useState(true);
    // Where the page was when a route opened over it (phone check 2026-11-26:
    // back from Vurderinger, the host or a chat put the page at the middle
    // snap, scrolled to the top; Airbnb returns to the same place). The sheet
    // remounts at that snap and scrolls back once its content is laid out.
    const animatedIndex = useSharedValue(-1);
    const scrollY = useRef(0);
    const scrollRef = useRef<BottomSheetScrollViewMethods>(null);
    const [restore, setRestore] = useState<{
      index: number;
      y: number;
    } | null>(null);
    const pendingScroll = useRef<number | null>(null);
    // Only where a scroll comes to rest: a per-frame onScroll would cross to
    // JS on every frame of every scroll.
    const keepScrollY = useCallback(
      (e: { nativeEvent: { contentOffset: { y: number } } }) => {
        scrollY.current = e.nativeEvent.contentOffset.y;
      },
      [],
    );
    // Back once the sheet rests at its snap (gorhom holds the content at the
    // top while the sheet moves) and the content reaches that far.
    const contentH = useRef(0);
    const resting = useRef(false);
    const tryScrollBack = useCallback(() => {
      const y = pendingScroll.current;
      if (y === null || !resting.current || contentH.current < y) return;
      pendingScroll.current = null;
      scrollRef.current?.scrollTo({ y, animated: false });
    }, []);
    const scrollBack = useCallback(
      (_w: number, h: number) => {
        contentH.current = h;
        tryScrollBack();
      },
      [tryScrollBack],
    );
    useFocusEffect(
      useCallback(() => {
        setFocused(true);
        return () => {
          setFocused(false);
          resting.current = false;
          // The live position, not the last onChange: a drag that carries on
          // into the content scroll never reports the top snap (see onTop).
          const at = Math.round(animatedIndex.get());
          if (at >= 0) {
            setRestore({ index: at, y: scrollY.current });
            pendingScroll.current = scrollY.current;
          }
        };
      }, [animatedIndex]),
    );
    const open = stack.length > 0;
    // What the sheet shows: the open stack, or while it slides closed the
    // last one (cleared once it is down, clearShown below).
    const [shown, setShown] = useState<SheetTarget[]>(stack);
    if (open && shown !== stack) setShown(stack);
    const openRef = useRef(open);
    // Opened since the sheet last mounted (clearShown remounts it).
    const openedRef = useRef(false);
    useEffect(() => {
      openRef.current = open;
      if (open) openedRef.current = true;
    }, [open]);
    const root = shown[0];
    // Closed and empty, the sheet waits as the page sheet (most taps open a
    // place or an experience).
    const pageCapable = root ? isPageKind(root.kind) : true;
    const { height: winH } = useWindowDimensions();
    // Short phones (H1, Phase 11 open item): at 35 % of a 640 dp screen only
    // the handle and ✕ showed above the floating join card. The page peek is
    // at least PAGE_PEEK_MIN dp, so the top of the gallery shows.
    const compact = winH < 700;
    const snapPoints = useMemo(
      () =>
        pageCapable
          ? [pagePeekHeight(winH), "60%", "100%"]
          : ["35%", "60%", "92%"],
      [pageCapable, winH],
    );

    const sheetRef = useRef<BottomSheet>(null);
    // Opening and closing by code move on the sheet curves (0571): gorhom's
    // Android default (250 ms, Easing.out(exp)) jumped 16 % then 66 % in its
    // first two frames on the phone. Drag releases keep gorhom's own timing.
    const reduced = useReducedMotion();
    const openConfig = useMemo(
      () => ({
        duration: reduced ? duration.fast : presentation.enter,
        easing: SHEET_EASE,
      }),
      [reduced],
    );
    const closeConfig = useMemo(
      () => ({
        duration: reduced ? duration.fast : presentation.exit,
        easing: EXIT_EASE,
      }),
      [reduced],
    );
    // A link on the page brings one of its sections into view (pageScroll.ts):
    // at the top snap it scrolls there; lower, the sheet rises first and the
    // scroll follows once it rests (tryScrollBack).
    const pageBox = useRef<View>(null);
    const scrollToAnchor = useCallback(
      (anchor: View | null) =>
        scrollAnchorIn(pageBox.current, anchor, 16, (y) => {
          if (Math.round(animatedIndex.get()) >= 2) {
            scrollRef.current?.scrollTo({ y, animated: true });
            return;
          }
          pendingScroll.current = y;
          resting.current = false;
          sheetRef.current?.snapToIndex(2);
        }),
      [animatedIndex],
    );
    const scroller = useMemo(() => ({ scrollToAnchor }), [scrollToAnchor]);
    const [isPage, setIsPage] = useState(false);
    const top = shown[shown.length - 1];
    const nested = shown.length > 1;
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
    // The state itself changes once the sheet has stopped moving (0572): set
    // mid-drag, its render (status bar, backdrop, the map screen hiding its
    // tree from TalkBack) cost frames of 50-66 ms when a slow drag left the
    // top. The reaction only notes it; a short poll waits for the sheet to rest.
    const pageNow = useRef(false);
    const pagePoll = useRef<ReturnType<typeof setInterval> | null>(null);
    const onTop = useCallback(
      (atTop: boolean) => {
        pageNow.current = pageCapable && atTop;
        if (pagePoll.current) return;
        let last = animatedIndex.get();
        pagePoll.current = setInterval(() => {
          const now = animatedIndex.get();
          if (Math.abs(now - last) < 0.002) {
            if (pagePoll.current) clearInterval(pagePoll.current);
            pagePoll.current = null;
            setIsPage(pageNow.current);
          }
          last = now;
        }, 120);
      },
      [pageCapable, animatedIndex],
    );
    useEffect(
      () => () => {
        if (pagePoll.current) clearInterval(pagePoll.current);
      },
      [],
    );
    // Not on the reaction's first run (prev null): the sheet opens below the
    // top, and a same-value set state still rendered the whole sheet once
    // more (about 50 ms of JS in the open, measured 2026-11-11).
    useAnimatedReaction(
      () => atPageTop(animatedIndex.value),
      (atTop, prev) => {
        if (prev !== null && atTop !== prev) runOnJS(onTop)(atTop);
      },
      [onTop],
    );

    useImperativeHandle(ref, () => ({
      collapse: () => sheetRef.current?.snapToIndex(1),
    }));

    // The stages (sheetStage.ts): the item the sheet has come to rest with,
    // and the item whose lower part may mount.
    const [settledKey, setSettledKey] = useState<string | null>(null);
    const [restKey, setRestKey] = useState<string | null>(null);
    const rootKeyRef = useRef(rootKey);
    useEffect(() => {
      rootKeyRef.current = rootKey;
    }, [rootKey]);

    // Down and closed: drop the content and the stages, so the next open
    // mounts only what its peek shows (even for the same item again).
    // The wrapper is remounted too (a new key), already hidden from the
    // screen reader: on Android, switching a mounted wrapper's
    // importantForAccessibility to "no-hide-descendants" stopped every press
    // in the app (the browse sheet's "Vis kart", cards, the tab bar) while
    // drags still worked; a wrapper mounted hidden leaves them alone (0413,
    // regression from 0384).
    const [generation, setGeneration] = useState(0);
    const a11yHidden = !open && shown.length === 0;
    const clearShown = useCallback(() => {
      if (openRef.current) return;
      setShown(NO_STACK);
      setSettledKey(null);
      setRestKey(null);
      if (!openedRef.current) return;
      openedRef.current = false;
      setGeneration((g) => g + 1);
    }, []);

    // Open → animate to the requested snap; closed → slide down. `openNonce`
    // is in the deps so EVERY tap re-snaps the sheet open. A new item while
    // the sheet already rests at that snap (a tap on another pin at the peek,
    // user 2026-11-11: "stay up, swap content") has nothing to animate, so
    // no snap event comes: it is at rest once FadeSwap has faded it in.
    const wasOpen = useRef(false);
    useEffect(() => {
      if (!open) {
        wasOpen.current = false;
        // Pulled down (already at -1): no further snap event will come.
        if (animatedIndex.value <= -0.99) {
          const t = setTimeout(clearShown, 0);
          return () => clearTimeout(t);
        }
        sheetRef.current?.close(closeConfig);
        return;
      }
      const resting =
        wasOpen.current && Math.abs(animatedIndex.value - openIndex) < 0.01;
      wasOpen.current = true;
      sheetRef.current?.snapToIndex(openIndex, openConfig);
      if (!resting) return;
      const key = rootKeyRef.current;
      const t = setTimeout(() => setSettledKey(key), STAGE_SWAP_MS);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, rootKey, openNonce]);

    useEffect(() => {
      onPageChange?.(isPage);
    }, [isPage, onPageChange]);

    // R3a + 0381: a page opens with what the peek shows; the title block and
    // first rows mount once the sheet has come to rest at a snap (onChange),
    // or after STAGE_FALLBACK_MS should no snap event come; the rest a
    // moment later. Pushed views render everything (the sheet is open).
    const handleSnap = useCallback(
      (i: number) => {
        if (i >= 0) {
          setSettledKey(rootKeyRef.current);
          resting.current = true;
          tryScrollBack();
        } else {
          scrollY.current = 0;
          setRestore(null);
          clearShown();
        }
      },
      [clearShown, tryScrollBack],
    );
    useEffect(() => {
      if (!open) return;
      const key = rootKey;
      const t = setTimeout(() => setSettledKey(key), STAGE_FALLBACK_MS);
      return () => clearTimeout(t);
    }, [open, rootKey]);
    useEffect(() => {
      if (settledKey === null || settledKey !== rootKey) return;
      if (restKey === settledKey) return;
      const key = settledKey;
      const t = setTimeout(() => setRestKey(key), STAGE_REST_DELAY_MS);
      return () => clearTimeout(t);
    }, [settledKey, restKey, rootKey]);
    const stage = sheetStage({ nested, rootKey, settledKey, restKey });

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

    // The host view for an experience the viewer hosts (0464), through a ref
    // so renderFooter keeps its identity whatever push the parent passes.
    const pushRef = useRef(push);
    useEffect(() => {
      pushRef.current = push;
    }, [push]);

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
              onManage={() => pushRef.current({ kind: "host", id: footerId })}
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

    // Under the full-screen page the backdrop has nothing to show or catch,
    // and Android still read its labelled full-screen «Lukk» before the page
    // (phone sweep 2026-11-26), so it is silent while the page is up. It stays
    // mounted: mounting it as a slow drag left the top dropped frames (0572).
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={1}
          disappearsOnIndex={0}
          pressBehavior="close"
          // Starts letting taps through (gorhom's default starts catching
          // them until its first reaction): the closed sheet remounts each
          // time the map comes back into focus (0384).
          enableTouchThrough
          {...(isPage ? BACKDROP_SILENT : backdropA11y)}
        />
      ),
      [isPage],
    );

    // Header: the experience page shows only ✕ in sheet mode and fades it out
    // as the page top bar slides in over it; pushed views keep back + title and move
    // below the status bar at the top snap.
    // Room for the sheet header, and at the top for the page top bar that
    // covers it (PageTopBar), so the content starts at the same place.
    const pageHeaderH = Math.max(64, topPad + PAGE_BAR_ROW);
    const headerStyle = useAnimatedStyle(() => {
      if (!pageCapable) return {};
      const t = interpolate(
        animatedIndex.value,
        [PAGE_FROM, PAGE_SNAP],
        [0, 1],
        Extrapolation.CLAMP,
      );
      // The header is gone before the page top bar fades in (0461: both at
      // once read as two stacked headers on the way up).
      const fade = interpolate(
        animatedIndex.value,
        [PAGE_FROM, PAGE_SWAP],
        [1, 0],
        Extrapolation.CLAMP,
      );
      // Always set every key: Reanimated keeps a prop that a later style
      // object leaves out (a pushed view kept maxHeight 0 and vanished).
      // A page's header keeps one height and only fades (0572): its height
      // shrinking with the drag relaid the sheet out every frame and dropped
      // frames between 1.7 and the top; the page top bar slides over it.
      return topIsPage
        ? {
            height: pageHeaderH,
            maxHeight: pageHeaderH,
            opacity: fade,
            paddingTop: 0,
          }
        : {
            height: "auto",
            maxHeight: 200,
            opacity: 1,
            paddingTop: topPad * t,
          };
    }, [pageCapable, topIsPage, topPad, pageHeaderH]);

    const sheet = (
      // Closed, the waiting sheet is out of the screen reader's way too.
      <View
        key={generation}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
        // Never switched on a mounted wrapper (see clearShown): visible from
        // the first open until it is down and cleared.
        importantForAccessibility={a11yHidden ? "no-hide-descendants" : "auto"}
        accessibilityElementsHidden={a11yHidden}
      >
        {isPage ? <StatusBarStyle style="auto" /> : null}
        <BottomSheet
          ref={sheetRef}
          // Closed it waits at -1; a group's docked sheet mounts already at
          // the requested snap.
          index={open ? (restore?.index ?? openIndex) : -1}
          snapPoints={snapPoints}
          animatedIndex={animatedIndex}
          animationConfigs={SHEET_SPRING}
          enableDynamicSizing={false}
          enablePanDownToClose
          onChange={handleSnap}
          backdropComponent={renderBackdrop}
          // The floating card shows on the full-screen page only: it mounts
          // once the sheet has come to rest, not in the open (0381).
          footerComponent={footerId && stage >= 1 ? renderFooter : undefined}
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
                // Under the page top bar it has faded out: no stray taps.
                renderToHardwareTextureAndroid
                pointerEvents={isPage && topIsPage ? "none" : "auto"}
                style={[
                  { paddingHorizontal: gutterPx, overflow: "hidden" },
                  headerStyle,
                ]}
              >
                <View className="pb-2">
                  <SheetHeader
                    title={topIsPage ? undefined : titleFor(top)}
                    // What the item is, top left (user 2026-11-11); the
                    // page top bar's caption takes over at the top snap.
                    label={pageInfo?.typeLabel}
                    // Its pin, in its colour, beside it (the map has no
                    // colour key; user 2026-11-11).
                    labelIcon={pageInfo ? <MiniPin target={top} /> : null}
                    onBack={nested ? onBack : undefined}
                    onClose={onClose}
                    actions={pageInfo ? <ShareSave info={pageInfo} /> : null}
                  />
                </View>
              </Animated.View>
              <BottomSheetScrollView
                ref={scrollRef}
                contentContainerClassName={`gap-4 px-6 pt-4 ${footerId ? "pb-36" : "pb-16"}`}
                keyboardShouldPersistTaps="handled"
                onScrollEndDrag={keepScrollY}
                onMomentumScrollEnd={keepScrollY}
                onContentSizeChange={scrollBack}
              >
                {/* In-sheet push/back fades the new content in (was one frame). */}
                <FadeSwap swapKey={`${top.kind}:${top.id}`}>
                  <SheetStageContext.Provider value={stage}>
                    <PageScrollContext.Provider value={scroller}>
                      <View ref={pageBox}>
                        <DetailContent target={top} push={push} />
                      </View>
                    </PageScrollContext.Provider>
                  </SheetStageContext.Provider>
                </FadeSwap>
              </BottomSheetScrollView>
            </>
          ) : (
            <View />
          )}
        </BottomSheet>
      </View>
    );
    // Experiences and places: a sheet at the app root, above the tab bar, only
    // while the map is the focused screen.
    if (!pageCapable) return sheet;
    return focused ? <RootPortal>{sheet}</RootPortal> : null;
  }),
);

// Android 11 and older (phone check 2026-11-26, the Huawei phone on API 29,
// reproduced on an API 29 emulator): changing this background's corner radius
// once the sheet was up, animated or in one React update, left the views drawn
// over it unpainted (the page's top bar never showed; text and icons further
// down went blank after a fling). There the corners keep their radius; at the
// page snap they sit under the status bar.
const FIXED_CORNERS =
  Platform.OS === "android" && (Platform.Version as number) < 31;

// Sheet background whose top corners square off on the way to the page snap.
function PageBackground({ style, animatedIndex }: BottomSheetBackgroundProps) {
  const elev = useElevation();
  const c = useThemeColors();
  const chrome = useSheetChrome();
  const radius =
    (chrome.backgroundStyle.borderTopLeftRadius as number | undefined) ?? 32;
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
      style={[
        style,
        { backgroundColor: c.surface },
        elev.e3,
        FIXED_CORNERS ? null : a,
      ]}
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
    // Fades in only once the sheet header has faded out (0461).
    const o = interpolate(
      animatedIndex.value,
      [PAGE_SWAP, PAGE_SNAP],
      [0, 1],
      Extrapolation.CLAMP,
    );
    // Slides down over the sheet header instead of growing (0572): a height
    // animated with the drag relaid the sheet out every frame.
    return { opacity: o, transform: [{ translateY: -full * (1 - t) }] };
  }, [full]);
  // Clipped to its own box at the top of the sheet: unclipped, the bar slid
  // up out of the sheet and showed over the map on the way down.
  return (
    <View
      pointerEvents={interactive ? "box-none" : "none"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: full,
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      <Animated.View style={a} renderToHardwareTextureAndroid>
        <View
          className="flex-row items-center gap-1 border-b border-line bg-surface px-2"
          style={{ paddingTop: topPad, height: full }}
        >
          <View className="flex-1 flex-row">
            <IconButton icon={BACK_ICON} label="Tilbake" onPress={onBack} />
          </View>
          <Text
            variant="caption"
            weight="semibold"
            tone="muted"
            className="text-center"
            style={{ flex: 2 }}
            numberOfLines={1}
          >
            {info.caption}
          </Text>
          <View className="flex-1 flex-row justify-end">
            <ShareSave info={info} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
