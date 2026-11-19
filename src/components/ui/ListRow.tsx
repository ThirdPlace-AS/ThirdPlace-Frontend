// Rows (docs/design/DESIGN_SYSTEM.md §4).
//
//   <MetaRow>  icon + one line of meta text (address, time, capacity).
//   <ListRow>  leading (icon/avatar) · title/subtitle · trailing (value,
//              chevron or custom). Pressable when `onPress` is set. "card"
//              is a bordered surface; "plain" sits in a grouped list.
import type { ReactNode } from "react";
import { View } from "react-native";

import { haptics } from "@/lib/haptics";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text, type TextTone } from "./Text";

export function MetaRow({
  icon,
  text,
  tone = "default",
  numberOfLines,
}: {
  icon: IconName;
  text: string;
  /** "media" = light text over photos. */
  tone?: "default" | "media";
  numberOfLines?: number;
}) {
  const media = tone === "media";
  return (
    <View className="flex-row items-center gap-sm">
      <Icon name={icon} size="sm" tone={media ? "onMedia" : "muted"} />
      <Text
        variant={media ? "label" : "caption"}
        tone={media ? "onMedia" : "ink"}
        numberOfLines={numberOfLines}
        className="flex-1"
      >
        {text}
      </Text>
    </View>
  );
}

export type ListRowVariant = "plain" | "card";

export function ListRow({
  title,
  subtitle,
  subtitleTone = "muted",
  leading,
  icon,
  value,
  trailing,
  chevron,
  onPress,
  onLongPress,
  variant = "plain",
  danger = false,
  accessibilityLabel,
  accessibilityHint,
}: {
  title: string;
  subtitle?: string;
  subtitleTone?: TextTone;
  /** Custom leading node, e.g. <Avatar />. */
  leading?: ReactNode;
  /** Shorthand leading icon. */
  icon?: IconName;
  /** Short trailing value ("På", "Norsk"). */
  value?: string;
  /** Custom trailing node (button, switch …). */
  trailing?: ReactNode;
  /** Show a chevron (defaults to on when the row is pressable). */
  chevron?: boolean;
  onPress?: () => void;
  /** Quick actions (Phase 18). Also offered to screen readers as the
   *  "Flere valg" action, since a long press is hard to find there. */
  onLongPress?: () => void;
  variant?: ListRowVariant;
  /** Destructive row (e.g. "Slett konto"). */
  danger?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const showChevron = chevron ?? !!onPress;
  const shell =
    variant === "card"
      ? "flex-row items-center gap-md rounded-lg border border-line bg-surface p-md"
      : "flex-row items-center gap-md px-gutter py-md";
  const body = (
    <>
      {leading ??
        (icon ? (
          <Icon name={icon} size="md" tone={danger ? "ember" : "ink"} />
        ) : null)}
      <View className="flex-1 gap-0.5">
        <Text
          variant="body"
          weight={variant === "card" ? "semibold" : "regular"}
          tone={danger ? "ember" : "ink"}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone={subtitleTone} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="caption" tone="muted">
          {value}
        </Text>
      ) : null}
      {trailing}
      {showChevron ? (
        <Icon name="chevron-forward" size="md" tone="muted" />
      ) : null}
    </>
  );
  if (!onPress) return <View className={shell}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      // A long press opens the row's menu with the platform's long-press
      // tick (user 2026-11-09); a screen reader's "Flere valg" stays silent.
      onLongPress={
        onLongPress
          ? () => {
              haptics.longPress();
              onLongPress();
            }
          : undefined
      }
      delayLongPress={320}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityActions={
        onLongPress ? [{ name: "longpress", label: "Flere valg" }] : undefined
      }
      onAccessibilityAction={
        onLongPress
          ? (e) => {
              if (e.nativeEvent.actionName === "longpress") onLongPress();
            }
          : undefined
      }
      pressedScale={0.99}
      contentClassName={shell}
    >
      {body}
    </Pressable>
  );
}
