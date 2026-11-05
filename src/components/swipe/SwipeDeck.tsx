import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { StatusBar } from "expo-status-bar";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
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

import { Icon, IconButton } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoBadge } from "@/components/DemoBadge";
import { DemoNote } from "@/components/DemoNote";
import { Sheet } from "@/components/Sheet";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { markerId } from "@/components/map/types/mapPresentation";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { EmptyState } from "@/components/states/StateView";
import { MOCK_NOTIFICATIONS, places, type MockExperience } from "@/fixtures";
import { haptics } from "@/lib/haptics";
import { motion, useThemeColors, media } from "@/theme";

import { experienceAvailability } from "./availability";
import { decideCommit, rotationFor, type SwipeAction } from "./deckLogic";
import { PhotoCarousel } from "./PhotoCarousel";
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

const G = motion.gesture;

// The Tinder-style swipe deck: a full-bleed 3-card stack with a velocity-
// committing pan, clamped swing rotation, drag stamps, haptics, one-level undo,
// a top filter bar and an in-place scroll detail (reusing the map's detail
// rendering). Left = Hopp over, right = Bli med, up = Lagre (save). All local
// demo state (BLOCKED_CONTRACT_GAP); every card carries a DemoBadge.
export function SwipeDeck() {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  // ── Audience mode tabs ──
  // PDF p7: For deg · Opplevelser · Steder. "For deg" is a non-personalized
  // demo shell (DEMO_MODES rule) over the experience deck — marked with a demo
  // note, no invented ranking (BLOCKED_CONTRACT_GAP). "Steder" (place cards) is
  // not built yet and shows an honest empty state. Local filtering
  // (tags/when/availability) lives in the Filtre sheet.
  const [filters, setFilters] = useState<SwipeFilters>(DEFAULT_SWIPE_FILTERS);
  const mode = filters.mode;
  const setMode = (m: SwipeMode) => setFilters((f) => ({ ...f, mode: m }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const filterKey = JSON.stringify(filters);
  const filter = useMemo(
    () => (e: MockExperience) => applySwipeFilters([e], filters).length === 1,
    [filterKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deck = useSwipeDeck({ filter, filterKey });
  const reduced = useReducedMotion();
  const { isGuest } = useGuestMode();
  const [size, setSize] = useState({ w: screenW, h: screenH });
  const [expand, setExpand] = useState<MockExperience | null>(null);
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
  // Measured top Y of the top card's info block → pins the expand arrow to the
  // actual title row instead of a brittle magic offset (F11).
  const [arrowY, setArrowY] = useState<number | null>(null);

  // Preload only the photos that can appear next — the current card + the one
  // behind it — instead of blocking the first paint on decoding every card's
  // images (F10). The deck renders immediately; PhotoCarousel shows a neutral
  // backdrop for the beat before a photo decodes.
  useEffect(() => {
    const mods = deck.window
      .slice(0, 2)
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
    if (!card || busy) return;
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
    // Smooth, eased glide (longer than a snap) so the exit reads like the
    // reference; faster flings shorten it a little. Fly fully past the edge so the
    // rotated far corner clears too. On completion, hide the live card and advance.
    const dur = Math.min(
      720,
      Math.max(560, 680 - Math.max(Math.abs(vx), Math.abs(vy)) / 16),
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
    const back = { duration: 560, easing: Easing.out(Easing.cubic) };
    tx.value = withTiming(0, back);
    ty.value = withTiming(0, back);
  };

  const pan = Gesture.Pan()
    .enabled(!deck.done && expand === null && !busy)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitNonce]);

  // Web keyboard alternative: ← nope, → like, ↑ save, Backspace undo.
  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      deck.done ||
      expand !== null ||
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
  }, [deck.done, deck.index, expand, reduced, busy, mode, joinChatFor]);

  // Render behind→front so the top card (slot 0) sits on top.
  const slots = deck.window.map((exp, n) => ({ exp, n })).reverse();

  return (
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
              title="Du har sett alt for nå"
              message="Nye anbefalinger dukker opp gjennom dagen. Prøv andre filtre, eller utforsk kartet i mellomtiden."
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
                onExpand={() => setExpand(exp)}
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
                void Share.share({ message: `${c.title} — ThirdPlace` }).catch(
                  () => {},
                );
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
            filters.tags.length > 0 || filters.when !== null || filters.hasSpots
          }
          onOpenNotifications={() => setNotifOpen(true)}
          unreadCount={unreadNotifs}
          onLight={mode === "places" ? placesDone : deck.done}
          onOpenGroup={() => router.push("/group-swipe")}
        />

        {/* Honest demo note: "For deg" is not personalized yet — it shows the
            same deck as "Opplevelser". */}
        {mode === "forYou" ? (
          <View className="mx-gutter mt-2 flex-row items-center gap-2 self-start rounded-full bg-black/55 px-3 py-1.5">
            <DemoBadge />
            <Text className="text-xs font-medium text-white/80">
              Ikke personalisert ennå
            </Text>
          </View>
        ) : null}
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
      <NotificationsSheet
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      {/* In-place detail — a full-screen DARK experience sheet (swipe-local, so
          the shared map detail stays light). Pan is disabled while it is open. */}
      {expand ? (
        <ExpandDetail exp={expand} onClose={() => setExpand(null)} />
      ) : null}

      <JoinChatSheet exp={joinChatFor} onClose={() => setJoinChatFor(null)} />

      {/* Account gate for guest join/save (also used by the detail's CTAs). */}
      <SignInPrompt
        visible={signInFor !== null}
        action={signInFor ?? "fortsette"}
        onClose={() => setSignInFor(null)}
      />
    </View>
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
        {/* Filled up-arrow in a dark circle, like the reference's expand affordance. */}
        <Icon name="arrow-up" size="md" tone="onMedia" />
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

// One icon + text meta row on the dark detail.
function MetaLine({
  icon,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  children: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size="sm" tone="onMedia" />
      <Text
        className="flex-1 text-[15px] text-white/90 font-normal"
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

// Full-screen in-place detail — a swipe-LOCAL dark experience sheet. It renders a
// compact body straight from the fixture (hero + status/when/host/about/interests
// + attendees count) instead of the shared (light) map DetailContent, so the map's
// detail is untouched. A sticky bottom bar carries the primary join CTA. Join/save
// are account-gated for guests; everything here is local demo state
// (BLOCKED_CONTRACT_GAP) and carries a DemoBadge.
function ExpandDetail({
  exp,
  onClose,
}: {
  exp: MockExperience;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const heroH = Math.round(screenH * 0.46);
  const { isGuest } = useGuestMode();
  const [signInFor, setSignInFor] = useState<string | null>(null);
  // Safety actions (Master §7 report/block). Local demo only — opening a small
  // action sheet; the actions are account-gated for guests and send nothing.
  const [safetyOpen, setSafetyOpen] = useState(false);

  const place = places.find((p) => p.id === exp.placeId) ?? null;
  // Single source of truth for status wording + CTA (F14).
  const { statusText, joinLabel } = experienceAvailability(exp);

  // Save uses the shared demo Saved store (same as a swipe-up and the map's
  // Lagret); join flips local demo state only (BLOCKED_CONTRACT_GAP).
  const { isSaved, toggle } = useMapSaved();
  const savedKey = markerId("experience", exp.id);
  const saved = isSaved(savedKey);
  const [joined, setJoined] = useState(false);

  // Account-gate join/save for guests.
  const gate = (label: string, run?: () => void) => {
    if (isGuest) {
      setSignInFor(label);
      return;
    }
    run?.();
  };

  return (
    // A real Modal so Android hardware back closes the detail (onRequestClose)
    // and focus is contained to the sheet (F2/F7), not the deck behind it.
    <Modal
      visible
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: media.base }]}>
        {/* Light status-bar content over the dark detail surface. */}
        <StatusBar style="light" />
        {/* Header: title + collapse. */}
        <View
          className="flex-row items-center gap-2 px-gutter pb-2"
          style={{ paddingTop: insets.top + 4 }}
        >
          <Text
            className="flex-1 text-xl font-bold text-white"
            numberOfLines={1}
          >
            {exp.title}
          </Text>
          <IconButton
            icon="ellipsis-horizontal"
            label="Flere valg"
            variant="mediaSubtle"
            size="sm"
            onPress={() => setSafetyOpen(true)}
          />
          <IconButton
            icon="arrow-down"
            label="Lukk detaljer"
            variant="mediaSubtle"
            size="sm"
            onPress={onClose}
          />
        </View>

        <ScrollView
          contentContainerClassName="gap-5 px-gutter pb-28 pt-1"
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="overflow-hidden rounded-lg bg-ink"
            style={{ height: heroH }}
          >
            <PhotoCarousel photos={exp.photos} interactive />
          </View>

          <View className="flex-row items-center gap-2">
            <DemoBadge />
            <Text className="flex-1 text-xs text-white/60 font-normal">
              Demo — ingen reell påmelding eller lagring på server.
            </Text>
          </View>

          <View className="gap-2">
            <MetaLine icon="people-outline">
              {`${statusText} · ${exp.going}/${exp.capacity} påmeldt`}
            </MetaLine>
            <MetaLine icon="calendar-outline">{exp.when}</MetaLine>
            {place ? (
              <MetaLine icon="location-outline">
                {`${place.name} · ${place.distance}`}
              </MetaLine>
            ) : null}
            <MetaLine icon="person-outline">{`Vert: ${exp.host}`}</MetaLine>
          </View>

          <View className="gap-1">
            <Text className="text-base font-bold text-white">Om</Text>
            <Text className="text-[15px] leading-6 text-white/85 font-normal">
              {exp.about}
            </Text>
          </View>

          {exp.tags.length > 0 ? (
            <View className="gap-2">
              <Text className="text-base font-bold text-white">Interesser</Text>
              <View className="flex-row flex-wrap gap-2">
                {exp.tags.map((t) => (
                  <View
                    key={t}
                    className="rounded-full px-3.5 py-1.5"
                    style={{ backgroundColor: media.fillSubtle }}
                  >
                    <Text className="text-[14px] font-medium text-white">
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Sticky bottom bar — primary join CTA + save + share. */}
        <View
          className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 px-gutter"
          style={{
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: media.sheet,
            borderTopWidth: 1,
            borderColor: media.hairline,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={joined ? "Meld av (demo)" : joinLabel}
            accessibilityState={{ selected: joined }}
            onPress={() => gate(joinLabel, () => setJoined((j) => !j))}
            style={{ backgroundColor: colors.ember }}
            className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full"
          >
            <Icon name="heart" size="md" tone="onEmber" />
            <Text
              className="text-base font-bold"
              style={{ color: colors.onEmber }}
            >
              {joined ? "Du er med · demo" : joinLabel}
            </Text>
          </Pressable>
          <IconButton
            icon={saved ? "bookmark" : "bookmark-outline"}
            label={saved ? "Fjern fra lagret" : "Lagre"}
            variant="mediaOutline"
            size="lg"
            selected={saved}
            onPress={() => gate("lagre", () => toggle(savedKey))}
          />
          <IconButton
            icon="paper-plane-outline"
            label="Del"
            variant="mediaOutline"
            size="lg"
            onPress={() =>
              void Share.share({ message: `${exp.title} — ThirdPlace` }).catch(
                () => {},
              )
            }
          />
        </View>

        {/* Safety action sheet (Master §7 report/block) — local demo, no report
            is sent; account-gated for guests. */}
        <Modal
          visible={safetyOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSafetyOpen(false)}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lukk"
            onPress={() => setSafetyOpen(false)}
            style={[StyleSheet.absoluteFill, { backgroundColor: media.scrim }]}
          />
          <View
            className="absolute inset-x-0 bottom-0 gap-2 rounded-t-xl bg-surface px-gutter pt-4"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="flex-row items-center gap-2 pb-1">
              <DemoBadge />
              <Text className="flex-1 text-xs text-muted font-normal">
                Demo — ingen rapport sendes og ingen blokkering lagres.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Rapporter opplevelsen"
              onPress={() => {
                setSafetyOpen(false);
                gate("rapportere");
              }}
              className="flex-row items-center gap-3 rounded-lg border border-line px-4 py-4"
            >
              <Icon name="flag-outline" size="md" tone="ink" />
              <Text className="text-base font-semibold text-ink">
                Rapporter opplevelsen
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Blokker ${exp.host}`}
              onPress={() => {
                setSafetyOpen(false);
                gate("blokkere");
              }}
              className="flex-row items-center gap-3 rounded-lg border border-line px-4 py-4"
            >
              <Icon name="ban-outline" size="md" tone="ember" />
              <Text className="text-base font-semibold text-ink">
                {`Blokker ${exp.host}`}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Avbryt"
              onPress={() => setSafetyOpen(false)}
              className="items-center rounded-lg px-4 py-4"
            >
              <Text className="text-base font-semibold text-muted">Avbryt</Text>
            </Pressable>
          </View>
        </Modal>

        <SignInPrompt
          visible={signInFor !== null}
          action={signInFor ?? "fortsette"}
          onClose={() => setSignInFor(null)}
        />
      </View>
    </Modal>
  );
}

// "Bli med i samtalen" (PDF p8): after a like, offer the experience's chat.
// DEMO — "Bli med i chatten" joins nothing; the note says so. The PDF's
// "N personer snakker …" count is left out (no real social proof).
function JoinChatSheet({
  exp,
  onClose,
}: {
  exp: MockExperience | null;
  onClose: () => void;
}) {
  const [tried, setTried] = useState(false);
  const close = () => {
    setTried(false);
    onClose();
  };
  return (
    <Sheet visible={exp !== null} onClose={close} title="Bli med i samtalen">
      {exp ? (
        <View className="gap-3">
          <Text className="text-base font-semibold text-ink">{exp.title}</Text>
          <Text className="text-sm text-muted font-normal">{exp.when}</Text>
          <View className="flex-row items-center gap-2 rounded-md bg-surfaceMuted p-3">
            <Icon name="chatbubbles-outline" size="sm" tone="ink" />
            <Text className="flex-1 text-sm text-ink font-normal">
              Chat er gratis — billett kjøper du når du vil.
            </Text>
          </View>
          {tried ? (
            <DemoNote>Du ble ikke lagt til i noen chat i demoen.</DemoNote>
          ) : null}
          <Button
            label="Bli med i chatten"
            variant="ink"
            onPress={() => setTried(true)}
          />
          <Button label="Avbryt" variant="secondary" onPress={close} />
        </View>
      ) : null}
    </Sheet>
  );
}
