import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { FollowButton, Screen, Avatar, Text } from "@/components/ui";
import { Button } from "@/components/Button";
import { DemoBadge } from "@/components/DemoBadge";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { EmptyState } from "@/components/states/StateView";
import { experienceById, personById } from "@/fixtures";
import { libImage } from "@/fixtures/images";

// Creator profile (DEMO), per the design (PDF p14): avatar, name, "Skaper"
// role, bio, Følg / Melding, and Kommende / Tidligere experiences.
// BLOCKED_CONTRACT_GAP: no creator entity, follower graph or rating model —
// the person and counts are fixture examples and are badged as such.
export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const person = personById(id ?? "");
  const [follow, setFollow] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
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
  const hosted = person.hostsExperienceId
    ? experienceById(person.hostsExperienceId)
    : undefined;

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Skaper" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
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
            <DemoBadge />
          </View>
          <Text variant="caption" tone="muted" className="px-4 text-center">
            {person.bio}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FollowButton
              following={follow}
              onPress={() => setFollow((f) => !f)}
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
              onPress={() => setNotice("Meldinger sendes ikke i demoen.")}
            />
          </View>
        </View>
        {follow || notice ? (
          <DemoNote>{notice ?? "Å følge lagrer ingenting."}</DemoNote>
        ) : null}
        <Text variant="micro" weight="semibold" tone="muted">
          Kommende
        </Text>
        {hosted ? (
          <View className="gap-0.5 rounded-lg border border-line bg-surface p-4">
            <Text variant="body" weight="semibold">
              {hosted.title}
            </Text>
            <Text variant="caption" tone="muted">
              {hosted.when}
            </Text>
          </View>
        ) : (
          <Text variant="caption" tone="muted">
            Ingen kommende opplevelser.
          </Text>
        )}
        <Text variant="micro" weight="semibold" tone="muted">
          Tidligere
        </Text>
        <Text variant="caption" tone="muted">
          Tidligere opplevelser vises her når de finnes.
        </Text>
      </ScrollView>
    </Screen>
  );
}
