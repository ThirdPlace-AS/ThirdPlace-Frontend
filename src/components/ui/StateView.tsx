// StateView (docs/design/DESIGN_SYSTEM.md §4 "Empty / error") — centred
// illustration (or an outline icon in a soft disc, as in the PDF empty states),
// a title, one line of help and one or two actions. `illustration` is the slot
// the S11 art fills.
import type { ReactNode } from "react";
import { View } from "react-native";

import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export type StateTone = "muted" | "danger";

export type StateViewProps = {
  icon: IconName;
  /** Replaces the icon disc (S11 illustrations). */
  illustration?: ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  // Optional second action (PDF p8 empty deck: "Endre filtre" + "Utforsk
  // kartet"). With two actions the primary renders ink, the second outlined.
  secondaryLabel?: string;
  onSecondary?: () => void;
  tone?: StateTone;
  /** Fill the screen (default) or size to content (inside a card). */
  fill?: boolean;
};

export function StateView({
  icon,
  illustration,
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  tone = "muted",
  fill = true,
}: StateViewProps) {
  const danger = tone === "danger";
  return (
    <View
      className={`items-center justify-center gap-lg p-gutter ${fill ? "flex-1" : ""}`}
    >
      {illustration ?? (
        <View
          className={`h-20 w-20 items-center justify-center rounded-full ${
            danger ? "bg-danger/10" : "bg-surfaceMuted"
          }`}
        >
          <Icon name={icon} size="xl" tone={danger ? "danger" : "muted"} />
        </View>
      )}
      <View className="max-w-xs items-center gap-xs">
        <Text
          variant="title"
          weight="semibold"
          className="text-center"
          accessibilityRole="header"
        >
          {title}
        </Text>
        {message ? (
          <Text variant="label" tone="muted" className="text-center">
            {message}
          </Text>
        ) : null}
      </View>
      {actionLabel && secondaryLabel ? (
        <View className="w-full max-w-xs gap-md">
          <Button
            label={actionLabel}
            variant="ink"
            fullWidth
            onPress={onAction}
          />
          <Button
            label={secondaryLabel}
            variant="secondary"
            fullWidth
            onPress={onSecondary}
          />
        </View>
      ) : actionLabel ? (
        // PDF p26: one compact ink pill, centred.
        <View className="flex-row justify-center">
          <Button
            label={actionLabel}
            variant="ink"
            rounded="full"
            size="sm"
            fullWidth={false}
            onPress={onAction}
          />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyState(props: Omit<StateViewProps, "tone">) {
  return <StateView {...props} tone="muted" />;
}

export function ErrorState(
  props: Omit<StateViewProps, "tone" | "icon"> & { icon?: IconName },
) {
  return (
    <StateView
      {...props}
      icon={props.icon ?? "alert-circle-outline"}
      tone="danger"
    />
  );
}
