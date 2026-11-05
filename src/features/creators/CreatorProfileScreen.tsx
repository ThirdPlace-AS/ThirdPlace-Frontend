import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <RouteHeader title="Skaper" />
        <EmptyState
          icon="person-outline"
          title="Fant ikke skaperen"
          message="Profilen finnes ikke eller er fjernet."
        />
      </SafeAreaView>
    );
  }
  const hosted = person.hostsExperienceId
    ? experienceById(person.hostsExperienceId)
    : undefined;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Skaper" />
      <ScrollView contentContainerClassName="gap-4 px-gutter py-4 pb-12">
        <View className="items-center gap-2">
          <Image
            source={libImage(person.avatar)}
            style={{ height: 88, width: 88, borderRadius: 44 }}
            accessibilityLabel={person.name}
          />
          <Text className="text-2xl font-bold text-ink">{person.name}</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-ember">Skaper</Text>
            <DemoBadge />
          </View>
          <Text className="px-4 text-center text-sm text-muted">
            {person.bio}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label={follow ? "Følger" : "Følg"}
              variant={follow ? "secondary" : "ink"}
              onPress={() => setFollow((f) => !f)}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Melding"
              variant="secondary"
              onPress={() => setNotice("Meldinger sendes ikke i demoen.")}
            />
          </View>
        </View>
        {follow || notice ? (
          <DemoNote>{notice ?? "Å følge lagrer ingenting."}</DemoNote>
        ) : null}
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Kommende
        </Text>
        {hosted ? (
          <View className="gap-0.5 rounded-2xl border border-line bg-surface p-4">
            <Text className="text-base font-semibold text-ink">
              {hosted.title}
            </Text>
            <Text className="text-xs text-muted">{hosted.when}</Text>
          </View>
        ) : (
          <Text className="text-sm text-muted">
            Ingen kommende opplevelser.
          </Text>
        )}
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          Tidligere
        </Text>
        <Text className="text-sm text-muted">
          Tidligere opplevelser vises her når de finnes.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
