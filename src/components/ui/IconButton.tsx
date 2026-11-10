// IconButton (docs/design/DESIGN_SYSTEM.md §4) — the one round icon control.
// Replaces the ad-hoc `h-9/h-10 w-9/w-10 rounded-full` buttons across screens.
// Always ≥ 44×44 touchable (hitSlop tops up smaller visuals), always labelled,
// optional badge (dot or count) for unread markers.
import { ActivityIndicator, View } from "react-native";

import { elevation, useThemeColors } from "@/theme";

import { Icon, type IconName, type IconTone } from "./Icon";
import { PopIcon } from "./PopIcon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export type IconButtonVariant =
  | "ghost" // transparent; pressed tint (headers, toolbars)
  | "outline" // surface + hairline (onboarding/back on light screens)
  | "filled" // surfaceMuted fill
  | "ink" // primary round action (FAB)
  | "ember" // brand round action
  | "floating" // raised surface over map/photos (e2 shadow)
  | "media" // translucent dark disc over photos, light glyph
  | "mediaSubtle" // faint light disc on dark media surfaces (expanded card)
  | "mediaOutline"; // hairline ring on dark media surfaces

export type IconButtonSize = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<IconButtonSize, number> = {
  sm: 36,
  md: 40,
  lg: 48,
  xl: 56,
};
const GLYPH: Record<IconButtonSize, "md" | "lg"> = {
  sm: "md",
  md: "lg",
  lg: "lg",
  xl: "lg",
};
const MIN_TARGET = 44;

/** The one back glyph, on every back button (user 2026-11-09: "change the
 *  back arrow everywhere on the app to the same arrow the map details sheet
 *  uses"): the ← of the page top bar. Buttons keep their own shape (outlined
 *  circle on pages, plain in sheets and top bars). tests/designGuard.test.ts
 *  checks every "Tilbake" button uses it. */
export const BACK_ICON: IconName = "arrow-back";

// Literal class names so Tailwind generates them.
const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  ghost: "",
  outline: "border border-line bg-surface",
  filled: "bg-surfaceMuted",
  ink: "bg-ink",
  ember: "bg-ember",
  floating: "bg-surfaceRaised",
  media: "bg-scrim/40",
  mediaSubtle: "bg-onMedia/10",
  mediaOutline: "border border-onMedia/25",
};
const VARIANT_TONE: Record<IconButtonVariant, IconTone> = {
  ghost: "ink",
  outline: "ink",
  filled: "ink",
  ink: "onInk",
  ember: "onEmber",
  floating: "ink",
  media: "onMedia",
  mediaSubtle: "onMedia",
  mediaOutline: "onMedia",
};

export type IconButtonProps = {
  icon: IconName;
  /** Required: what the button does, in Norwegian ("Tilbake", "Varsler"). */
  label: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Override glyph tone (e.g. ember for an active state). */
  tone?: IconTone;
  /** `true` = dot, number = count (99+ capped). */
  badge?: boolean | number;
  selected?: boolean;
  /** Glyph pops when this turns true (like/save — see HeartToggle). */
  pop?: boolean;
  /** Working (e.g. Posisjon looking for the phone's position): a spinner in
   *  place of the glyph, announced as busy. The button stays pressable. */
  busy?: boolean;
  disabled?: boolean;
  /** Layout-only classes (position/margins), not colours. */
  className?: string;
  testID?: string;
};

export function IconButton({
  icon,
  label,
  onPress,
  variant = "ghost",
  size = "md",
  tone,
  badge,
  selected,
  pop,
  busy,
  disabled,
  className,
  testID,
}: IconButtonProps) {
  const c = useThemeColors();
  const px = SIZE_PX[size];
  const slop = Math.max(0, Math.ceil((MIN_TARGET - px) / 2));
  const count = typeof badge === "number" && badge > 0 ? badge : null;
  const showBadge = badge === true || count !== null;
  const glyphTone = tone ?? VARIANT_TONE[variant];
  const state =
    selected != null || busy
      ? { ...(selected != null ? { selected } : {}), ...(busy ? { busy } : {}) }
      : undefined;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={count !== null ? `${label}, ${count} uleste` : label}
      accessibilityState={state}
      onPress={onPress}
      disabled={disabled}
      hitSlop={slop}
      pressedScale={0.92}
      className={className}
      contentClassName={`items-center justify-center rounded-full ${VARIANT_CLASS[variant]}`}
      contentStyle={[
        { width: px, height: px },
        variant === "floating" || variant === "ink" || variant === "ember"
          ? elevation.e2
          : null,
      ]}
    >
      {busy ? (
        <ActivityIndicator
          size="small"
          color={glyphTone in c ? c[glyphTone as keyof typeof c] : c.ink}
        />
      ) : pop !== undefined ? (
        <PopIcon pop={pop} name={icon} size={GLYPH[size]} tone={glyphTone} />
      ) : (
        <Icon name={icon} size={GLYPH[size]} tone={glyphTone} />
      )}
      {showBadge ? (
        <View
          pointerEvents="none"
          className={`absolute items-center justify-center rounded-full border-2 border-surface ${
            count !== null
              ? "-right-1 -top-1 bg-emberStrong px-xs"
              : "right-1 top-1 bg-ember"
          }`}
          style={
            count !== null
              ? { minWidth: 20, height: 20 }
              : { width: 10, height: 10 }
          }
        >
          {count !== null ? (
            <Text
              variant="micro"
              tone="onEmber"
              weight="bold"
              className="normal-case"
            >
              {count > 99 ? "99+" : String(count)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
