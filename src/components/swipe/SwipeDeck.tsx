import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  type PanGesture,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { Icon, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { Sheet } from "@/components/Sheet";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { EmptyState } from "@/components/states/StateView";
import { chatForExperience, type MockExperience } from "@/fixtures";
import { showToastAfterSheet } from "@/components/Toast";
import { confirmToast } from "@/copy";
import { useNotificationReads } from "@/hooks/useNotificationReads";
import { markViewed } from "@/components/map/hooks/useRecentlyViewed";
import { haptics } from "@/lib/haptics";
import { joinChat } from "@/lib/joinedChats";
import { motion, useThemeColors, media } from "@/theme";

import { decideCommit, rotationFor, type SwipeAction } from "./deckLogic";
import { PlaceDeck } from "./PlaceDeck";
import { SwipeActions } from "./SwipeActions";
import { SwipeCard, SWIPE_CONTENT_BOTTOM } from "./SwipeCard";
import { SwipeFilterBar, type SwipeMode } from "./SwipeFilterBar";
import {
  applySwipeFilters,
  DEFAULT_SWIPE_FILTERS,
  SwipeFilterSheet,
  type SwipeFilters,
} from "./SwipeFilterSheet";
import { useSwipeDeck } from "./useSwipeDeck";
import { Illustration } from "@/components/illustrations/Illustration";

const G = motion.gesture;

// The Tinder-style swipe deck: a full-bleed 3-card stack with a velocity-
// committing pan, clamped swing rotation, drag stamps, haptics, one-level undo,
// a top filter bar and an in-place scroll detail (reusing the map's detail
// rendering). Left = Hopp over, right = Bli med, up = Lagre (save). All local
// state (BLOCKED_CONTRACT_GAP).
export function SwipeDeck() {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  // ── Audience mode tabs ──
  // PDF p7: For deg · Opplevelser · Steder. "For deg" is a non-personalized
  // shell (DEMO_MODES rule) over the experience deck: no invented ranking
  // (BLOCKED_CONTRACT_GAP). "Steder" (place cards) is
  // not built yet and shows an honest empty state. Local filtering
  // (tags/when/availability) lives in the Filtre sheet.
  const [filters, setFilters] = useState<SwipeFilters>(DEFAULT_SWIPE_FILTERS);
  const mode = filters.mode;
  const setMode = (m: SwipeMode) => setFilters((f) => ({ ...f, mode: m }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { unread: unreadNotifs } = useNotificationReads();

  const filterKey = JSON.stringify(filters);
  const filter = useMemo(
    () => (e: MockExperience) => applySwipeFilters([e], filters).length === 1,
    [filterKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deck = useSwipeDeck({ filter, filterKey });
  const reduced = useReducedMotion();
  const { isGuest } = useGuestMode();
  const [size, setSize] = useState({ w: screenW, h: screenH });
  // When a guest tries an account-only action (join/save), we show the sign-in
  // prompt instead of committing. `nope` (pass), share and undo stay open.
  const [signInFor, setSignInFor] = useState<string | null>(null);
  const [joinChatFor, setJoinChatFor] = useState<MockExperience | null>(null);
  const [placesDone, setPlacesDone] = useState(false);
  // Guards a second commit while a card is still flying off (F3) — without it a
  // rapid second drag clobbers the in-flight exit and strands/double-advances.
  const [busy, setBusy] = useState(false);
  // Bumped after the outgoing card has flown off and the deck advanced, so the
  // layout effect reveals + recenters the newly-promoted top card before paint.
  const [commitNonce, setCommitNonce] = useState(0);
  // R27 (Phase 10 open item): a button tap made while a card is still flying
  // off is queued (latest wins) and replayed once the next card is in place,
  // instead of being dropped. Drags stay locked during the glide.
  const pendingTap = useSharedValue<SwipeAction | null>(null);
  const commitRef = useRef<(a: SwipeAction) => void>(() => {});
  // Measured top Y of the top card's info block → pins the expand arrow to the
  // actual title row instead of a brittle magic offset (F11).
  const [arrowY, setArrowY] = useState<number | null>(null);

  // Preload only the photos that can appear next — the current card and the
  // two behind it (H0b) — instead of blocking the first paint on decoding
  // every card's images (F10). The deck renders immediately; PhotoCarousel
  // paints each photo's blurred preview until the file has decoded.
  useEffect(() => {
    const mods = deck.window
      .slice(0, 3)
      .flatMap((e) => e.photos) as unknown as number[];
    if (mods.length) Asset.loadAsync(mods).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.index, filterKey]);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const crossed = useSharedValue(0);
  // Opacity of the LIVE top card: the committed card flies off on tx/ty, the done
  // worklet hides it (op=0) as the deck advances, and the layout effect reveals the
  // newly-promoted card (op=1) before paint.
  const op = useSharedValue(1);

  // Advance after the outgoing card has left: swap the deck, release the commit
  // lock, then bump the nonce so the layout effect reveals + recenters the incoming
  // card before paint.
  const advance = (action: SwipeAction) => {
    deck.commit(action);
    setBusy(false);
    setCommitNonce((n) => n + 1);
  };

  // Commit a swipe by flying the LIVE top card off on tx/ty (sequential: the card
  // leaves, revealing the full-size next card already seated underneath, and only
  // THEN is it promoted), advancing on completion. Keeps the unhurried eased glide.
  // `busy` locks out a second commit while one is in flight (F3). A tap passes no
  // velocity (fly-off from center); a gesture release passes its velocity so a
  // fling shortens the glide a little. Reduced → a fade. Login is a DEMO.
  const commit = (action: SwipeAction, vx = 0, vy = 0) => {
    const card = deck.current;
    if (!card) return;
    if (busy) {
      if (vx === 0 && vy === 0) pendingTap.value = action;
      return;
    }
    // Account gate (honest guest restriction) — join/save need an account; pass
    // is free. Spring the drag back so a *dragged* like/save settles instead of
    // stranding the card behind the sign-in sheet (F1).
    if (isGuest && (action === "like" || action === "save")) {
      setSignInFor(action === "like" ? "bli med" : "lagre");
      tx.value = withSpring(0, motion.spring.card);
      ty.value = withSpring(0, motion.spring.card);
      return;
    }
    haptics.light();
    setBusy(true);
    // PDF p8: a like (♥ / right swipe) offers "Bli med i samtalen" — joining
    // the experience's chat is a separate, explicit step.
    if (action === "like") setJoinChatFor(card);

    if (reduced) {
      op.value = withTiming(0, { duration: motion.duration.fast }, (fin) => {
        "worklet";
        if (fin) runOnJS(advance)(action);
      });
      return;
    }
    // Eased glide, faster flings shorter. Phase 10 reaction lens: the old
    // 560–720 ms glide settled after ~0.9 s and swallowed taps meanwhile, so
    // it is 340–460 ms now (still a glide, not a snap). Fly fully past the
    // edge so the rotated far corner clears too; then hide the card and advance.
    const dur = Math.min(
      460,
      Math.max(340, 460 - Math.max(Math.abs(vx), Math.abs(vy)) / 16),
    );
    const easing = Easing.out(Easing.cubic);
    const done = (fin?: boolean) => {
      "worklet";
      if (fin) {
        op.value = 0;
        tx.value = 0;
        ty.value = 0;
        runOnJS(advance)(action);
      }
    };
    if (action === "save") {
      ty.value = withTiming(-1.3 * screenH, { duration: dur, easing }, done);
    } else {
      tx.value = withTiming(
        (action === "like" ? 1 : -1) * 1.6 * screenW,
        { duration: dur, easing },
        done,
      );
    }
  };

  const undo = () => {
    const action = deck.lastAction;
    if (!action || busy) return;
    pendingTap.value = null;
    haptics.selection();
    if (reduced) {
      deck.undo();
      return;
    }
    // Restore the card off-screen on the side it exited, then glide it back in at
    // the same unhurried pace as the exit (eased, not a quick spring).
    if (action === "save") ty.value = -1.3 * screenH;
    else tx.value = (action === "like" ? 1 : -1) * 1.6 * screenW;
    deck.undo();
    const back = { duration: 400, easing: Easing.out(Easing.cubic) };
    tx.value = withTiming(0, back);
    ty.value = withTiming(0, back);
  };

  const pan = Gesture.Pan()
    .enabled(!deck.done && !busy)
    .activeOffsetX([-12, 12])
    .activeOffsetY([-12, 12])
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * G.swipeVertDamp;
      const over =
        Math.abs(tx.value) > size.w * G.swipeCommitRatio ||
        -ty.value > size.h * G.swipeVertCommitRatio;
      if (over && crossed.value === 0) {
        crossed.value = 1;
        runOnJS(haptics.selection)();
      } else if (!over && crossed.value === 1) {
        crossed.value = 0;
      }
    })
    .onEnd((e) => {
      crossed.value = 0;
      const action = decideCommit(
        {
          dx: tx.value,
          dy: ty.value,
          vx: e.velocityX,
          vy: e.velocityY * G.swipeVertDamp,
          w: size.w,
          h: size.h,
        },
        {
          commitRatio: G.swipeCommitRatio,
          vertCommitRatio: G.swipeVertCommitRatio,
          velocity: G.swipeVelocity,
        },
      );
      if (!action) {
        tx.value = withSpring(0, motion.spring.card);
        ty.value = withSpring(0, motion.spring.card);
        return;
      }
      // The live top card is already at tx/ty — just continue it off from here.
      runOnJS(commit)(action, e.velocityX, e.velocityY);
    });

  // After the deck advances, reveal + recenter the newly-promoted top card before
  // paint — `op` was driven to 0 as the outgoing card left, and tx/ty were zeroed
  // in the done worklet. `advance` bumps the nonce; undo drives tx/ty itself and
  // never bumps it. (Shared-value writes only — no setState in the effect.)
  useLayoutEffect(() => {
    if (commitNonce === 0) return;
    op.value = 1;
    tx.value = 0;
    ty.value = 0;
    // Replay a queued tap on the card that just arrived (R27).
    const queued = pendingTap.value;
    if (queued) {
      pendingTap.value = null;
      setTimeout(() => commitRef.current(queued), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitNonce]);
  // Keep the replay pointed at the latest commit (fresh deck and busy).
  useLayoutEffect(() => {
    commitRef.current = (a) => commit(a);
  });

  // Web keyboard alternative: ← nope, → like, ↑ save, Backspace undo.
  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      deck.done ||
      mode === "places" ||
      joinChatFor !== null
    )
      return;
    const onKey = (ev: KeyboardEvent) => {
      if (busy) return;
      if (ev.key === "ArrowLeft") commit("nope");
      else if (ev.key === "ArrowRight") commit("like");
      else if (ev.key === "ArrowUp") commit("save");
      else if (ev.key === "Backspace") undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.done, deck.index, reduced, busy, mode, joinChatFor]);

  // Render behind→front so the top card (slot 0) sits on top.
  const slots = deck.window.map((exp, n) => ({ exp, n })).reverse();

  return (
    <>
      <View className="flex-1 bg-ink">
        {mode === "places" ? (
          <PlaceDeck onExhausted={setPlacesDone} />
        ) : deck.done ? (
          // PDF p8 "Du har sett alt for nå" — light screen, two actions.
          <View
            className="flex-1 justify-center bg-background"
            style={{ paddingTop: insets.top }}
          >
            {deck.deck.length === 0 ? (
              <EmptyState
                icon="albums-outline"
                title="Ingen treff"
                message="Ingen opplevelser passer filtrene dine. Prøv andre filtre."
                actionLabel="Nullstill filtre"
                onAction={() => setFilters(DEFAULT_SWIPE_FILTERS)}
                secondaryLabel="Utforsk kartet"
                onSecondary={() => router.navigate("/map")}
              />
            ) : (
              <EmptyState
                icon="albums-outline"
                illustration={<Illustration name="emptyDeck" />}
                title="Du har sett alt for nå"
                message="Prøv andre filtre, eller se på kartet."
                actionLabel="Endre filtre"
                onAction={() => setFiltersOpen(true)}
                secondaryLabel="Se kortene igjen"
                onSecondary={deck.restart}
              />
            )}
          </View>
        ) : (
          <View
            style={StyleSheet.absoluteFill}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setSize({ w: width, h: height });
            }}
          >
            {slots.map(({ exp, n }) =>
              n === 0 ? (
                <TopCard
                  key={exp.id}
                  exp={exp}
                  pan={pan}
                  tx={tx}
                  ty={ty}
                  op={op}
                  w={size.w}
                  h={size.h}
                  reduced={reduced}
                  arrowY={arrowY}
                  onInfoTop={setArrowY}
                  onExpand={() => {
                    markViewed({
                      kind: "experience",
                      id: exp.id,
                      title: exp.title,
                    });
                    // The full page is a route (Phase 12 H4c); the deck keeps
                    // its place underneath while it is open.
                    router.push(`/experience/${exp.id}` as Href);
                  }}
                />
              ) : (
                // The immediate next card (n===1) renders its FULL content so it is
                // already complete underneath the top card — when the top card
                // swipes off, the finished card is revealed with no info/gradient
                // pop-in. The deeper card (n===2) stays minimal (fully occluded, so
                // its overlays would be pure overdraw — F10).
                <BehindCard key={exp.id} exp={exp} ready={n === 1} />
              ),
            )}

            {/* Bottom action row — overlaid on the card's bottom gradient. */}
            <View
              pointerEvents="box-none"
              className="absolute inset-x-0 bottom-0"
              style={{
                // Sit the discs low, just above the tab bar (K1) — the reference
                // stacks the actions near the nav, not floating high.
                paddingBottom: Math.max(insets.bottom, 2),
                // Above the card stack (whose top card carries zIndex) so the
                // action row is always visible, as in the reference.
                zIndex: 30,
                elevation: 30,
              }}
            >
              <SwipeActions
                canUndo={deck.canUndo}
                saved={
                  deck.current
                    ? deck.isSaved(deck.savedKeyFor(deck.current))
                    : false
                }
                onUndo={undo}
                onNope={() => commit("nope")}
                onSave={() => commit("save")}
                onLike={() => commit("like")}
                onShare={() => {
                  // Local OS share of the current experience's title. No backend —
                  // just the device share sheet with mock-fixture text, so it is a
                  // real, honest action (not a faked server success).
                  const c = deck.current;
                  if (!c) return;
                  void Share.share({
                    message: `${c.title} — ThirdPlace`,
                  }).catch(() => {});
                }}
                tx={tx}
                ty={ty}
                w={size.w}
                h={size.h}
                reduced={reduced}
              />
            </View>
          </View>
        )}

        {/* Top filter bar — overlaid, with its own status-bar inset. Sits above
          the card stack (whose top card/expand button carry zIndex) so the
          mode tabs stay visible, as in the reference. */}
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 top-0"
          style={{ paddingTop: insets.top + 4, zIndex: 30, elevation: 30 }}
        >
          <SwipeFilterBar
            mode={mode}
            onSelectMode={setMode}
            onOpenFilters={() => setFiltersOpen(true)}
            filterActive={
              filters.tags.length > 0 ||
              filters.when !== null ||
              filters.hasSpots
            }
            onOpenNotifications={() => router.push("/notifications" as Href)}
            unreadCount={unreadNotifs}
            onLight={mode === "places" ? placesDone : deck.done}
            onOpenGroup={() => router.push("/group-swipe")}
          />
        </View>

        {/* Filtre — looks like the map's Filtre sheet (muted sheet, white Section
          cards, "Fjern alt + Vis N" footer), carrying the swipe's own modes +
          interests plus the data-backed Når/availability facets. */}
        <SwipeFilterSheet
          visible={filtersOpen}
          value={filters}
          onClose={() => setFiltersOpen(false)}
          onApply={setFilters}
        />

        {/* Notifications — the same demo sheet the map uses (bell in the top bar). */}

        <JoinChatSheet exp={joinChatFor} onClose={() => setJoinChatFor(null)} />

        {/* Account gate for guest join/save (also used by the detail's CTAs). */}
        <SignInPrompt
          visible={signInFor !== null}
          action={signInFor ?? "fortsette"}
          onClose={() => setSignInFor(null)}
        />
      </View>
    </>
  );
}

function TopCard({
  exp,
  pan,
  tx,
  ty,
  op,
  w,
  h,
  reduced,
  arrowY,
  onInfoTop,
  onExpand,
}: {
  exp: MockExperience;
  pan: PanGesture;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  op: SharedValue<number>;
  w: number;
  h: number;
  reduced: boolean;
  arrowY: number | null;
  onInfoTop: (y: number) => void;
  onExpand: () => void;
}) {
  // No entrance scale: the next card already sits full-size underneath (BehindCard
  // renders at scale 1), so when it is promoted it is simply already there — no
  // grow-in/pop. Only the swipe translate + swing rotation animate. `op` is the
  // live-card opacity: it flies off on tx/ty, is hidden (op=0) as the deck swaps,
  // then the next card is revealed (op=1) before paint.
  const style = useAnimatedStyle(() => ({
    zIndex: 10,
    opacity: op.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      {
        rotateZ: reduced
          ? "0deg"
          : `${rotationFor(tx.value, w, G.swipeMaxRotateDeg)}deg`,
      },
    ],
  }));
  // The chevron sits OUTSIDE the GestureDetector (box-none container) so its tap
  // reaches onPress — on web a Pan gesture swallows taps on its own children.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transformOrigin: CARD_PIVOT },
            style,
          ]}
        >
          <SwipeCard exp={exp} interactive onInfoTop={onInfoTop} />
          {reduced ? null : <Wash tx={tx} ty={ty} w={w} h={h} />}
          <Stamps tx={tx} ty={ty} w={w} h={h} reduced={reduced} />
        </Animated.View>
      </GestureDetector>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Vis mer om opplevelsen"
        onPress={onExpand}
        style={{
          position: "absolute",
          // Pin the arrow to the ACTUAL title row: SwipeCard reports the info
          // block's measured top Y (F11). Fall back to the old fixed offset until
          // the first onLayout lands.
          ...(arrowY != null
            ? { top: arrowY }
            : { bottom: SWIPE_CONTENT_BOTTOM + 128 }),
          right: 16,
          height: 36,
          width: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: media.scrimStrong,
          // Above the card's info overlay (which lives in the z-10 gesture
          // layer) so the tap lands on the arrow, not the text behind it.
          zIndex: 20,
        }}
      >
        {/* "i" in a dark circle opens the full page (founder 2026-11-06: no
            arrows on buttons). */}
        <Icon name="information" size="md" tone="onMedia" />
      </Pressable>
    </View>
  );
}

