import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  Avatar,
  FollowButton,
  pageBody,
  Screen,
  Section,
  Text,
  Button,
} from "@/components/ui";
import { RouteHeader } from "@/components/RouteHeader";
import { EmptyState } from "@/components/states/StateView";
import { useGuestGate } from "@/components/useGuestGate";
import { chats, experiencesHostedBy, personById } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { whenLabel } from "@/lib/whenLabel";

// Creator profile, per the design (PDF p14): avatar, name, "Skaper"
// role, bio, Følg / Melding, and Kommende / Tidligere experiences.
// BLOCKED_CONTRACT_GAP: no creator entity, follower graph or rating model;
// the person and counts are fixture data.
export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const person = personById(id ?? "");
  const [follow, setFollow] = useState(false);
  // Following and messaging are personal (founder 2026-11-19 Q1).
  const { gate, prompt: signInPrompt } = useGuestGate();
  if (!person) {
    return (
      <Screen edges={["top"]}>
        <RouteHeader title="Skaper" />
        <EmptyState
          icon="person-outline"
          title="Fant ikke skaperen"
          message="Profilen finnes ikke eller er fjernet."
        />
      </Screen>
    );
  }
  // Everything the creator hosts (catalogue hosts run several, Phase 19).
  const hosted = experiencesHostedBy(person.id);

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Skaper" />
      <ScrollView contentContainerClassName={pageBody.sections}>
        <View className="items-center gap-2">
          <Avatar
            name={person.name}
            source={libImage(person.avatar)}
            size="xl"
          />
          <Text variant="h1" accessibilityRole="text">
            {person.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text variant="label" weight="semibold" tone="ember">
              Skaper
            </Text>
          </View>
          <Text variant="caption" tone="muted" className="px-4 text-center">
            {person.bio}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FollowButton
              following={follow}
              onPress={gate("følge folk", () => setFollow((f) => !f))}
              name={person.name}
              size="md"
              fullWidth
            />
          </View>
          <View className="flex-1">
            <Button
              label="Melding"
              variant="secondary"
              rounded="full"
              onPress={gate("sende meldinger", () => {
                // Open the direct chat with this person when one exists,
                // else the chat list (BLOCKED_CONTRACT_GAP: no DM contract).
                const first = person.name.split(" ")[0] ?? person.name;
                const dm = chats.find(
                  (c) => c.type === "dm" && c.name.startsWith(first),
                );
                router.push((dm ? `/chat/${dm.id}` : "/chat") as Href);
              })}
            />
          </View>
        </View>

        <Section title="Kommende">
          {hosted.length > 0 ? (
            hosted.map((h) => (
              <View
                key={h.id}
                className="gap-1 rounded-md border border-line bg-surface p-4"
              >
                <Text variant="body" weight="semibold">
                  {h.title}
                </Text>
                <Text variant="caption" tone="muted">
                  {whenLabel(h)}
                </Text>
              </View>
            ))
          ) : (
            <Text variant="caption" tone="muted">
              Ingen kommende opplevelser.
            </Text>
          )}
        </Section>
        <Section title="Tidligere">
          <Text variant="caption" tone="muted">
            Tidligere opplevelser vises her når de finnes.
          </Text>
        </Section>
      </ScrollView>
      {signInPrompt}
    </Screen>
  );
}
