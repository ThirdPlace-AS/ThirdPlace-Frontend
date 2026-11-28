// A chat's picture, larger (user 2026-11-26, after WhatsApp's chat list): a
// tap on a row's picture opens a card over the dimmed list with the chat's
// name on its picture and its actions underneath; a tap beside it, Android
// back or «Lukk» closes it. Only what the app has: open the chat and its info
// (no calls). The picture is the chat's own: the person's photo, the
// experience's, the place's or the group's, else its initials or glyph.
import { router, type Href } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Avatar,
  Icon,
  Overlay,
  Pressable as UIPressable,
  type Rect,
  Text,
  type IconName,
} from "@/components/ui";
import {
  experienceById,
  groups,
  personById,
  placeById,
  type MockChat,
} from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";
import { media, useScheme, useThemeColors } from "@/theme";

import { chatIcon } from "./ChatRow";

/** The chat's own picture, when it has one. */
export function chatPicture(chat: MockChat): ImageSourcePropType | undefined {
  if (chat.personId) {
    const avatar = personById(chat.personId)?.avatar;
    return avatar ? libImage(avatar) : undefined;
  }
  if (chat.pinnedExperienceId) {
    return experienceById(chat.pinnedExperienceId)?.photos[0];
  }
  if (chat.placeId) {
    const place = placeById(chat.placeId);
    return place ? libImage(coverForPlace(place)) : undefined;
  }
  const group = groups.find((g) => g.chatId === chat.id);
  return group ? libImage(group.cover) : undefined;
}

const SIDE = 280;

export function ChatPeek({
  chat,
  from,
  onClose,
}: {
  chat: MockChat | null;
  /** The tapped picture: the card grows out of it (user 2026-11-26). */
  from?: Rect | null;
  onClose: () => void;
}) {
  const dark = useScheme() === "dark";
  // The last chat stays drawn while the card fades out.
  const [shown, setShown] = useState(chat);
  if (chat && chat !== shown) setShown(chat);
  return (
    <Overlay
      visible={chat !== null}
      onClose={onClose}
      // Grows out of the tapped picture and shrinks back into it; the dim
      // fades on its own behind it.
      enter="zoom"
      from={from}
      backdrop={dark ? media.scrimStrong : media.scrim}
      statusBarTranslucent
      accessibilityLabel={shown ? `Bilde: ${shown.name}` : undefined}
    >
      {shown ? (
        <PeekCard chat={shown} icon={chatIcon(shown)} onClose={onClose} />
      ) : null}
    </Overlay>
  );
}

function PeekCard({
  chat,
  icon,
  onClose,
}: {
  chat: MockChat;
  icon?: IconName;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const picture = chatPicture(chat);
  const go = (href: Href) => {
    onClose();
    router.push(href);
  };
  return (
    <View
      className="flex-1 items-center"
      style={{ paddingTop: insets.top + 96 }}
    >
      {/* A tap beside the card closes (a sibling behind it; the Overlay's
          backdrop dims the list). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lukk"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      />
      <View
        className="overflow-hidden rounded-md"
        style={{ width: SIDE, backgroundColor: c.surface }}
      >
        <View style={{ width: SIDE, height: SIDE }}>
          {picture ? (
            <Image
              source={picture}
              contentFit="cover"
              style={{ width: SIDE, height: SIDE }}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-surfaceMuted">
              <Avatar
                name={chat.name}
                initials={chat.initials}
                icon={icon}
                size="xl"
                decorative
              />
            </View>
          )}
          <View className="absolute inset-x-0 top-0 bg-scrim/40 px-4 py-2">
            <Text
              variant="body"
              weight="semibold"
              tone="onMedia"
              numberOfLines={1}
            >
              {chat.name}
            </Text>
          </View>
        </View>
        <View className="flex-row border-t border-line">
          <PeekAction
            icon="chatbubble-outline"
            label="Åpne samtalen"
            onPress={() => go(`/chat/${chat.id}` as Href)}
          />
          <PeekAction
            icon="information-circle-outline"
            label="Info"
            onPress={() => go(`/chat/${chat.id}/info` as Href)}
          />
        </View>
      </View>
    </View>
  );
}

function PeekAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-1"
      contentClassName="items-center justify-center py-3"
    >
      <Icon name={icon} size="md" tone="ember" />
    </UIPressable>
  );
}