// Pivot for the top card's swing rotation — a low hinge so the card levers from
// near its base (the reference pivots low, not around the center).
const CARD_PIVOT = "50% 80%";

function BehindCard({ exp, ready }: { exp: MockExperience; ready: boolean }) {
  // The next card sits FULL-SIZE directly under the top card (no peek/scale/fade),
  // so when the top card leaves it is simply already there — a seamless 1:1 swap
  // with no grow-in. `ready` (the immediate next card) renders its FULL content
  // (gradients, info block, badge) so it is complete the instant it is revealed,
  // with no pop-in; a deeper, fully-occluded card renders the cover photo only to
  // avoid pure overdraw (F10). Non-interactive either way (photo 0, no stepping).
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SwipeCard exp={exp} interactive={false} minimal={!ready} />
    </View>
  );
}

// Directional colour wash over the top card while dragging — a whole-card tint
// that deepens toward the commit threshold (the reference tints the card as you
// swing it), reinforcing the corner glyph stamps. Join = ember, skip = ink,
// save = light. Capped well below opaque so the photo + name stay legible.
// Not rendered under reduced motion.
const WASH_MAX = 0.26;

function Wash({
  tx,
  ty,
  w,
  h,
}: {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  w: number;
  h: number;
}) {
  const colors = useThemeColors();
  const vDenom = (h > 0 ? h : 480) * G.swipeVertCommitRatio;
  const hDenom = (w > 0 ? w : 360) * G.swipeCommitRatio;
  const likeW = useAnimatedStyle(() => ({
    opacity: WASH_MAX * Math.min(1, Math.max(0, tx.value) / hDenom),
  }));
  const nopeW = useAnimatedStyle(() => ({
    opacity: WASH_MAX * Math.min(1, Math.max(0, -tx.value) / hDenom),
  }));
  const saveW = useAnimatedStyle(() => ({
    opacity: WASH_MAX * Math.min(1, Math.max(0, -ty.value) / vDenom),
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.ember, opacity: 0 },
          likeW,
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: media.black, opacity: 0 },
          nopeW,
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: media.onMedia, opacity: 0 },
          saveW,
        ]}
      />
    </View>
  );
}

