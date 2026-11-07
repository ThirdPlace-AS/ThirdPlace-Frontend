import { router, useLocalSearchParams, type Href } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, TextInput, View } from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";

import {
  Avatar,
  EmptyState,
  Icon,
  IconButton,
  Pressable as UIPressable,
  Screen,
  Text,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { SignInPrompt } from "@/components/SignInPrompt";
import {
  CHAT_ACCESS_LABEL,
  CHAT_TYPE_LABEL,
  chatById,
  experienceById,
  messagesForChat,
  type MockMessage,
} from "@/fixtures";
import { duration, useThemeColors } from "@/theme";
import { fontFamilyFor } from "@/theme/fonts";
import { haptics } from "@/lib/haptics";

// Chat conversation. BLOCKED_CONTRACT_GAP: no realtime/messaging
// backend, no delivery or read receipts. The composer echoes locally so the UI
// is explorable; nothing is stored or delivered.
export default function ChatThreadScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = chatById(id ?? "");
  const [messages, setMessages] = useState<MockMessage[]>(() =>
    messagesForChat(id ?? ""),
  );
  const [draft, setDraft] = useState("");
  // Guests may read but not send (master spec §4: guests cannot send
  // messages). The composer is replaced by a sign-in entry point.
  const { isGuest } = useGuestMode();
  const [promptOpen, setPromptOpen] = useState(false);
  const listRef = useRef<FlatList<MockMessage>>(null);
  // Open at the newest message and follow every send (the list used to open
  // at the oldest message and new bubbles landed out of view).
  const sentCount = useRef(0);

  if (!chat) {
    return (
      <Screen>
        <EmptyState
          icon="chatbubbles-outline"
          title="Samtalen finnes ikke"
          actionLabel="Til chattene"
          onAction={() =>
            router.canGoBack() ? router.back() : router.replace("/chat")
          }
        />
      </Screen>
    );
  }

  const pinned = chat.pinnedExperienceId
    ? experienceById(chat.pinnedExperienceId)
    : undefined;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length}`,
        author: "Ola",
        initials: "OL",
        text,
        time: "Nå",
        mine: true,
      },
    ]);
    setDraft("");
    sentCount.current += 1;
    haptics.light();
  };

  return (
    <Screen edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-line px-gutter pb-3">
        <IconButton
          icon="chevron-back"
          label="Tilbake"
          variant="outline"
          onPress={() => router.back()}
        />
        <Avatar
          name={chat.name}
          initials={chat.initials}
          size="md"
          decorative
        />
        <View className="flex-1">
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {chat.name}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {[
              CHAT_TYPE_LABEL[chat.type],
              chat.type === "dm" ? null : CHAT_ACCESS_LABEL[chat.access],
              chat.members ? `${chat.members} i chatten` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
        <IconButton
          icon="information-circle-outline"
          label="Chat-info"
          size="sm"
          onPress={() => router.push(`/chat/${chat.id}/info` as Href)}
        />
      </View>

      {pinned ? (
        // Pin under the header (PDF p9): the experience this chat organizes.
        // Opens the experience page (Phase 12 H4c: full entities are pages).
        <UIPressable
          accessibilityRole="link"
          accessibilityLabel={`Festet: ${pinned.title}. Åpne opplevelsen`}
          onPress={() => router.push(`/experience/${pinned.id}` as Href)}
          pressedScale={0.99}
          contentClassName="flex-row items-center gap-2 border-b border-line px-gutter py-2.5"
        >
          <Icon name="pricetag-outline" size="sm" tone="ember" />
          <Text
            variant="label"
            weight="regular"
            className="flex-1"
            numberOfLines={1}
          >
            {pinned.title}
          </Text>
          <Text variant="caption" tone="muted">
            Festet
          </Text>
          <Icon name="chevron-forward" size="sm" tone="muted" />
        </UIPressable>
      ) : null}

      <KeyboardAvoidingView
        className="flex-1"
        // Edge-to-edge Android does not resize for the keyboard either.
        behavior="padding"
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          // Short threads sit just above the composer, like any chat.
          contentContainerClassName="grow justify-end gap-3 p-gutter"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: sentCount.current > 0 })
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-10">
              <Text variant="caption" tone="muted" className="text-center">
                Ingen meldinger ennå.
              </Text>
            </View>
          }
          renderItem={({ item }) => <Bubble message={item} />}
        />

        {chat.status === "archived" ? (
          <View className="border-t border-line px-gutter pb-3 pt-3">
            <Text variant="caption" tone="muted" className="text-center">
              Arkivert. Du kan lese, men ikke sende meldinger.
            </Text>
          </View>
        ) : isGuest ? (
          <View className="border-t border-line px-gutter pb-2 pt-2.5">
            <Button
              label="Logg inn for å skrive"
              variant="ink"
              onPress={() => setPromptOpen(true)}
            />
          </View>
        ) : (
          <View className="gap-2 border-t border-line px-gutter pb-2 pt-2.5">
            <View className="flex-row items-end gap-2">
              <TextInput
                accessibilityLabel="Melding"
                className="max-h-28 flex-1 rounded-2xl border border-line bg-surface px-4 py-2.5 text-ink"
                style={{ fontFamily: fontFamilyFor("regular"), fontSize: 16 }}
                placeholder="Skriv en melding …"
                placeholderTextColor={colors.muted}
                value={draft}
                onChangeText={setDraft}
                multiline
              />
              <IconButton
                icon="arrow-up"
                label="Send"
                variant={draft.trim() ? "ink" : "filled"}
                tone={draft.trim() ? "onInk" : "muted"}
                disabled={!draft.trim()}
                onPress={send}
              />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
      <SignInPrompt
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        action="skrive i chatten"
      />
    </Screen>
  );
}

function Bubble({ message }: { message: MockMessage }) {
  const reduced = useReducedMotion();
  // Only messages written in this session slide in from the composer; the
  // fixture history is already there. No delivered/read ticks (no backend).
  const entering =
    message.id.startsWith("local-") && !reduced
      ? FadeInDown.duration(duration.base)
      : undefined;
  if (message.mine) {
    return (
      <Animated.View
        entering={entering}
        style={{ alignSelf: "flex-end", maxWidth: "80%" }}
      >
        <View className="rounded-lg rounded-br-sm bg-ink px-3.5 py-2.5">
          <Text variant="body" tone="onInk">
            {message.text}
          </Text>
          <Text variant="caption" tone="onInk" className="pt-0.5 opacity-70">
            {message.time}
          </Text>
        </View>
      </Animated.View>
    );
  }
  return (
    <View className="max-w-[82%] flex-row items-end gap-2 self-start">
      <Avatar
        name={message.author}
        initials={message.initials}
        size="sm"
        decorative
      />
      <View className="rounded-lg rounded-bl-sm border border-line bg-surface px-3.5 py-2.5">
        <Text variant="caption" weight="semibold" tone="muted">
          {message.author}
        </Text>
        <Text variant="body">{message.text}</Text>
        <Text variant="caption" tone="muted" className="pt-0.5">
          {message.time}
        </Text>
      </View>
    </View>
  );
}
