import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { colors } from "@/theme";

type IconName = keyof typeof Ionicons.glyphMap;

// Generic empty/error state. Centered icon + message + optional action.
export function StateView({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  tone = "muted",
}: {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "muted" | "danger";
}) {
  const iconColor = tone === "danger" ? colors.danger : colors.muted;
  return (
    <View className="flex-1 items-center justify-center gap-3 p-gutter">
      <Ionicons name={icon} size={44} color={iconColor} />
      <Text className="text-center text-lg font-semibold text-ink">
        {title}
      </Text>
      {message ? (
        <Text className="max-w-xs text-center text-sm text-muted">
          {message}
        </Text>
      ) : null}
      {actionLabel ? (
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
