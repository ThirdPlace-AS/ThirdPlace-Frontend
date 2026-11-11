import { router, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Text } from "@/components/ui";
import { CHAT_ACCESS_LABEL, chatForPlace, messagesForChat } from "@/fixtures";
import { isMember, joinChat, useJoinedChats } from "@/lib/joinedChats";

import { useGuestMode } from "../hooks/useGuestMode";

// Pinned action card of a place's page sheet, where an experience has its
// join card (user 2026-11-09: "The details map sheet should also have a
// sticky action section but it should focus on the chat"; PDF p6 draws a
// chat bar under places too). It shows the place's chat with its last
// message and "Bli med i samtalen", or "Åpne samtalen" once joined. Joining
// is local demo state (src/lib/joinedChats); guests get the sign-in prompt.
// In the sheet the page body leaves out its own Samtalen section, so the
// chat shows once.
export function PlaceChatBar({ placeId }: { placeId: string }) {
  const chat = chatForPlace(placeId);
  const joined = useJoinedChats();
  const { isGuest } = useGuestMode();
  const [prompt, setPrompt] = useState(false);
  if (!chat) return null;
  const member = isMember(chat, joined);
  const last = messagesForChat(chat.id).at(-1);
  const open = () => {
    if (!member) {
      if (isGuest) {
        setPrompt(true);
        return;
      }
      joinChat(chat.id);
    }
    router.push(`/chat/${chat.id}` as Href);
  };
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1">
        <Text variant="body" weight="bold" numberOfLines={1}>
          Samtalen
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {last
            ? `${last.author}: ${last.text}`
            : chat.members != null
              ? `${chat.members} medlemmer · ${CHAT_ACCESS_LABEL[chat.access]}`
              : CHAT_ACCESS_LABEL[chat.access]}
        </Text>
      </View>
      <View style={{ minWidth: 150 }}>
        <Button
          label={member ? "Åpne samtalen" : "Bli med i samtalen"}
          rounded="full"
          variant={member ? "secondary" : "ember"}
          onPress={open}
        />
      </View>
      <SignInPrompt
        visible={prompt}
        onClose={() => setPrompt(false)}
        action="bli med i samtalen"
      />
    </View>
  );
}
