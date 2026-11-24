import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { motion, media } from "@/theme";

import { buttonProgress, saveButtonProgress, upDragLeads } from "./deckLogic";

const G = motion.gesture;

// The deck's 5-button action row, floating over the card's dark foot (as the
// reference). Discs are solid, a step lighter than the foot, with no ring;
// rewind, save and share are small, the X and heart large. Rewind's glyph is
// grey while there is nothing to undo and white once there is. Every glyph rests white except the ember heart (PDF p7). As you drag,
// the disc for the drag direction fills and its glyph inverts (ink X on a nope
// drag, white heart on a like drag, ink bookmark on an up/save drag). Rewind and
// share flash ember on press. The save slot keeps the BOOKMARK (ThirdPlace SAVES,
// no superlike/match). Share opens the device share sheet with the card title
// (local, no backend).
const REST = media.disc;
const PRESS = media.discPressed; // rewind/share while pressed
const INK = media.inkOnLight; // inverted glyph on a light fill
const DIM = media.onMediaDisabled; // rewind glyph when there's nothing to undo
const SAVE = media.surface; // neutral light fill when save commits
const LIKE = media.ember; // ember (brand) — like / join: resting heart + fill
// PDF p7: every action glyph rests white except the ember heart — no
// off-palette accents.
const ACCENT_BLUE = media.onMedia; // resting bookmark + paper-plane
const UNDO_ACCENT = LIKE; // rewind / share flash ember on press

// Per-button sizing measured on the reference (2026-11-18): X + heart large,
// rewind/save/send small, every disc centred in an equal slot (69 dp pitch,
// narrower on a small phone) so the centres are evenly spaced.
const SIZE_SM = 48; // rewind + save + share
const SIZE_LG = 64; // nope (skip) + like (join)
const SLOT = 69; // centre-to-centre pitch
/** Height of the action row, for the card footer that holds it. */
export const SWIPE_ACTIONS_HEIGHT = SIZE_LG;
// The band at the foot of the deck that holds the row (measured on the
// reference 2026-11-18: ~100 dp, the large discs end 14 dp above the tab bar).
// It sits above the tab bar, which owns the bottom inset, so no inset here.
export const SWIPE_PANEL_PAD_TOP = 22;
export const SWIPE_PANEL_PAD_BOTTOM = 14;
/** Height of the row's band; the card's info block ends above it. */
export const SWIPE_PANEL_HEIGHT =
  SWIPE_PANEL_PAD_TOP + SWIPE_ACTIONS_HEIGHT + SWIPE_PANEL_PAD_BOTTOM;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function disc(size: number) {
  return {
    height: size,
    width: size,
    borderRadius: size / 2,
    alignItems: "center",
    justifyContent: "center",
  } as const;
}

// A disc whose fill + glyph react to a drag "progress" (0→1) driven by the pan:
// the base glyph (accent on the translucent disc) cross-fades to the inverted
// glyph as the disc fills with `fill`.
function ReactiveButton({
  progress,
  fill,
  size,
  iconSize,
  icon,
  baseColor,
  overIcon,
  overColor,
  reduced,
  label,
  onPress,
  selected,
}: {
  progress: SharedValue<number>;
  fill: string;
  size: number;
  iconSize: number;
  icon: keyof typeof Ionicons.glyphMap;
  baseColor: string;
  overIcon: keyof typeof Ionicons.glyphMap;
  overColor: string;
  reduced: boolean;
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const discStyle = useAnimatedStyle(() => ({
    backgroundColor: reduced
      ? REST
      : interpolateColor(progress.value, [0, 1], [REST, fill]),
  }));
  const over = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : progress.value,
  }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected != null ? { selected } : undefined}
      onPress={onPress}
      style={[disc(size), discStyle]}
    >
      {/* raw-icon: animated colour cross-fade between two glyphs (Reanimated) */}
      <Ionicons name={icon} size={iconSize} color={baseColor} />
      <Animated.View style={[{ position: "absolute" }, over]}>
        {/* raw-icon: overlay glyph of the cross-fade */}
        <Ionicons name={overIcon} size={iconSize} color={overColor} />
      </Animated.View>
    </AnimatedPressable>
  );
}

// A neutral disc (rewind/share) that flashes its accent while pressed.
function FlashButton({
  size,
  iconSize,
  icon,
  color,
  pressColor,
  label,
  onPress,
  disabled,
}: {
  size: number;
  iconSize: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  pressColor: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  // Static style ARRAY (not a function) so the disc background renders reliably —
  // a function `style` on Pressable dropped the backgroundColor on native, leaving
  // rewind/share as bare glyphs. Press feedback is tracked by state instead.
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      // Keep the disc visible even when disabled (dim only the glyph) so all five
      // discs always read, as in the reference.
      style={[disc(size), { backgroundColor: pressed ? PRESS : REST }]}
    >
      {/* raw-icon: pressed-state colour from the press callback */}
      <Ionicons
        name={icon}
        size={iconSize}
        color={disabled ? DIM : pressed ? pressColor : color}
      />
    </Pressable>
  );
}

