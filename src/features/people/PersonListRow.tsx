// One person in a list (Følgere / Følger, Venner; PDF p13): photo, name and
// one line, opening the person's page, with an action at the end. The row is a
// View, so the action is a sibling of the pressable part, never nested in it
// (nested pressables are invalid DOM in the web bundle).
import type { ReactNode } from "react";
import { View } from "react-native";

import { Avatar, Pressable, Text } from "@/components/ui";
import type { MockPerson } from "@/fixtures";
import { libImage } from "@/fixtures/images";

export function PersonListRow({
  person,
  line,
  onPress,
  action,
}: {
  person: MockPerson;
  line: string;
  onPress: () => void;
  action: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${person.name}, ${line}`}
        onPress={onPress}
        pressedScale={0.99}
        className="flex-1"
        contentClassName="flex-row items-center gap-3"
      >
        <Avatar
          name={person.name}
          source={libImage(person.avatar)}
          size="md"
          decorative
        />
        <View className="flex-1">
          <Text variant="label" weight="semibold" numberOfLines={1}>
            {person.name}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {line}
          </Text>
        </View>
      </Pressable>
      {action}
    </View>
  );
}
