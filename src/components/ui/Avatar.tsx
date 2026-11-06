// Avatar (docs/design/DESIGN_SYSTEM.md §4) — photo or initials in a circle,
// token sizes only. `name` gives the accessible label and the initials fallback.
import { Image, type ImageProps } from "expo-image";
import { View } from "react-native";

import type { IconSize } from "@/theme";

import { Icon, type IconName } from "./Icon";
import { Text, type TextVariant } from "./Text";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const PX: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 88,
};
const ICON: Record<AvatarSize, IconSize> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};
const TEXT: Record<AvatarSize, TextVariant> = {
  xs: "micro",
  sm: "caption",
  md: "label",
  lg: "title",
  xl: "h1",
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  initials,
  source,
  icon,
  size = "md",
  decorative = false,
}: {
  /** Person/place name: accessible label + initials fallback. */
  name?: string;
  /** Explicit initials (overrides the ones derived from `name`). */
  initials?: string;
  source?: ImageProps["source"];
  /** Glyph instead of initials (a place or experience chat), same size. */
  icon?: IconName;
  size?: AvatarSize;
  /** Hide from screen readers when the name is already read next to it. */
  decorative?: boolean;
}) {
  const px = PX[size];
  const a11y = decorative
    ? {
        accessible: false,
        importantForAccessibility: "no-hide-descendants" as const,
      }
    : {
        accessible: true,
        accessibilityRole: "image" as const,
        accessibilityLabel: name,
      };
  return (
    <View
      {...a11y}
      className="items-center justify-center overflow-hidden rounded-full bg-surfaceMuted"
      style={{ width: px, height: px }}
    >
      {source ? (
        <Image
          source={source}
          contentFit="cover"
          // Faces sit in the upper part of portrait photos; a centred crop
          // of a full-body shot shrank the face to a dot.
          contentPosition="top"
          transition={150}
          style={{ width: px, height: px }}
        />
      ) : icon ? (
        <Icon name={icon} size={ICON[size]} tone="ink" />
      ) : (
        <Text variant={TEXT[size]} weight="semibold">
          {initials ?? (name ? initialsOf(name) : "")}
        </Text>
      )}
    </View>
  );
}
