// Headers (docs/design/DESIGN_SYSTEM.md §4) — one back style everywhere
// (outlined round chevron IconButton, as on every PDF screen), titles from the
// type scale.
//
//   <Header>       pushed route screens: back · title · trailing actions
//   <TitleBlock>   large title + subtitle (auth, tab roots), optional back above
//   <StepHeader>   wizards: back · "N av M" · segmented progress
//   <StepContent>  wizard step body: large title + subtitle + content
import { router } from "expo-router";
import type { ReactNode } from "react";
import { View } from "react-native";

import { IconButton } from "./IconButton";
import { Text } from "./Text";

const goBack = () => router.back();

export function Header({
  title,
  onBack = goBack,
  back,
  trailing,
  border,
  size = "default",
  inset = true,
}: {
  title: string;
  /** Defaults to router.back(). */
  onBack?: () => void;
  /** Show the back button (default: on for "default", off for "large"). */
  back?: boolean;
  /** Right-aligned actions, usually IconButtons. */
  trailing?: ReactNode;
  /** Hairline under the header (default: on for "default", off for "large"). */
  border?: boolean;
  /** "large" = tab-root title (h1), e.g. Chat, Profil. */
  size?: "default" | "large";
  /** Apply the screen gutter (off when the parent is already padded). */
  inset?: boolean;
}) {
  const large = size === "large";
  const showBack = back ?? !large;
  const showBorder = border ?? !large;
  return (
    <View
      className={`min-h-12 flex-row items-center gap-md ${inset ? "px-gutter" : ""} ${
        showBorder ? "border-b border-line pb-md" : ""
      }`}
    >
      {showBack ? (
        <IconButton
          icon="chevron-back"
          label="Tilbake"
          variant="outline"
          onPress={onBack}
        />
      ) : null}
      <Text variant={large ? "h1" : "h2"} numberOfLines={1} className="flex-1">
        {title}
      </Text>
      {trailing ? (
        <View className="flex-row items-center gap-xs">{trailing}</View>
      ) : null}
    </View>
  );
}

export function TitleBlock({
  title,
  subtitle,
  back = false,
  onBack = goBack,
  size = "h1",
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  size?: "display" | "h1";
}) {
  return (
    <View className="gap-md">
      {back ? (
        <IconButton
          icon="chevron-back"
          label="Tilbake"
          variant="outline"
          onPress={onBack}
        />
      ) : null}
      <View className="gap-xs">
        <Text variant={size}>{title}</Text>
        {subtitle ? (
          <Text variant="body" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function StepHeader({
  current,
  total,
  onBack,
  label,
  showProgress = true,
}: {
  /** 0-based index of the current step. */
  current: number;
  total: number;
  onBack: () => void;
  /** Counter text; defaults to "<n> av <total>". */
  label?: string;
  showProgress?: boolean;
}) {
  const text = label ?? `${current + 1} av ${total}`;
  return (
    <View className="gap-md px-gutter pb-sm pt-xs">
      <View className="flex-row items-center justify-between">
        <IconButton
          icon="chevron-back"
          label="Tilbake"
          variant="outline"
          onPress={onBack}
        />
        {showProgress ? (
          <Text variant="caption" weight="medium" tone="muted">
            {text}
          </Text>
        ) : null}
      </View>
      {showProgress ? (
        <View
          className="flex-row gap-1.5"
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={text}
          accessibilityValue={{ min: 0, max: total, now: current + 1 }}
        >
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= current ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function StepContent({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-gutter">
      <TitleBlock title={title} subtitle={subtitle} size="display" />
      {children}
    </View>
  );
}
