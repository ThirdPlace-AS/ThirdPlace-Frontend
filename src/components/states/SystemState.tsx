// One system page (review 2026-11-18 PR-05): offline, error, maintenance,
// update and "Fant ikke siden" share one layout and one voice. A back arrow
// when there is somewhere to go back to, the illustration from the set (or an
// icon disc), an h1, one line on what still works, one ink action and an
// optional text action. No screen promises a time or a cause (CLAUDE.md
// governance). The crash screen copies this layout by hand: it replaces the
// root layout, so it has none of these providers.
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import {
  Illustration,
  type IllustrationName,
} from "@/components/illustrations/Illustration";
import {
  BACK_ICON,
  Button,
  Icon,
  IconButton,
  Screen,
  Text,
  type IconName,
} from "@/components/ui";
import { goBackOr } from "@/lib/navigation";

export type SystemAction = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function SystemState({
  art,
  icon = "help-circle-outline",
  title,
  body,
  action,
  secondary,
  back,
}: {
  /** The illustration (offline, error, maintenance, update); else `icon`. */
  art?: IllustrationName;
  icon?: IconName;
  title: string;
  /** One line: what still works, or what to do. */
  body: string;
  action?: SystemAction;
  /** A quieter way out, drawn as a text button. */
  secondary?: SystemAction;
  /** Show the back arrow (default: when there is a page to go back to). */
  back?: boolean;
}) {
  const showBack = back ?? router.canGoBack();
  return (
    <Screen edges={["top", "bottom"]}>
      <View className="h-12 flex-row items-center px-2">
        {showBack ? (
          <IconButton
            icon={BACK_ICON}
            label="Tilbake"
            onPress={() => goBackOr()}
          />
        ) : null}
      </View>
      <ScrollView contentContainerClassName="flex-grow items-center justify-center gap-6 px-gutter pb-12">
        {art ? (
          <Illustration name={art} width={240} />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceMuted">
            <Icon name={icon} size="2xl" tone="ink" />
          </View>
        )}
        <View className="max-w-sm items-center gap-2">
          <Text
            variant="h1"
            weight="bold"
            className="text-center"
            accessibilityRole="header"
          >
            {title}
          </Text>
          <Text variant="body" tone="muted" className="text-center">
            {body}
          </Text>
        </View>
        {action || secondary ? (
          <View className="w-full max-w-sm gap-2">
            {action ? (
              <Button
                label={action.label}
                variant="ink"
                fullWidth
                loading={action.loading}
                onPress={action.onPress}
              />
            ) : null}
            {secondary ? (
              <Button
                label={secondary.label}
                variant="ghost"
                fullWidth
                loading={secondary.loading}
                onPress={secondary.onPress}
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