// Drag stamps on the top card. `h` is the card height used for the up/save scale.
// Big centered glyphs that fade (and grow) in with the drag, mirroring the
// reference's large X / heart feedback — a giant X on a nope drag, a heart on a
// like drag, a bookmark on an up (save) drag. A soft shadow keeps them legible
// over bright photos.
const STAMP_SIZE = 132;
const stampShadow = {
  textShadowColor: media.textShadow,
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 12,
} as const;

function Stamps({
  tx,
  ty,
  w,
  h,
  reduced,
}: {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  w: number;
  h: number;
  reduced: boolean;
}) {
  const colors = useThemeColors();
  const vDenom = (h > 0 ? h : 480) * G.swipeVertCommitRatio;
  const topY = (h > 0 ? h : 760) * 0.13; // stamps sit high, under the top bar
  // Each glyph fades in with the drag ratio and eases up to full size as it
  // approaches the commit threshold, so the feedback reads before release. Per
  // the reference each stamp sits in its OWN corner — like at top-left, nope at
  // top-right, save at bottom-center — not all stacked in the middle. Under
  // reduced motion the glyph still fades in but does not scale (F12).
  const like = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, tx.value / (w * G.swipeCommitRatio)));
    return { opacity: p, transform: [{ scale: reduced ? 1 : 0.8 + 0.2 * p }] };
  });
  const nope = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, -tx.value / (w * G.swipeCommitRatio)));
    return { opacity: p, transform: [{ scale: reduced ? 1 : 0.8 + 0.2 * p }] };
  });
  const save = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, -ty.value / vDenom));
    return { opacity: p, transform: [{ scale: reduced ? 1 : 0.8 + 0.2 * p }] };
  });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* LIKE — top-left */}
      <Animated.View
        style={[
          { position: "absolute", top: topY, left: 24, opacity: 0 },
          like,
        ]}
      >
        {/* raw-icon: swipe stamp at display size with a text shadow */}
        <Ionicons
          name="heart"
          size={STAMP_SIZE}
          color={colors.ember}
          style={stampShadow}
        />
      </Animated.View>
      {/* NOPE — top-right */}
      <Animated.View
        style={[
          { position: "absolute", top: topY, right: 24, opacity: 0 },
          nope,
        ]}
      >
        {/* raw-icon: swipe stamp at display size with a text shadow */}
        <Ionicons
          name="close"
          size={STAMP_SIZE + 24}
          color={media.onMedia}
          style={stampShadow}
        />
      </Animated.View>
      {/* SAVE — dead-center of the card (middle of the screen), in the clear
          photo area so it never covers the name/meta/actions at the bottom. */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
          },
          save,
        ]}
      >
        {/* raw-icon: swipe stamp at display size with a text shadow */}
        <Ionicons
          name="bookmark"
          size={STAMP_SIZE - 20}
          color={media.onMedia}
          style={stampShadow}
        />
      </Animated.View>
    </View>
  );
}

