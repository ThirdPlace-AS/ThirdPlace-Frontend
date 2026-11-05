// IconButton (docs/design/DESIGN_SYSTEM.md §4) — the one round icon control.
// Replaces the ad-hoc `h-9/h-10 w-9/w-10 rounded-full` buttons across screens.
// Always ≥ 44×44 touchable (hitSlop tops up smaller visuals), always labelled,
// optional badge (dot or count) for unread markers.
import { View } from "react-native";

import { elevation } from "@/theme";

import { Icon, type IconName, type IconTone } from "./Icon";
import { Pressable, type PressHaptic } from "./Pressable";
import { Text } from "./Text";

export type IconButtonVariant =
  | "ghost" // transparent; pressed tint (headers, toolbars)
  | "outline" // surface + hairline (onboarding/back on light screens)
  | "filled" // surfaceMuted fill
  | "ink" // primary round action (FAB)
  | "ember" // brand round action
  | "floating" // raised surface over map/photos (e2 shadow)
  | "media"; // translucent dark disc over photos, light glyph

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

// Literal class names so Tailwind generates them.
const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  ghost: "active:bg-surfaceMuted",
  outline: "border border-line bg-surface",
  filled: "bg-surfaceMuted",
  ink: "bg-ink",
  ember: "bg-ember",
  floating: "bg-surfaceRaised",
  media: "bg-scrim/40",
};
const VARIANT_TONE: Record<IconButtonVariant, IconTone> = {
  ghost: "ink",
  outline: "ink",
  filled: "ink",
  ink: "onInk",
  ember: "onEmber",
  floating: "ink",
  media: "onMedia",
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
  disabled?: boolean;
  haptic?: PressHaptic;
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
  disabled,
  haptic = "none",
  className,
  testID,
}: IconButtonProps) {
  const px = SIZE_PX[size];
  const slop = Math.max(0, Math.ceil((MIN_TARGET - px) / 2));
  const count = typeof badge === "number" && badge > 0 ? badge : null;
  const showBadge = badge === true || count !== null;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={count !== null ? `${label}, ${count} uleste` : label}
      accessibilityState={selected != null ? { selected } : undefined}
      onPress={onPress}
      disabled={disabled}
      haptic={haptic}
      hitSlop={slop}
      pressedScale={0.92}
      className={`items-center justify-center rounded-full ${VARIANT_CLASS[variant]}${
        className ? ` ${className}` : ""
      }`}
      style={[
        { width: px, height: px },
        variant === "floating" || variant === "ink" || variant === "ember"
          ? elevation.e2
          : null,
      ]}
    >
      <Icon
        name={icon}
        size={GLYPH[size]}
        tone={tone ?? VARIANT_TONE[variant]}
      />
      {showBadge ? (
        <View
          pointerEvents="none"
          className={`absolute items-center justify-center rounded-full border-2 border-surface bg-ember ${
            count !== null ? "-right-1 -top-1 px-xs" : "right-1 top-1"
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
