import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { motion } from "@/theme";

const G = motion.gesture;

// Tinder-style 5-button action row, floating on the card's bottom gradient (no
// tray). Per the reference the discs are DARK + translucent at rest with COLORED
// glyphs; they are NOT all one size: rewind + send are small, the X + heart are
// large, save is medium. At rest the glyphs carry the reference's colors — white
// X, red heart outline, blue bookmark + paper-plane. As you drag, the disc for
// the drag direction fills with its accent and its glyph inverts (ink X on a nope
// drag, white heart on a like drag, ink bookmark on an up/save drag). Rewind +
// send are neutral but flash on press. The save slot keeps the BOOKMARK (ThirdPlace
// SAVES — no superlike/match), it is not the reference's star. Share opens the
// device share sheet with the card title (local, no backend).
const REST = "rgba(20,22,24,0.55)"; // translucent dark glass — lets each photo's own footer tint show through so the disc blends with the card instead of reading as a foreign grey chip, while staying dark enough that the colored glyphs keep contrast on any photo
const PRESS = "rgba(20,22,24,0.72)"; // same glass, denser while pressed (rewind/share)
const INK = "#202020"; // inverted glyph on a light fill
const DIM = "rgba(255,255,255,0.4)"; // rewind glyph when there's nothing to undo
const SAVE = "rgba(255,255,255,0.92)"; // neutral light fill when save commits
const LIKE = "#D80000"; // ember (brand) — like / join: resting heart + fill
const ACCENT_BLUE = "#4F8CFF"; // save language — resting bookmark + paper-plane
const UNDO_ACCENT = "#FFD166"; // rewind flashes amber on press

// Per-button sizing matched to the reference: X + heart large, rewind/save/send
// smaller, the glyphs filling a good share of the disc.
const SIZE_SM = 52; // rewind + share
const SIZE_MD = 54; // save
const SIZE_LG = 64; // nope (skip) + like (join)
const DISC_GAP = 16; // fixed edge-to-edge gap between discs (even cluster, G4)

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function disc(size: number) {
  return {
    height: size,
    width: size,
    borderRadius: size / 2,
    alignItems: "center",
    justifyContent: "center",
    // Hairline ring so the translucent glass disc reads as a distinct circle on
    // any footer — including a very dark one — without raising its fill.
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
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
      <Ionicons name={icon} size={iconSize} color={baseColor} />
      <Animated.View style={[{ position: "absolute" }, over]}>
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
  w,
  h,
  reduced,
}: {
  onUndo: () => void;
  onNope: () => void;
  onSave: () => void;
  onLike: () => void;
  onShare: () => void;
  canUndo: boolean;
  saved: boolean;
  // Drag signals from the deck so the action discs react/fill with the swipe.
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  w: number;
  h: number;
  reduced: boolean;
}) {
  // Per-direction drag progress (0→1 at the commit threshold).
  const like = useDerivedValue(() => {
    const d = w * G.swipeCommitRatio;
    return d > 0 ? Math.min(1, Math.max(0, tx.value / d)) : 0;
  });
  const nope = useDerivedValue(() => {
    const d = w * G.swipeCommitRatio;
    return d > 0 ? Math.min(1, Math.max(0, -tx.value / d)) : 0;
  });
  const save = useDerivedValue(() => {
    const d = (h > 0 ? h : 480) * G.swipeVertCommitRatio;
    return d > 0 ? Math.min(1, Math.max(0, -ty.value / d)) : 0;
  });

  // Centered cluster with a FIXED gap between discs, so the edge-to-edge spacing
  // is even regardless of per-disc diameter (equal-width flex slots gave the two
  // large discs tighter-looking gaps). Matches the reference's even row.
  return (
    <View
      className="flex-row items-center justify-center"
      style={{ gap: DISC_GAP }}
    >
      {/* Rewind — small; flashes amber on press (dims when nothing to undo). */}
      <FlashButton
        size={SIZE_SM}
        iconSize={25}
        icon="refresh"
        color="#FFFFFF"
        pressColor={UNDO_ACCENT}
        label="Angre"
        onPress={onUndo}
        disabled={!canUndo}
      />

      {/* Nope — large; fills white, X inverts to ink. */}
      <ReactiveButton
        progress={nope}
        fill="#FFFFFF"
        size={SIZE_LG}
        iconSize={38}
        icon="close"
        baseColor="#FFFFFF"
        overIcon="close"
        overColor={INK}
        reduced={reduced}
        label="Hopp over"
        onPress={onNope}
      />

      {/* Save — medium; fills light, bookmark inverts to ink. */}
      <ReactiveButton
        progress={save}
        fill={SAVE}
        size={SIZE_MD}
        iconSize={28}
        icon={saved ? "bookmark" : "bookmark-outline"}
        baseColor={ACCENT_BLUE}
        overIcon="bookmark"
        overColor={INK}
        reduced={reduced}
        label={saved ? "Lagret" : "Lagre"}
        selected={saved}
        onPress={onSave}
      />

      {/* Like — large; fills ember, heart fills white. */}
      <ReactiveButton
        progress={like}
        fill={LIKE}
        size={SIZE_LG}
        iconSize={36}
        icon="heart-outline"
        baseColor={LIKE}
        overIcon="heart"
        overColor="#FFFFFF"
        reduced={reduced}
        label="Bli med"
        onPress={onLike}
      />

      {/* Share — small; DEMO no-op; flashes amber on press. */}
      <FlashButton
        size={SIZE_SM}
        iconSize={24}
        icon="paper-plane-outline"
        color={ACCENT_BLUE}
        pressColor={UNDO_ACCENT}
        label="Del"
        onPress={onShare}
      />
    </View>
  );
}
