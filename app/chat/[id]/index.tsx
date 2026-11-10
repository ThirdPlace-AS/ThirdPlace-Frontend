import { router, useLocalSearchParams, type Href } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import {
  Avatar,
  EmptyState,
  Icon,
  BACK_ICON,
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
} from "@/fixtures";
import {
  firstUnreadId,
  getChatReads,
  markChatRead,
  unreadOf,
} from "@/lib/chatReads";
import { haptics } from "@/lib/haptics";
import { claimHint, markHintSeen, useHintSeen } from "@/lib/hints";
import { HintBanner } from "@/components/HintBanner";
import {
  REACTIONS,
  sendMessage,
  toggleReaction,
  useThread,
  type Reply,
  type ThreadMessage,
} from "@/lib/chatThreads";
import { duration, useThemeColors } from "@/theme";
import { fontFamilyFor } from "@/theme/fonts";

// Chat conversation. BLOCKED_CONTRACT_GAP: no realtime/messaging
// backend, no delivery or read receipts. What the viewer sends, replies to and
// reacts with is kept for the session (src/lib/chatThreads.ts); nothing is
// delivered. Phase 16 (founder, after the section benchmark): long-press a
// message for reactions and "Svar", or swipe it right to reply with a quote.
export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = chatById(id ?? "");
  const thread = useThread(id ?? "");
  const messages = useMemo<ThreadMessage[]>(
    () => [...messagesForChat(id ?? ""), ...thread.sent],
    [id, thread.sent],
  );
  const [replyTo, setReplyTo] = useState<Reply | null>(null);
  // The message whose reaction row is open (long press).
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // "Nye meldinger" (Phase 18, WhatsApp / Telegram): a line above the first
  // message that was unread when the thread opened. Counted before opening
  // reads it, and kept while the thread is open.
  const [unreadAtOpen] = useState(() =>
    chat ? unreadOf(chat, getChatReads()) : 0,
  );
  const newFrom = useMemo(
    () => firstUnreadId(messagesForChat(id ?? ""), unreadAtOpen),
    [id, unreadAtOpen],
  );
  // Opening the thread reads it: its unread count and the Chat tab badge drop.
  useEffect(() => {
    if (id) markChatRead(id);
  }, [id]);
  // Guests may read but not send (master spec §4: guests cannot send
  // messages). The composer is replaced by a sign-in entry point.
  const { isGuest } = useGuestMode();
  const [promptOpen, setPromptOpen] = useState(false);
  // One-time tip for the hidden long-press (Phase 18): signed-in people, the
  // first thread they open, unless another tip showed this session.
  const hintSeen = useHintSeen("chatLongPress");
  const [hintClaimed] = useState(() => !isGuest && claimHint("chatLongPress"));
  const showHint = hintClaimed && !hintSeen && chat?.status !== "archived";
  const listRef = useRef<FlatList<ThreadMessage>>(null);
  // Open at the newest message and follow every send (the list used to open
  // at the oldest message and new bubbles landed out of view).
  const sentCount = useRef(0);
  const chatId = chat?.id;
  const canReply = chat?.status !== "archived" && !isGuest;

  // Stable handlers taking the message, so the memoised bubbles re-render
  // only when their own message, reaction or menu changes (speed pass 0352).
  const toggleMenu = useCallback((messageId: string) => {
    markHintSeen("chatLongPress");
    setMenuFor((cur) => (cur === messageId ? null : messageId));
  }, []);
  const react = useCallback(
    (messageId: string, emoji: string) => {
      if (!chatId) return;
      toggleReaction(chatId, messageId, emoji);
      setMenuFor(null);
    },
    [chatId],
  );
  const startReply = useCallback((m: ThreadMessage) => {
    setMenuFor(null);
    setReplyTo({ author: m.mine ? "deg selv" : m.author, text: m.text });
  }, []);
  const cancelReply = useCallback(() => setReplyTo(null), []);
  const send = useCallback(
    (text: string) => {
      if (!chatId) return;
      sendMessage(chatId, text, replyTo ?? undefined);
      setReplyTo(null);
      setMenuFor(null);
      sentCount.current += 1;
    },
    [chatId, replyTo],
  );
  const renderItem = useCallback(
    ({ item }: { item: ThreadMessage }) => (
      <View className="gap-3">
        {item.id === newFrom ? <NewMessagesLine /> : null}
        <Bubble
          message={item}
          reaction={thread.reactions[item.id]}
          menuOpen={menuFor === item.id}
          canReply={canReply}
          onToggleMenu={toggleMenu}
          onReact={react}
          onReply={startReply}
        />
      </View>
    ),
    [
      newFrom,
      thread.reactions,
      menuFor,
      canReply,
      toggleMenu,
      react,
      startReply,
    ],
  );

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

  return (
    <Screen edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-line px-gutter pb-3">
        <IconButton
          icon={BACK_ICON}
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

      {showHint ? (
        <View className="px-gutter pt-3">
          <HintBanner
            icon="hand-left-outline"
            text="Hold inne en melding for å reagere eller svare."
            onDone={() => markHintSeen("chatLongPress")}
          />
        </View>
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
          onScrollBeginDrag={() => setMenuFor(null)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-10">
              <Text variant="caption" tone="muted" className="text-center">
                Ingen meldinger ennå.
              </Text>
            </View>
          }
          renderItem={renderItem}
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
          <Composer
            replyTo={replyTo}
            onCancelReply={cancelReply}
            onSend={send}
          />
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

// The message box keeps its own draft (speed pass 0352): typing used to
// re-render the whole thread, every bubble and its gesture, per keystroke.
function Composer({
  replyTo,
  onCancelReply,
  onSend,
}: {
  replyTo: Reply | null;
  onCancelReply: () => void;
  onSend: (text: string) => void;
}) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState("");
  const ready = draft.trim().length > 0;
  return (
    <View className="gap-2 border-t border-line px-gutter pb-2 pt-2.5">
      {replyTo ? (
        <View className="flex-row items-center gap-2 rounded-md bg-surfaceMuted py-2 pl-3 pr-1">
          <View className="flex-1 border-l-2 border-ember pl-2">
            <Text variant="caption" weight="semibold">
              Svarer {replyTo.author}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {replyTo.text}
            </Text>
          </View>
          <IconButton
            icon="close"
            label="Avbryt svaret"
            size="sm"
            variant="ghost"
            onPress={onCancelReply}
          />
        </View>
      ) : null}
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
          // A paper plane, not an arrow (founder 2026-11-06: no
          // arrows on buttons).
          icon="send"
          label="Send"
          variant={ready ? "ink" : "filled"}
          tone={ready ? "onInk" : "muted"}
          disabled={!ready}
          onPress={() => {
            const text = draft.trim();
            if (!text) return;
            onSend(text);
            setDraft("");
          }}
        />
      </View>
    </View>
  );
}

// Above the first message that was unread when the thread opened.
function NewMessagesLine() {
  return (
    <View className="flex-row items-center gap-2 py-1">
      <View className="h-px flex-1 bg-line" />
      <Text variant="caption" weight="semibold" tone="ember">
        Nye meldinger
      </Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}

const REPLY_SWIPE = 56;

// Memoised (speed pass 0352): the screen's handlers are stable and take the
// message, so a bubble renders again only when its own message, reaction or
// menu changes.
const Bubble = memo(function Bubble({
  message,
  reaction,
  menuOpen,
  onToggleMenu: toggleMenuFor,
  onReact: reactTo,
  onReply: replyTo,
  canReply,
}: {
  message: ThreadMessage;
  reaction: string | undefined;
  menuOpen: boolean;
  onToggleMenu: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: ThreadMessage) => void;
  canReply: boolean;
}) {
  const onToggleMenu = () => toggleMenuFor(message.id);
  const onReact = (emoji: string) => reactTo(message.id, emoji);
  const onReply = () => replyTo(message);
  const reduced = useReducedMotion();
  // Only messages written in this session slide in from the composer; the
  // fixture history is already there. No delivered/read ticks (no backend).
  const entering =
    message.id.startsWith("local-") && !reduced
      ? FadeInDown.duration(duration.base)
      : undefined;
  // Swipe right to reply (WhatsApp / Instagram): the bubble follows the
  // finger a little and springs back; past the threshold it quotes.
  const x = useSharedValue(0);
  const pan = Gesture.Pan()
    .enabled(canReply)
    .activeOffsetX(14)
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      x.value = Math.max(0, Math.min(e.translationX, 72));
    })
    .onEnd(() => {
      if (x.value >= REPLY_SWIPE) {
        runOnJS(haptics.selection)();
        runOnJS(onReply)();
      }
      x.value = reduced ? 0 : withSpring(0);
    });
  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const mine = message.mine;
  const label = `${mine ? "Du" : message.author}: ${message.text}, ${message.time}${
    reaction ? `, reaksjon ${reaction}` : ""
  }`;

  const body = (
    <Pressable
      onLongPress={() => {
        onToggleMenu();
      }}
      delayLongPress={280}
      accessibilityLabel={label}
      accessibilityHint="Hold for å reagere eller svare"
      accessibilityActions={
        canReply
          ? [
              { name: "react", label: "Reager" },
              { name: "reply", label: "Svar" },
            ]
          : [{ name: "react", label: "Reager" }]
      }
      onAccessibilityAction={(e) =>
        e.nativeEvent.actionName === "reply" ? onReply() : onToggleMenu()
      }
    >
      {mine ? (
        <View className="rounded-lg rounded-br-sm bg-ink px-3.5 py-2.5">
          {message.replyTo ? <Quote reply={message.replyTo} onInk /> : null}
          <Text variant="body" tone="onInk">
            {message.text}
          </Text>
          <Text variant="caption" tone="onInk" className="pt-0.5 opacity-70">
            {message.time}
          </Text>
        </View>
      ) : (
        <View className="rounded-lg rounded-bl-sm border border-line bg-surface px-3.5 py-2.5">
          <Text variant="caption" weight="semibold" tone="muted">
            {message.author}
          </Text>
          {message.replyTo ? <Quote reply={message.replyTo} /> : null}
          <Text variant="body">{message.text}</Text>
          <Text variant="caption" tone="muted" className="pt-0.5">
            {message.time}
          </Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <Animated.View
      entering={entering}
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: mine ? "80%" : "82%",
        gap: 4,
      }}
    >
      {menuOpen ? (
        <ReactionBar
          current={reaction}
          onReact={onReact}
          onReply={canReply ? onReply : undefined}
          alignEnd={mine}
        />
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={slide}>
          {mine ? (
            body
          ) : (
            <View className="flex-row items-end gap-2">
              <Avatar
                name={message.author}
                initials={message.initials}
                size="sm"
                decorative
              />
              <View className="shrink">{body}</View>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
      {reaction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fjern reaksjonen ${reaction}`}
          onPress={() => onReact(reaction)}
          hitSlop={8}
          className={`rounded-full border border-line bg-surface px-1.5 py-0.5 ${
            mine ? "self-end" : "ml-10 self-start"
          }`}
        >
          <Text variant="caption">{reaction}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
});

// The quoted message inside a reply.
function Quote({ reply, onInk = false }: { reply: Reply; onInk?: boolean }) {
  return (
    <View
      className={`mb-1.5 rounded-sm border-l-2 px-2 py-1 ${
        onInk ? "border-onInk bg-onInk/15" : "border-ember bg-surfaceMuted"
      }`}
    >
      <Text
        variant="caption"
        weight="semibold"
        tone={onInk ? "onInk" : "ink"}
        numberOfLines={1}
      >
        {reply.author}
      </Text>
      <Text
        variant="caption"
        tone={onInk ? "onInk" : "muted"}
        numberOfLines={2}
      >
        {reply.text}
      </Text>
    </View>
  );
}

// Long press: a reaction row and "Svar", over the message.
function ReactionBar({
  current,
  onReact,
  onReply,
  alignEnd,
}: {
  current: string | undefined;
  onReact: (emoji: string) => void;
  onReply?: () => void;
  alignEnd: boolean;
}) {
  return (
    <View
      accessibilityRole="toolbar"
      accessibilityLabel="Reager på meldingen"
      className={`flex-row items-center gap-0.5 rounded-full border border-line bg-surface px-1.5 py-1 ${
        alignEnd ? "self-end" : "self-start"
      }`}
    >
      {REACTIONS.map((r) => (
        <Pressable
          key={r}
          accessibilityRole="button"
          accessibilityLabel={`Reager med ${r}`}
          accessibilityState={{ selected: current === r }}
          onPress={() => onReact(r)}
          className={`h-9 w-9 items-center justify-center rounded-full ${
            current === r ? "bg-surfaceMuted" : ""
          }`}
        >
          <Text variant="title">{r}</Text>
        </Pressable>
      ))}
      {onReply ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Svar"
          onPress={onReply}
          className="h-9 items-center justify-center rounded-full px-2.5"
        >
          <Text variant="label" weight="semibold">
            Svar
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
