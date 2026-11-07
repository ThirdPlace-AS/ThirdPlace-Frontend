import type { ImageProps } from "expo-image";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Avatar, Chip, Icon, ListRow, Text } from "@/components/ui";

export type PublicExperience = { id: string; title: string; when: string };

// What others see on a person page (PDF p13 "other user"): photo, name,
// handle, bio, interests and public experiences. PersonScreen adds Følg and
// Melding below it; Rediger profil's "Forhåndsvis" (Phase 18) shows the
// user's own unsaved draft with the same layout.
export function PersonProfileBody({
  name,
  avatar,
  meta,
  bio,
  interests,
  shared,
  hosted,
  onOpenExperience,
  actions,
}: {
  name: string;
  avatar?: ImageProps["source"];
  /** "@handle · area" for others; your own preview has the handle only. */
  meta?: string;
  bio: string;
  interests: readonly string[];
  /** Interests the viewer shares (marked). None on your own preview. */
  shared?: ReadonlySet<string>;
  hosted: readonly PublicExperience[];
  /** Opens an experience; without it the rows are not links (preview). */
  onOpenExperience?: (id: string) => void;
  /** Følg + Melding on someone else's page. */
  actions?: ReactNode;
}) {
  const sharedCount = shared?.size ?? 0;
  return (
    <>
      <View className="flex-row items-center gap-4">
        <Avatar name={name} source={avatar} size="xl" />
        <View className="flex-1 gap-1">
          <Text variant="h2" weight="bold">
            {name}
          </Text>
          {meta ? (
            <Text variant="caption" tone="muted">
              {meta}
            </Text>
          ) : null}
        </View>
      </View>

      {bio ? (
        <Text variant="label" weight="regular">
          {bio}
        </Text>
      ) : null}

      {interests.length > 0 ? (
        <View className="gap-2">
          <View className="flex-row flex-wrap gap-2">
            {interests.map((i) =>
              shared?.has(i) ? (
                <Chip key={i} label={i} icon="sparkles" selected />
              ) : (
                <Chip key={i} label={i} />
              ),
            )}
          </View>
          {sharedCount > 0 ? (
            <View className="flex-row items-center gap-1">
              <Icon name="sparkles" size="sm" tone="muted" />
              <Text variant="caption" tone="muted">
                Felles interesser
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {hosted.length > 0 ? (
        <View className="gap-2">
          <Text variant="title" accessibilityRole="header">
            Offentlige opplevelser
          </Text>
          {hosted.map((h) => (
            <ListRow
              key={h.id}
              icon="pricetag-outline"
              title={h.title}
              subtitle={`Vert · ${h.when}`}
              onPress={
                onOpenExperience ? () => onOpenExperience(h.id) : undefined
              }
            />
          ))}
        </View>
      ) : null}

      {actions}
    </>
  );
}
