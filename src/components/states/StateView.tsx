import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { useThemeColors } from "@/theme";

type IconName = keyof typeof Ionicons.glyphMap;

// Generic empty/error state. Centered icon + message + optional action.
export function StateView({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  tone = "muted",
}: {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  // Optional second action (PDF p8 empty deck: "Endre filtre" + "Utforsk
  // kartet"). With two actions the primary renders ink, the second outlined.
  secondaryLabel?: string;
  onSecondary?: () => void;
  tone?: "muted" | "danger";
}) {
  const colors = useThemeColors();
  const iconColor = tone === "danger" ? colors.danger : colors.muted;
  return (
    <View className="flex-1 items-center justify-center gap-3 p-gutter">
      <Ionicons name={icon} size={44} color={iconColor} />
      <Text className="text-center text-lg font-semibold text-ink">
        {title}
      </Text>
      {message ? (
        <Text className="max-w-xs text-center text-sm text-muted font-normal">
          {message}
        </Text>
      ) : null}
      {actionLabel && secondaryLabel ? (
        <View className="mt-2 w-full max-w-xs gap-3">
          <Button label={actionLabel} variant="ink" onPress={onAction} />
          <Button
            label={secondaryLabel}
            variant="secondary"
            onPress={onSecondary}
          />
        </View>
      ) : actionLabel ? (
        <View className="mt-2 w-48">
          <Button label={actionLabel} variant="secondary" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyState(
  props: Omit<Parameters<typeof StateView>[0], "tone">,
) {
  return <StateView {...props} tone="muted" />;
}

export function ErrorState(
  props: Omit<Parameters<typeof StateView>[0], "tone" | "icon">,
) {
  return <StateView {...props} icon="alert-circle-outline" tone="danger" />;
}