// "Bli med i samtalen" (PDF p8): after a like, offer the experience's chat.
// "Bli med i chatten" opens the experience chat when the fixtures have one,
// else confirms. The PDF's "N personer snakker …" count is left out (no real
// social proof). BLOCKED_CONTRACT_GAP: no chat membership contract.
function JoinChatSheet({
  exp,
  onClose,
}: {
  exp: MockExperience | null;
  onClose: () => void;
}) {
  const close = onClose;
  const join = () => {
    if (!exp) return;
    const chat = chatForExperience(exp.id);
    onClose();
    haptics.light();
    if (chat) {
      joinChat(chat.id);
      setTimeout(() => router.push(`/chat/${chat.id}`), 260);
    } else {
      showToastAfterSheet(confirmToast.joinedChat);
    }
  };
  return (
    <Sheet visible={exp !== null} onClose={close} title="Bli med i samtalen">
      {exp ? (
        <View className="gap-3">
          <Text variant="body" weight="semibold">
            {exp.title}
          </Text>
          <Text variant="caption" tone="muted">
            {exp.when}
          </Text>
          {/* PDF p8 line "Chat er gratis — billett kjøper du når du vil." is
              left out: it states a payment rule (CLAUDE.md governance). */}

          <Button label="Bli med i chatten" variant="ink" onPress={join} />
          <Button label="Avbryt" variant="secondary" onPress={close} />
        </View>
      ) : null}
    </Sheet>
  );
}