export function SwipeActions({
  onUndo,
  onNope,
  onSave,
  onLike,
  onShare,
  canUndo,
  saved,
  tx,
  ty,
  held,
  hx,
  hy,
  w,
  h,
  reduced,
  details = false,
}: {
  onUndo: () => void;
  onNope: () => void;
  onSave: () => void;
  onLike: () => void;
  onShare: () => void;
  canUndo: boolean;
  saved: boolean;
  // Drag signals from the deck so the action discs react/fill with the swipe
  // (held at the release value while the card flies off or springs back).
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  /** 1 from release until the card has flown off or sprung back: the discs
   *  read `hx`/`hy` (the drag at release) instead of `tx`/`ty`. */
  held: SharedValue<number>;
  hx: SharedValue<number>;
  hy: SharedValue<number>;
  w: number;
  h: number;
  reduced: boolean;
  /** The details are open: rewind and share leave in one frame and their
   *  slots stay empty, so X, save and like keep their places (as the
   *  reference). */
  details?: boolean;
}) {
  // Per-direction drag progress (0→1). The disc answers the moment the card
  // moves, then creeps to full (measured on the reference). Only the
  // direction that leads lights up (user 2026-11-24): an up drag drifts a
  // little sideways, and that drift must not fill X or the heart.
  const upLeads = useDerivedValue(() =>
    upDragLeads(
      held.value ? hx.value : tx.value,
      held.value ? hy.value : ty.value,
      G.swipeVertDamp,
    ),
  );
  const like = useDerivedValue(() =>
    upLeads.value
      ? 0
      : buttonProgress(
          held.value ? hx.value : tx.value,
          w,
          G.swipeButtonSnap,
          G.swipeButtonRamp,
        ),
  );
  const nope = useDerivedValue(() =>
    upLeads.value
      ? 0
      : buttonProgress(
          -(held.value ? hx.value : tx.value),
          w,
          G.swipeButtonSnap,
          G.swipeButtonRamp,
        ),
  );
  const save = useDerivedValue(() =>
    upLeads.value
      ? saveButtonProgress(
          -(held.value ? hy.value : ty.value),
          w,
          h,
          G.swipeButtonSnap,
          G.swipeVertCommitRatio * G.swipeVertDamp,
        )
      : 0,
  );

  // Centered row of five equal slots, each disc centred in its slot, so the
  // centres sit an even pitch apart whatever the disc size (as the reference).
  // A phone narrower than 5 × SLOT + 16 shrinks the pitch, never the discs.
  const slot = w > 0 ? Math.min(SLOT, Math.floor((w - 16) / 5)) : SLOT;
  const slotStyle = {
    width: slot,
    alignItems: "center",
    justifyContent: "center",
  } as const;
  return (
    <View
      pointerEvents="box-none"
      className="flex-row items-center justify-center"
    >
      {/* Rewind — small; flashes ember on press (dims when nothing to undo). */}
      <View pointerEvents="box-none" style={slotStyle}>
        {details ? null : (
          <FlashButton
            size={SIZE_SM}
            iconSize={22}
            icon="refresh"
            color={media.onMedia}
            pressColor={UNDO_ACCENT}
            label="Angre"
            onPress={onUndo}
            disabled={!canUndo}
          />
        )}
      </View>

      {/* Nope — large; fills white, X inverts to ink. */}
      <View pointerEvents="box-none" style={slotStyle}>
        <ReactiveButton
          progress={nope}
          fill={media.onMedia}
          size={SIZE_LG}
          iconSize={36}
          icon="close"
          baseColor={media.onMedia}
          overIcon="close"
          overColor={INK}
          reduced={reduced}
          label="Hopp over"
          onPress={onNope}
        />
      </View>

      {/* Save — small; fills light, bookmark inverts to ink. */}
      <View pointerEvents="box-none" style={slotStyle}>
        <ReactiveButton
          progress={save}
          fill={SAVE}
          size={SIZE_SM}
          iconSize={24}
          icon={saved ? "bookmark" : "bookmark-outline"}
          baseColor={ACCENT_BLUE}
          overIcon="bookmark"
          overColor={INK}
          reduced={reduced}
          label={saved ? "Lagret" : "Lagre"}
          selected={saved}
          onPress={onSave}
        />
      </View>

      {/* Like — large; a solid ember heart; the disc fills ember and the heart
          turns white. */}
      <View pointerEvents="box-none" style={slotStyle}>
        <ReactiveButton
          progress={like}
          fill={LIKE}
          size={SIZE_LG}
          iconSize={34}
          icon="heart"
          baseColor={LIKE}
          overIcon="heart"
          overColor={media.onMedia}
          reduced={reduced}
          label="Bli med"
          onPress={onLike}
        />
      </View>

      {/* Share — small; the device share sheet; flashes ember on press. */}
      <View pointerEvents="box-none" style={slotStyle}>
        {details ? null : (
          <FlashButton
            size={SIZE_SM}
            iconSize={22}
            icon="paper-plane"
            color={ACCENT_BLUE}
            pressColor={UNDO_ACCENT}
            label="Del"
            onPress={onShare}
          />
        )}
      </View>
    </View>
  );
}
