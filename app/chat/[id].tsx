import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import {
  chatById,
  experienceById,
  messagesForChat,
  type MockMessage,
} from "@/fixtures";
import { colors } from "@/theme";

// Chat conversation (DEMO ONLY). BLOCKED_CONTRACT_GAP: no realtime/messaging
// backend, no delivery or read receipts. The composer echoes locally so the UI
// is explorable, but nothing is sent, stored, or delivered — the header carries
// a DEMO badge and a persistent note says so.
export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = chatById(id ?? "");
  const [messages, setMessages] = useState<MockMessage[]>(() =>
    messagesForChat(id ?? ""),
  );
  const [draft, setDraft] = useState("");

  if (!chat) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-base text-muted">Samtalen finnes ikke.</Text>
      </SafeAreaView>
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
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-line px-gutter pb-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tilbake"
          hitSlop={8}
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-surfaceMuted"
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted">
          <Text className="text-base font-semibold text-ink">
            {chat.initials}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {chat.name}
          </Text>
          <Text className="text-xs text-muted">
            {chat.kind === "group"
              ? `Gruppe · ${chat.members} medlemmer`
              : "Direktemelding"}
          </Text>
        </View>
        <DemoBadge />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerClassName="gap-3 p-gutter"
          ListHeaderComponent={
            pinned ? (
              // Informational pin (the experience this group organizes). Not a
              // link — experience detail is a map sheet, not reachable here.
              <View className="mb-1 flex-row items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5">
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={colors.ember}
                />
                <Text className="flex-1 text-sm text-ink" numberOfLines={1}>
                  {pinned.title}
                </Text>
                <Text className="text-xs text-muted">Festet</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => <Bubble message={item} />}
        />

        {/* Composer */}
        <View className="gap-2 border-t border-line px-gutter pb-2 pt-2.5">
          <Text className="text-center text-[11px] text-muted">
            Demo — meldinger sendes eller lagres ikke
          </Text>
          <View className="flex-row items-end gap-2">
            <TextInput
              className="max-h-28 flex-1 rounded-2xl border border-line bg-surface px-4 py-2.5 text-base text-ink"
              placeholder="Skriv en melding …"
              placeholderTextColor={colors.muted}
              value={draft}
              onChangeText={setDraft}
              multiline
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send"
              disabled={!draft.trim()}
              onPress={send}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                draft.trim() ? "bg-ember active:opacity-80" : "bg-surfaceMuted"
              }`}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={draft.trim() ? colors.onEmber : colors.muted}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ message }: { message: MockMessage }) {
  if (message.mine) {
    return (
      <View className="max-w-[80%] flex-row items-end gap-2 self-end">
        <View className="rounded-2xl rounded-br-sm bg-ember px-3.5 py-2.5">
          <Text className="text-base text-onEmber">{message.text}</Text>
          <Text className="pt-0.5 text-[10px] text-onEmber/70">
            {message.time}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View className="max-w-[82%] flex-row items-end gap-2 self-start">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-surfaceMuted">
        <Text className="text-xs font-semibold text-ink">
          {message.initials}
        </Text>
      </View>
      <View className="rounded-2xl rounded-bl-sm border border-line bg-surface px-3.5 py-2.5">
        <Text className="text-xs font-semibold text-muted">
          {message.author}
        </Text>
        <Text className="text-base text-ink">{message.text}</Text>
        <Text className="pt-0.5 text-[10px] text-muted">{message.time}</Text>
      </View>
    </View>
  );
}
