import { router, useFocusEffect, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  type SharedValue,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { Icon, Text, type IconName, Button, Sheet } from "@/components/ui";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import { EmptyState } from "@/components/states/StateView";
import { showToastAfterSheet } from "@/components/Toast";
import { confirmToast } from "@/copy";
import { useNotificationReads } from "@/hooks/useNotificationReads";
import { markViewed } from "@/components/map/hooks/useRecentlyViewed";
import { haptics } from "@/lib/haptics";
import { claimHint, markHintSeen, useHintSeen } from "@/lib/hints";
import { joinChat } from "@/lib/joinedChats";
import { getA11yPrefs, useA11yPrefs, withWheelchair } from "@/lib/a11yPrefs";
import { elevation, motion, useThemeColors, media } from "@/theme";

import {
  decideCommit,
  flyDuration,
  nextCardScale,
  rotationFor,
  stampOpacity,
  type SwipeAction,
} from "./deckLogic";
import {
  SwipeActions,
  SWIPE_PANEL_PAD_BOTTOM,
  SWIPE_PANEL_PAD_TOP,
} from "./SwipeActions";
import {
  CARD_BOTTOM_GAP,
  CARD_RADIUS,
  HEAD_BAND_H,
  SwipeCard,
  SWIPE_INFO_BOTTOM,
} from "./SwipeCard";
import { SwipeDetails } from "./SwipeDetails";
import { SwipeFilterBar, type SwipeMode } from "./SwipeFilterBar";
import { MapFilterSheet } from "@/components/map/MapFilterSheet";
import {
  activeExtraFilterCount,
  DEFAULT_FILTERS,
  type MapFilters,
} from "@/components/map/services/mapFilters";
import { useSwipeDeck } from "./useSwipeDeck";
import { deckForMode, modeResult, type DeckItem } from "./deckItems";
import { useMapSaved } from "@/components/map/hooks/useMapSaved";
import { Illustration } from "@/components/illustrations/Illustration";
import { useAfterPaint } from "@/hooks/useAfterPaint";

const G = motion.gesture;
// The top area under the status bar (dp), down to the bottom of the top
// shadow: drags that start above this line never move the card.
const TOP_BAR_H = HEAD_BAND_H;
// A stamp starts at this fraction of its size and grows to full with the
// swipe, and shrinks again as the card is pulled back; measured on the
// reference 2026-11-20.
const STAMP_FROM = G.swipeStampFrom;
// The up-swipe commit line in the dragged card's own (damped) travel: the card
// follows the finger at swipeVertDamp, but the commit is judged on the finger's
// own travel and speed, so what you see fills up when the swipe will commit.
const VERT_DAMPED = G.swipeVertCommitRatio * G.swipeVertDamp;
// A released card that does not commit goes back to rest: accelerating, no
// overshoot (measured on the reference).
const RETURN = { duration: G.swipeReturnMs, easing: Easing.in(Easing.quad) };
// The fly-off's ease-in, x(t) = 2/3·t + 1/3·t² as a cubic bezier: it starts
// at 2/3 of the average speed and ends at 4/3 of it (twice the start), as the
// reference's card does after release.
const FLY_START_SHARE = 2 / 3;
const FLY_EASE = Easing.bezier(1 / 3, 2 / 9, 2 / 3, 5 / 9);
// The rewind plays the fly-off backwards (user 2026-11-20): the same curve
// turned half a turn, x(t) = 4/3·t − 1/3·t², so the card enters at twice the
// speed it ends with and settles, over the fly-off's own duration.
const UNDO_EASE = Easing.bezier(1 / 3, 4 / 9, 2 / 3, 7 / 9);

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
  const [mode, setMode] = useState<SwipeMode>("forYou");
  // Filtre is the map's sheet with the map's pipeline (user 2026-11-06: the
  // Sveip filter must be identical to the map's); Sveip keeps its own state.
  // Starts with the step-free filter when "Vis kun rullestolvennlige" is on
  // (Tilgjengelighet), like the map.
  const { wheelchairOnly } = useA11yPrefs();
  const [filters, setFilters] = useState<MapFilters>(() =>
    withWheelchair(DEFAULT_FILTERS, getA11yPrefs().wheelchairOnly),
  );
  const [seenWheelchair, setSeenWheelchair] = useState(wheelchairOnly);
  if (seenWheelchair !== wheelchairOnly) {
    setSeenWheelchair(wheelchairOnly);
    setFilters((f) => withWheelchair(f, wheelchairOnly));
  }
  // Filtre's open state lives in DeckFiltre, so opening it does not
  // re-render the deck (~50 ms on production JS, user 2026-11-24).
  const openFiltersRef = useRef<(() => void) | null>(null);
  const openFilters = useCallback(() => openFiltersRef.current?.(), []);
  const { unread: unreadNotifs } = useNotificationReads();

  // One deck for every tab (H5d): experiences or places as the same card
  // model, after the same filters as the map. Switching tab or filters resets
  // the deck to its top.
  const filterKey = `${mode}:${JSON.stringify(filters)}`;
  // What is saved: Lagret is built from this when the tab is chosen, and not
  // rebuilt by a swipe-save.
  const { savedIds } = useMapSaved();
  // "Vis N resultater" = the deck it will show for the active tab.
  const countFor = useCallback(
    (draft: MapFilters) => modeResult(mode, draft, savedIds).items.length,
    [mode, savedIds],
  );
  // Nearest first from where the person is when the deck is built (Phase 19);
  // the origin is read, not tracked, so a move never reshuffles the deck.
  const built = useMemo(
    () => deckForMode(mode, filters, savedIds),
    [filterKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const items = built.items;

  const deck = useSwipeDeck({ items, filterKey });
  const reduced = useReducedMotion();
  const hintSeen = useHintSeen("swipeGestures");
  // One tip per session across the app (Phase 18): the deck claims it when
  // the tab is actually in front, unless another tip already showed. Not at
  // mount: the map pre-renders this tab in the background (R28), which would
  // otherwise use up the session's tip before anyone saw it.
  const [hintClaimed, setHintClaimed] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (claimHint("swipeGestures")) setHintClaimed(true);
    }, []),
  );
  const { isGuest } = useGuestMode();
  const [size, setSize] = useState({ w: screenW, h: screenH });
  // When a guest tries an account-only action (join/save), we show the sign-in
  // prompt instead of committing. `nope` (pass), share and undo stay open.
  const [signInFor, setSignInFor] = useState<string | null>(null);
  const [joinChatFor, setJoinChatFor] = useState<DeckItem | null>(null);
  // The top card's details, open in place (SwipeDetails), with the card's
  // photo index so both show the same photo.
  const [details, setDetails] = useState<Details | null>(null);
  const [detailsClosing, setDetailsClosing] = useState(false);
  // Guards a second commit while a card is still flying off (F3) — without it a
  // rapid second drag clobbers the in-flight exit and strands/double-advances.
  // A shared value, not state (speed pass 0352): flipping state re-rendered the
  // whole deck twice per swipe; the pan worklet reads it on the UI thread.
  const busy = useSharedValue(false);
  // Which cards are on top, next and third, as keys the UI thread can read: the
  // card moving up is handed the drag in the frame the old one has gone, not
  // after React has re-rendered (the deck then answers the next swipe at once).
  const topKeySV = useSharedValue("");
  const nextKeySV = useSharedValue("");
  const thirdKeySV = useSharedValue("");
  // True from a commit until its advance has run on the JS thread: a second
  // commit in between would act on the card that has just gone.
  const inFlight = useRef(false);
  // The card that is flying off and the action that sent it, so a new touch
  // can finish the flight at once (finishFlight) and take the next card.
  const flyGoneSV = useSharedValue("");
  const flyActionSV = useSharedValue<SwipeAction | null>(null);
  // Each card's tap handler (the photo step), looked up by the top card's key.
  const [tapRegistry] = useState(
    () => new Map<string, (x: number, y: number) => void>(),
  );
  // R27 (Phase 10 open item): a button tap made while a card is still flying
  // off is queued (latest wins) and replayed once the next card is in place,
  // instead of being dropped. Drags stay locked during the glide.
  const pendingTap = useSharedValue<SwipeAction | null>(null);
  // The key of the card that last flew off, so goneKey is cleared only for it.
  const goneRef = useRef("");
  // The rewind's slide-in, waiting for the returning card to mount.
  const undoGlide = useRef<{
    duration: number;
    easing: typeof UNDO_EASE;
  } | null>(null);
  // Clears the flown-off card's mark: for `only` if no newer card has flown
  // off since, for everything when `only` is null.
  const clearGone = (only: string | null) => {
    if (only !== null && goneRef.current !== only) return;
    goneRef.current = "";
    goneKey.value = "";
  };
  // The latest commit (fresh deck state): the queued-tap replay and the pan
  // gesture call it through this ref, so the gesture is not rebuilt with it.
  const commitRef = useRef<(a: SwipeAction, vx?: number, vy?: number) => void>(
    () => {},
  );
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
  // Opacity of the top card (the reduced-motion commit fades it out).
  const fade = useSharedValue(1);
  // +1 when the top card was grabbed in its top half (or moved by a button),
  // -1 in its bottom half: rotationFor turns it the other way (onBegin).
  const grab = useSharedValue(1);
  // The card that has just flown off: hidden by key in the same UI frame the
  // drag values reset, until React drops it from the window.
  const goneKey = useSharedValue("");
  // The card an undo slides back over: it stays still meanwhile.
  const frozenKey = useSharedValue("");
  // 1 while the rewind glides a card back in: no stamps or colour wash then.
  const undoing = useSharedValue(0);
  // What the action discs read (2026-11-18, measured on the reference): the
  // drag while the finger is down; from release the value it had then, held
  // while the card flies off or springs back, cleared in the frame it is gone
  // or back at rest. An undo glide leaves them at rest.
  const held = useSharedValue(0);
  const hx = useSharedValue(0);
  const hy = useSharedValue(0);

  // Advance after the outgoing card has left: swap the deck, release the commit
  // lock, then bump the nonce so the layout effect replays a queued tap.
  const advanceRef = useRef<(a: SwipeAction) => void>(() => {});
  const advanceStable = useCallback(
    (a: SwipeAction) => advanceRef.current(a),
    [],
  );
  const advance = (action: SwipeAction) => {
    deck.commit(action);
    inFlight.current = false;
    // A button tap made while the card was flying off is replayed on the card
    // that has arrived (R27, latest wins).
    const queued = pendingTap.value;
    if (queued) {
      pendingTap.value = null;
      setTimeout(() => commitRef.current(queued), 0);
    }
  };

  // Ends the flight of the card that is leaving, now: hides it, hands the drag
  // and the top place to the next card and opens the lock, all on the UI
  // thread. It runs when the card has flown off, and when a new touch or a
  // button press comes while it is still flying (so a quick next swipe never
  // waits for the last card to finish).
  const finishFlight = () => {
    "worklet";
    const action = flyActionSV.value;
    if (action === null) return;
    flyActionSV.value = null;
    goneKey.value = flyGoneSV.value;
    fade.value = 1;
    tx.value = 0;
    ty.value = 0;
    held.value = 0;
    topKeySV.value = nextKeySV.value;
    nextKeySV.value = thirdKeySV.value;
    thirdKeySV.value = "";
    busy.value = false;
    runOnJS(advanceStable)(action);
  };

  // Commit a swipe by flying the LIVE top card off on tx/ty (sequential: the card
  // leaves, revealing the next card underneath, grown to full size, and only
  // THEN is it promoted), advancing on completion. Keeps the unhurried eased glide.
  // `busy` locks out a second commit while one is in flight (F3). A tap passes no
  // velocity (fly-off from center); a gesture release passes its velocity so a
  // fling shortens the glide a little. Reduced → a fade. Login is a DEMO.
  const commit = (action: SwipeAction, vx = 0, vy = 0) => {
    const card = deck.getCurrent();
    if (!card) return;
    // A first swipe or button press means the gestures are known.
    markHintSeen("swipeGestures");
    if (busy.value || inFlight.current) {
      if (vx === 0 && vy === 0) {
        pendingTap.value = action;
        // The press ends the flight that is still going, then replays.
        if (busy.value) {
          cancelAnimation(tx);
          cancelAnimation(ty);
          cancelAnimation(fade);
          runOnUI(finishFlight)();
        }
      }
      return;
    }
    // Account gate (honest guest restriction) — join/save need an account; pass
    // is free. Spring the drag back so a *dragged* like/save settles instead of
    // stranding the card behind the sign-in sheet (F1).
    if (isGuest && (action === "like" || action === "save")) {
      setSignInFor(action === "like" ? "bli med" : "lagre");
      tx.value = withTiming(0, RETURN, (fin) => {
        "worklet";
        if (fin) held.value = 0;
      });
      ty.value = withTiming(0, RETURN);
      return;
    }
    // A commit from the details closes them in one frame; the card flies off.
    if (details) {
      setDetails(null);
      setDetailsClosing(false);
    }
    busy.value = true;
    inFlight.current = true;
    frozenKey.value = "";
    // A button press swings the card the usual way.
    if (vx === 0 && vy === 0) grab.value = 1;
    const gone = cardKeyOf(card);
    goneRef.current = gone;
    // PDF p8: a like (♥ / right swipe) offers "Bli med i samtalen", joining
    // the item's chat as a separate, explicit step (a place is also saved).
    if (action === "like") setJoinChatFor(card);

    // Once the card has left: hide it by key and reset the drag values in the
    // same UI frame (the next card, grown to full size, sits underneath), then
    // advance the deck on the JS thread.
    flyGoneSV.value = gone;
    flyActionSV.value = action;
    const done = (fin?: boolean) => {
      "worklet";
      if (fin) finishFlight();
    };
    if (reduced) {
      fade.value = withTiming(0, { duration: motion.duration.fast }, done);
      return;
    }
    // The card starts at its release speed (never slower than
    // swipeFlyMinSpeed, so a button press flies at that speed) and speeds up
    // to about twice it, in a straight line, as on the reference. It flies
    // past the edge so the rotated far corner clears too; then the card is
    // hidden and the deck advances.
    const easing = FLY_EASE;
    const flyMs = (remaining: number, v: number) =>
      flyDuration(
        remaining,
        v,
        G.swipeFlyMinSpeed,
        G.swipeFlyMinMs,
        G.swipeFlyMaxMs,
        FLY_START_SHARE,
      );
    if (action === "save") {
      const to = -G.swipeFlyTravel * screenH;
      // Timed on the width's scale (user 2026-11-24): the up flight crosses
      // the taller screen, so measured in px it took longer than a side one.
      // Scaled, the same share of the trip takes the same time.
      const k = screenH > 0 ? screenW / screenH : 1;
      ty.value = withTiming(
        to,
        { duration: flyMs((to - ty.value) * k, vy * k), easing },
        done,
      );
    } else {
      const to = (action === "like" ? 1 : -1) * G.swipeFlyTravel * screenW;
      tx.value = withTiming(
        to,
        { duration: flyMs(to - tx.value, vx), easing },
        done,
      );
    }
  };

  const undo = () => {
    const action = deck.getLastAction();
    if (!action || busy.value || inFlight.current) return;
    pendingTap.value = null;
    goneRef.current = "";
    goneKey.value = "";
    setDetails(null);
    if (reduced) {
      deck.undo();
      return;
    }
    // The card on top now stays still while the previous one comes back over
    // it: restored off-screen on the side it left, then glided back in.
    const cur = deck.getCurrent();
    frozenKey.value = cur ? cardKeyOf(cur) : "";
    undoing.value = 1;
    grab.value = 1;
    hx.value = 0;
    hy.value = 0;
    held.value = 1;
    if (action === "save") ty.value = -G.swipeFlyTravel * screenH;
    else tx.value = (action === "like" ? 1 : -1) * G.swipeFlyTravel * screenW;
    // The returning card is on top from the moment it mounts, so it starts
    // where the glide starts (off the edge) instead of showing in place first.
    const i = deck.getIndex();
    const keyAt = (n: number) => {
      const it = deck.deck[i + n];
      return it ? cardKeyOf(it) : "";
    };
    topKeySV.value = keyAt(-1);
    nextKeySV.value = keyAt(0);
    thirdKeySV.value = keyAt(1);
    deck.undo();
    // Same duration as the fly-off of a button press, run in reverse; a save's
    // is timed on the width's scale too, as its fly-off is.
    const dist = screenW * G.swipeFlyTravel;
    const back = {
      duration:
        flyDuration(
          dist,
          0,
          G.swipeFlyMinSpeed,
          G.swipeFlyMinMs,
          G.swipeFlyMaxMs,
          FLY_START_SHARE,
        ) * G.swipeUndoSlow,
      easing: UNDO_EASE,
    };
    // The glide starts once the returning card has mounted (the layout effect
    // below), so the whole slide is seen, as the X's fly-off is, not the end
    // of it.
    undoGlide.current = back;
  };
  // Starts the rewind's slide-in on the commit that has put the card back.
  const startUndoGlide = () => {
    const back = undoGlide.current;
    if (!back) return;
    undoGlide.current = null;
    tx.value = withTiming(0, back, (fin) => {
      "worklet";
      if (fin) {
        frozenKey.value = "";
        held.value = 0;
        undoing.value = 0;
      }
    });
    ty.value = withTiming(0, back);
  };

  // A drag that starts while a card is still flying off is ignored until the
  // finger lifts (the gesture used to be disabled for the glide).
  const dragIgnored = useSharedValue(false);
  // True while the finger that is down started in the top bar's area.
  const topTouch = useSharedValue(false);
  // The top bar: the status bar and the filter row under it.
  const topAreaH = insets.top + TOP_BAR_H;
  const commitFromGesture = useCallback(
    (action: SwipeAction, vx: number, vy: number) =>
      commitRef.current(action, vx, vy),
    [],
  );
  // One gesture object per detector: the top card builds its own pan from this
  // factory, which changes only with the deck size (speed pass 0352: it was a
  // new gesture on every deck render, attached to the card again each time).
  const makePan = useCallback(
    () =>
      Gesture.Pan()
        // A touch that lands in the top area is not the card's: the pan
        // gives up at once, so the tab row under it gets the drag.
        .onTouchesDown((e, manager) => {
          const y = e.allTouches[0]?.absoluteY ?? 0;
          if (y < topAreaH) manager.fail();
        })
        // The card follows the finger from 6 dp (it was 12, which made it
        // jump that far when the drag was recognised).
        .activeOffsetX([-6, 6])
        .activeOffsetY([-6, 6])
        // Where the finger lands sets the swing: a card held low turns the
        // other way, about the finger, as the reference does.
        .onBegin((e) => {
          if (busy.value) {
            cancelAnimation(tx);
            cancelAnimation(ty);
            cancelAnimation(fade);
            finishFlight();
          }
          grab.value = e.y < size.h / 2 ? 1 : -1;
          // A touch that starts in the top bar's area is not a swipe of the
          // card (user 2026-11-20).
          topTouch.value = e.absoluteY < topAreaH;
        })
        .onStart(() => {
          dragIgnored.value = busy.value || topTouch.value;
        })
        .onUpdate((e) => {
          // A button's swipe that started during this drag owns the card from
          // then on (review of the speed pass): writing tx here would stop its
          // fly-off, so the deck never advanced and stayed locked.
          if (busy.value) dragIgnored.value = true;
          if (dragIgnored.value) return;
          held.value = 0;
          tx.value = e.translationX;
          ty.value = e.translationY * G.swipeVertDamp;
          const over =
            Math.abs(tx.value) > size.w * G.swipeCommitRatio ||
            -ty.value > size.h * VERT_DAMPED;
          if (over && crossed.value === 0) {
            crossed.value = 1;
            runOnJS(haptics.selection)();
          } else if (!over && crossed.value === 1) {
            crossed.value = 0;
          }
        })
        // Runs when a drag ends, never during render: commitFromGesture reads
        // the latest commit from a ref only then.
        .onEnd((e) => {
          crossed.value = 0;
          if (dragIgnored.value || busy.value) {
            dragIgnored.value = false;
            return;
          }
          // The discs keep the fill they had when the finger lifted.
          hx.value = tx.value;
          hy.value = ty.value;
          held.value = 1;
          const action = decideCommit(
            {
              dx: tx.value,
              dy: ty.value / G.swipeVertDamp,
              vx: e.velocityX,
              vy: e.velocityY,
              w: size.w,
              h: size.h,
            },
            {
              commitRatio: G.swipeCommitRatio,
              assistRatio: G.swipeAssistRatio,
              vertCommitRatio: G.swipeVertCommitRatio,
              velocity: G.swipeVelocity,
              fastVelocity: G.swipeFastVelocity,
              fastAssistRatio: G.swipeFastAssistRatio,
              vertVelocity: G.swipeVertVelocity,
            },
          );
          if (!action) {
            tx.value = withTiming(0, RETURN, (fin) => {
              "worklet";
              if (fin) held.value = 0;
            });
            ty.value = withTiming(0, RETURN);
            return;
          }
          // The live top card is already at tx/ty — just continue it off from here.
          runOnJS(commitFromGesture)(action, e.velocityX, e.velocityY);
        }),
    // Shared values are stable and written from the worklets, so they stay
    // out of the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size.w, size.h, commitFromGesture, topAreaH],
  );

  // The card that flew off has left the window by now (same commit), so its
  // key can go; a new deck (tab, filters, "Se kortene igjen") starts clean.
  useLayoutEffect(() => {
    // Not cleared in this commit: the cards' animated styles still hold the
    // old roles until the commit's closures reach the UI thread, so for one
    // frame the card moving up read as "the next card" and shrank to 95 %
    // before it grew back (the zoom out and in, user 2026-11-20). Two frames
    // later it is safe, and only if no newer card has flown off since.
    const g = goneRef.current;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => clearGone(g));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.index]);
  // A new deck (tab, filters, "Se kortene igjen") starts clean at once.
  useLayoutEffect(() => {
    clearGone(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);
  useLayoutEffect(() => {
    frozenKey.value = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Keep the UI thread's top/next/third keys in step with the deck. The commit
  // moves them on at once; this settles them after any render, undo or new
  // deck, from the position as it is now (not the one last rendered).
  const syncKeys = () => {
    const i = deck.getIndex();
    const at = (n: number) => {
      const it = deck.deck[i + n];
      return it ? cardKeyOf(it) : "";
    };
    topKeySV.set(at(0));
    nextKeySV.set(at(1));
    thirdKeySV.set(at(2));
  };
  useLayoutEffect(() => {
    syncKeys();
    startUndoGlide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.index, deck.deck, filterKey]);
  // Keep the replay and the gesture pointed at the latest commit (fresh deck).
  useLayoutEffect(() => {
    commitRef.current = commit;
    advanceRef.current = advance;
  });

  // Web keyboard alternative: ← nope, → like, ↑ save, Backspace undo.
  useEffect(() => {
    if (Platform.OS !== "web" || deck.done || joinChatFor !== null) return;
    const onKey = (ev: KeyboardEvent) => {
      if (busy.value) return;
      if (ev.key === "ArrowLeft") commit("nope");
      else if (ev.key === "ArrowRight") commit("like");
      else if (ev.key === "ArrowUp") commit("save");
      else if (ev.key === "Backspace") undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.done, deck.index, reduced, busy, mode, joinChatFor]);

  // The arrow opens the card's details in place (user 2026-11-18; the
  // /experience and /place routes stay for links). Stable, so the memoised
  // top card keeps it.
  const openPage = useCallback(
    (item: DeckItem, photo: number, setPhoto: (i: number) => void) => {
      markViewed({ kind: item.kind, id: item.id, title: item.title });
      setDetailsClosing(false);
      setDetails({ item, photo, setPhoto });
    },
    [],
  );
  const closeDetails = useCallback(() => setDetailsClosing(true), []);
  const detailsClosed = useCallback(() => {
    setDetails(null);
    setDetailsClosing(false);
  }, []);
  // Shown only over their own card: a new deck (tab, filters) drops them.
  const currentKey = deck.current ? cardKeyOf(deck.current) : "";
  const shown =
    details && cardKeyOf(details.item) === currentKey ? details : null;

  // One gesture for the whole stack, so it does not depend on which card React
  // has promoted: the pan drags whatever card the UI thread says is on top,
  // and a tap steps that card's photo. The tap gives up past 6 px, as the
  // pan takes over, so a short drag never also steps the photo.
  const tapTop = useCallback(
    (x: number, y: number, key: string) => {
      tapRegistry.get(key)?.(x, y);
    },
    [tapRegistry],
  );
  const stackGesture = useMemo(() => {
    const tap = Gesture.Tap()
      .maxDistance(6)
      .onTouchesDown((e, manager) => {
        const y = e.allTouches[0]?.absoluteY ?? 0;
        if (y < topAreaH) manager.fail();
      })
      .onEnd((e, ok) => {
        if (ok) runOnJS(tapTop)(e.x, e.y, topKeySV.value);
      });
    // makePan only builds the gesture: its callbacks read the commit ref when
    // a drag ends, never during render.
    // eslint-disable-next-line react-hooks/refs
    return Gesture.Race(makePan(), tap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makePan, tapTop, topAreaH]);

  // Render behind→front so the top card (slot 0) sits on top.
  const slots = deck.window
    .slice(0, ROLES.length)
    .map((item, n) => ({ item, role: ROLES[n] ?? "peek" }))
    .reverse();

  return (
    <>
      <View className="flex-1" style={{ backgroundColor: media.black }}>
        {deck.done ? (
          // PDF p8 "Du har sett alt for nå" — light screen, two actions.
          <View
            className="flex-1 justify-center bg-background"
            style={{ paddingTop: insets.top }}
          >
            {deck.deck.length === 0 ? (
              <EmptyState
                icon="albums-outline"
                title="Ingen treff"
                message={built.emptyMessage}
                actionLabel="Nullstill filtre"
                onAction={() =>
                  setFilters(withWheelchair(DEFAULT_FILTERS, wheelchairOnly))
                }
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
                onAction={openFilters}
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
            <GestureDetector gesture={stackGesture}>
              <View style={StyleSheet.absoluteFill} collapsable={false}>
                {slots.map(({ item, role }) => (
                  <DeckCard
                    key={cardKeyOf(item)}
                    item={item}
                    role={role}
                    topKeySV={topKeySV}
                    taps={tapRegistry}
                    tx={tx}
                    ty={ty}
                    fade={fade}
                    grab={grab}
                    goneKey={goneKey}
                    frozenKey={frozenKey}
                    undoing={undoing}
                    w={size.w}
                    h={size.h}
                    reduced={reduced}
                    onExpand={openPage}
                  />
                ))}
              </View>
            </GestureDetector>

            {/* Phase 16 (after the section benchmark): a one-time hint for the
                gestures, until "Skjønner" or the first swipe. Kept per
                phone (src/lib/hints.ts). Swipes beside it still reach the
                card. */}
            {shown && !deck.done ? (
              <SwipeDetails
                key={cardKeyOf(shown.item)}
                item={shown.item}
                reduced={reduced}
                closing={detailsClosing}
                onClose={closeDetails}
                onClosed={detailsClosed}
              />
            ) : null}

            {hintClaimed && !hintSeen && size.h > 0 ? (
              <SwipeHint onDone={() => markHintSeen("swipeGestures")} />
            ) : null}

            {/* The action row floats over the card, as the reference: the
                dark band behind it is the card's own foot, so a dragged card
                takes it along and the next card shows through (2026-11-18).
                The buttons never move. box-none, so a drag that starts
                between the buttons still moves the card. Above the card stack
                (whose top card carries zIndex). */}
            <View
              pointerEvents="box-none"
              className="absolute inset-x-0 bottom-0"
              style={{
                paddingTop: SWIPE_PANEL_PAD_TOP,
                paddingBottom: SWIPE_PANEL_PAD_BOTTOM,
                zIndex: 30,
                // The details page has its own bottom: no buttons over it.
                display: shown ? "none" : "flex",
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
                  // The device share sheet with the card's title and link
                  // (no backend), like the experience page's share.
                  const c = deck.current;
                  if (!c) return;
                  void Share.share({
                    message: `${c.title} på ThirdPlace: thirdplace.app/${c.kind}/${c.id}`,
                  }).catch(() => {});
                }}
                tx={tx}
                ty={ty}
                held={held}
                hx={hx}
                hy={hy}
                w={size.w}
                h={size.h}
                reduced={reduced}
                details={shown != null}
              />
            </View>
          </View>
        )}

        {/* Top filter bar — overlaid, with its own status-bar inset. Sits above
          the card stack (whose top card/expand button carry zIndex) so the
          mode tabs stay visible, as in the reference. */}
        {/* Hidden while the details are open (their header takes the top). */}
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 top-0"
          style={{
            paddingTop: insets.top + 4,
            zIndex: 30,
            elevation: 30,
            display: shown ? "none" : "flex",
          }}
        >
          <SwipeFilterBar
            mode={mode}
            touchH={HEAD_BAND_H - 4}
            onSelectMode={setMode}
            onOpenFilters={openFilters}
            filterActive={activeExtraFilterCount(filters) > 0}
            onOpenNotifications={() => router.push("/notifications" as Href)}
            unreadCount={unreadNotifs}
            onLight={deck.done}
            onOpenGroup={() => router.push("/group-swipe")}
          />
        </View>

        {/* Filtre — looks like the map's Filtre sheet (muted sheet, white Section
          cards, "Fjern alt + Vis N" footer), carrying the swipe's own modes +
          interests plus the data-backed Når/availability facets. */}
        <DeckFiltre
          openRef={openFiltersRef}
          filters={filters}
          count={countFor}
          onApply={setFilters}
        />

        {/* Notifications — the same demo sheet the map uses (bell in the top bar). */}

        <JoinChatSheet
          item={joinChatFor}
          onClose={() => setJoinChatFor(null)}
        />

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

type CardRole = "top" | "next" | "peek";
type Details = {
  item: DeckItem;
  photo: number;
  setPhoto: (i: number) => void;
};
const ROLES: CardRole[] = ["top", "next", "peek"];

const cardKeyOf = (item: DeckItem) => `${item.kind}:${item.id}`;

// One card of the deck, kept mounted while it moves up from third to top
// (2026-11-18): the top card used to be a different component from the cards
// behind it, so every swipe built the new top card from scratch and the card
// two places back showed for a frame in between. Now the same element changes
// role. Only the top card follows the drag (tx/ty) and takes the pan; the
// next card sits under it with its info drawn, at 95 % until the top card
// moves (nextCardScale); the third is the
// photo alone. `goneKey` hides the card that has just flown off, in the same
// UI frame the drag values reset, so it never snaps back into view;
// `frozenKey` keeps the old top card still while an undo brings the previous
// one back over it. Memoised (speed pass 0352): a deck render for a sheet, a
// tip or the filter bar does not re-render the cards.
const DeckCard = memo(function DeckCard({
  item,
  role,
  topKeySV,
  taps,
  tx,
  ty,
  fade,
  grab,
  goneKey,
  frozenKey,
  undoing,
  w,
  h,
  reduced,
  onExpand,
}: {
  item: DeckItem;
  role: CardRole;
  topKeySV: SharedValue<string>;
  taps: Map<string, (x: number, y: number) => void>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  fade: SharedValue<number>;
  grab: SharedValue<number>;
  goneKey: SharedValue<string>;
  frozenKey: SharedValue<string>;
  undoing: SharedValue<number>;
  w: number;
  h: number;
  reduced: boolean;
  onExpand: (
    item: DeckItem,
    photo: number,
    setPhoto: (i: number) => void,
  ) => void;
}) {
  const top = role === "top";
  // A card gets its info and gradients two frames after it mounts (at once
  // when it mounts on top), while it is still the third card: measured and
  // settled long before it is seen, and not built in the frame it takes over.
  const full = useAfterPaint(true, top);
  // The drag washes and stamps are only seen once a finger moves the card, so
  // they mount two frames after the card is on top.
  const armed = useAfterPaint(top);
  // The photo on show, shared with the details when they open.
  const [photo, setPhoto] = useState(0);
  const key = cardKeyOf(item);
  const count = item.photos.length;
  // The info block's measured top Y pins the open-page arrow to the title row
  // (F11). Measured while the card is still the next one, so the arrow is in
  // place the moment it becomes the top.
  const [infoTop, setInfoTop] = useState<number | null>(null);
  // A tap anywhere on the card steps the photos: the left half back, the
  // right half on (user 2026-11-18). A tap on the arrow is the arrow's. (The
  // gesture is rebuilt only when the title row moves, i.e. on layout.)
  const tapAt = useCallback(
    (x: number, y: number) => {
      const t = infoTop;
      const onArrow =
        t != null &&
        x > w - ARROW_RIGHT - ARROW - 12 &&
        y > t - 12 &&
        y < t + ARROW + 12;
      if (onArrow) return;
      const d = x < w / 2 ? -1 : 1;
      setPhoto((p) => Math.max(0, Math.min(count - 1, p + d)));
    },
    [w, count, infoTop],
  );
  // The stack's gesture calls this for the card on top.
  useEffect(() => {
    taps.set(key, tapAt);
    return () => {
      if (taps.get(key) === tapAt) taps.delete(key);
    };
  }, [taps, key, tapAt]);
  const style = useAnimatedStyle(() => {
    const gone = goneKey.value === key;
    // On top by the UI thread's say, not React's role: the card moving up
    // takes the drag in the frame the old one has gone.
    const isTop = topKeySV.value === key;
    const live = isTop && frozenKey.value !== key;
    const x = live ? tx.value : 0;
    const y = live ? ty.value : 0;
    // A card under the top one sits a little smaller and grows to full size
    // as the top card moves (and shrinks back on a snap-back or an undo).
    // From the frame a card has flown off until React promotes the next one
    // (goneKey set), the drag values are already 0, so it stays full size.
    const scale =
      isTop || reduced
        ? 1
        : nextCardScale(
            Math.hypot(tx.value, ty.value),
            G.swipeNextGrowPx,
            G.swipeNextRestScale,
          );
    return {
      opacity: gone ? 0 : isTop ? fade.value : 1,
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
        {
          rotateZ:
            reduced || !live
              ? "0deg"
              : `${rotationFor(x, w, G.swipeRotatePerWidth, G.swipeMaxRotateDeg, grab.value)}deg`,
        },
      ],
    };
  }, [key, reduced, w]);
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { zIndex: top ? 10 : 0, bottom: CARD_BOTTOM_GAP },
      ]}
      pointerEvents={top ? "box-none" : "none"}
      // Under the top card: a screen reader reads only the top card.
      accessibilityElementsHidden={!top}
      importantForAccessibility={top ? "auto" : "no-hide-descendants"}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transformOrigin: CARD_PIVOT,
          },
          style,
        ]}
      >
        <SwipeCard
          item={item}
          interactive={top}
          minimal={!full}
          onInfoTop={setInfoTop}
          photo={photo}
          onPhoto={setPhoto}
        />
        {top && armed && !reduced ? (
          <Wash tx={tx} ty={ty} w={w} h={h} quiet={undoing} />
        ) : null}
        {top && armed ? (
          <Stamps
            tx={tx}
            ty={ty}
            w={w}
            h={h}
            reduced={reduced}
            quiet={undoing}
          />
        ) : null}
      </Animated.View>
      {/* The arrow sits OUTSIDE the GestureDetector so its tap reaches onPress
          (on web a Pan gesture swallows taps on its own children), in a layer
          that moves and fades with the card. The next card draws its arrow
          too (under the top card), so the arrow stays put through a swipe
          instead of appearing once the card is on top (user 2026-11-18). */}
      {role !== "peek" ? (
        <Animated.View
          pointerEvents={top ? "box-none" : "none"}
          style={[
            StyleSheet.absoluteFill,
            { transformOrigin: CARD_PIVOT, zIndex: 20 },
            style,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Vis mer om opplevelsen"
            onPress={() => onExpand(item, photo, setPhoto)}
            style={{
              position: "absolute",
              // Fall back to a fixed offset until the first onLayout lands.
              ...(infoTop != null
                ? { top: infoTop }
                : { bottom: SWIPE_INFO_BOTTOM + 48 }),
              right: ARROW_RIGHT,
              height: ARROW,
              width: ARROW,
              borderRadius: ARROW / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: media.scrimStrong,
            }}
          >
            {/* An up arrow in a dark circle opens the full page (user
                2026-11-18, over the founder's 2026-11-06 "no arrows on
                buttons" for this one button). */}
            <Icon name="information" size="md" tone="onMedia" />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
});

// The card swings about its centre; the grab sign (onBegin) makes a card held
// low swing the other way, as the reference does.
const CARD_PIVOT = "50% 50%";
// The open-page arrow: its size and its inset from the card's right edge.
const ARROW = 32;
const ARROW_RIGHT = 16;

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
  quiet,
}: {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  w: number;
  h: number;
  quiet: SharedValue<number>;
}) {
  const colors = useThemeColors();
  const vDenom = (h > 0 ? h : 480) * VERT_DAMPED;
  const hDenom = (w > 0 ? w : 360) * G.swipeWashRatio;
  const likeW = useAnimatedStyle(() => ({
    opacity:
      (1 - quiet.value) *
      WASH_MAX *
      Math.min(1, Math.max(0, tx.value) / hDenom),
  }));
  const nopeW = useAnimatedStyle(() => ({
    opacity:
      (1 - quiet.value) *
      WASH_MAX *
      Math.min(1, Math.max(0, -tx.value) / hDenom),
  }));
  const saveW = useAnimatedStyle(() => ({
    opacity:
      (1 - quiet.value) *
      WASH_MAX *
      Math.min(1, Math.max(0, -ty.value) / vDenom),
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: CARD_RADIUS,
            backgroundColor: colors.ember,
            opacity: 0,
          },
          likeW,
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: CARD_RADIUS,
            backgroundColor: media.black,
            opacity: 0,
          },
          nopeW,
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: CARD_RADIUS,
            backgroundColor: media.onMedia,
            opacity: 0,
          },
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
  quiet,
}: {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  w: number;
  h: number;
  reduced: boolean;
  quiet: SharedValue<number>;
}) {
  const colors = useThemeColors();
  const vDenom = (h > 0 ? h : 480) * VERT_DAMPED;
  const topY = (h > 0 ? h : 760) * 0.13; // stamps sit high, under the top bar
  // Each glyph fades in with the drag ratio and eases up to full size as it
  // approaches the commit threshold, so the feedback reads before release. Per
  // the reference each stamp sits in its OWN corner — like at top-left, nope at
  // top-right, save at bottom-center — not all stacked in the middle. Under
  // reduced motion the glyph still fades in but does not scale (F12).
  const like = useAnimatedStyle(() => {
    const p = stampOpacity(tx.value, w, G.swipeStampStart, G.swipeStampRamp);
    return {
      opacity: p * (1 - quiet.value),
      transform: [{ scale: reduced ? 1 : STAMP_FROM + (1 - STAMP_FROM) * p }],
    };
  });
  const nope = useAnimatedStyle(() => {
    const p = stampOpacity(-tx.value, w, G.swipeStampStart, G.swipeStampRamp);
    return {
      opacity: p * (1 - quiet.value),
      transform: [{ scale: reduced ? 1 : STAMP_FROM + (1 - STAMP_FROM) * p }],
    };
  });
  const save = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, -ty.value / vDenom));
    return {
      opacity: p * (1 - quiet.value),
      transform: [{ scale: reduced ? 1 : STAMP_FROM + (1 - STAMP_FROM) * p }],
    };
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
  item,
  onClose,
}: {
  item: DeckItem | null;
  onClose: () => void;
}) {
  const close = onClose;
  const join = () => {
    if (!item) return;
    onClose();
    if (item.chatId) {
      joinChat(item.chatId);
      const id = item.chatId;
      setTimeout(() => router.push(`/chat/${id}` as Href), 260);
    } else {
      showToastAfterSheet(confirmToast.joinedChat);
    }
  };
  return (
    <Sheet visible={item !== null} onClose={close} title="Bli med i samtalen">
      {item ? (
        <View className="gap-3">
          <Text variant="body" weight="semibold">
            {item.title}
          </Text>
          <Text variant="caption" tone="muted">
            {item.subtitle}
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

// The one-time gesture hint: what a swipe does, then "Skjønner".
function SwipeHint({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const rows: { icon: IconName; text: string }[] = [
    { icon: "heart", text: "Sveip til høyre hvis du liker det" },
    { icon: "close", text: "Til venstre for å hoppe over" },
    { icon: "bookmark-outline", text: "Opp for å lagre" },
    { icon: "images-outline", text: "Trykk på bildet for flere bilder" },
  ];
  return (
    <View
      pointerEvents="box-none"
      className="items-center justify-center px-8"
      style={[StyleSheet.absoluteFill, { zIndex: 40, elevation: 40 }]}
    >
      <Animated.View
        entering={reduced ? undefined : FadeIn.duration(motion.duration.base)}
        style={{ width: "100%", maxWidth: 360 }}
      >
        <View className="gap-3 rounded-lg bg-surface p-6" style={elevation.e3}>
          <Text variant="title" weight="semibold" accessibilityRole="header">
            Slik sveiper du
          </Text>
          {rows.map((r) => (
            <View key={r.text} className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-surfaceMuted">
                <Icon
                  name={r.icon}
                  size="md"
                  tone={r.icon === "heart" ? "ember" : "ink"}
                />
              </View>
              <Text variant="body" className="flex-1">
                {r.text}
              </Text>
            </View>
          ))}
          <Button label="Skjønner" size="sm" onPress={onDone} />
        </View>
      </Animated.View>
    </View>
  );
}

const NO_SAVED: readonly string[] = [];

// Sveip's Filtre with its own open state: opening it renders this and the
// sheet, not the deck. The deck opens it through `openRef`.
const DeckFiltre = memo(function DeckFiltre({
  openRef,
  filters,
  count,
  onApply,
}: {
  openRef: { current: (() => void) | null };
  filters: MapFilters;
  count: (draft: MapFilters) => number;
  onApply: (next: MapFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    openRef.current = () => setOpen(true);
    return () => {
      openRef.current = null;
    };
  }, [openRef]);
  const close = useCallback(() => setOpen(false), []);
  const apply = useCallback(
    (next: MapFilters) => {
      onApply(next);
      setOpen(false);
    },
    [onApply],
  );
  return (
    <MapFilterSheet
      visible={open}
      filters={filters}
      mode="forYou"
      savedIds={NO_SAVED}
      count={count}
      onClose={close}
      onApply={apply}
    />
  );
});
