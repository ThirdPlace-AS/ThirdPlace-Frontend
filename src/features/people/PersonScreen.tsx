// Person page (/people/[id]): what used to be the "Profil" sheet on Oppdag
// folk, as a page you can deep link and go back from (Phase 12 H4c: content
// you read is a page). BLOCKED_CONTRACT_GAP: no person entity or follow
// backend; following is the shared in-memory store, guests get the sign-in
// prompt.
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { BlockSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  Avatar,
  EmptyState,
  FollowButton,
  Header,
  ListRow,
  Screen,
  Text,
} from "@/components/ui";
import { experienceById, people } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { toggleFollow, useFollowing } from "@/lib/following";
import { goBackOr } from "@/lib/navigation";

export default function PersonScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const person = people.find((p) => p.id === id);
  const following = useFollowing();
  const { isGuest } = useGuestMode();
  const [block, setBlock] = useState(false);
  const [signIn, setSignIn] = useState(false);

  if (!person) {
    return (
      <Screen edges={["top", "bottom"]}>
        <Header title="Profil" />
        <EmptyState
          icon="person-outline"
          title="Fant ikke personen"
          actionLabel="Til Oppdag folk"
          onAction={() => goBackOr("/people" as Href)}
        />
      </Screen>
    );
  }

  const hosts = person.hostsExperienceId
    ? experienceById(person.hostsExperienceId)
    : undefined;
  const isFollowing = following.has(person.id);

  return (
    <Screen edges={["top", "bottom"]}>
      <Header title={person.name} />
      <ScrollView contentContainerClassName="gap-6 px-gutter pb-12 pt-4">
        <View className="items-center gap-2">
          <Avatar
            name={person.name}
            source={libImage(person.avatar)}
            size="xl"
          />
          <Text variant="h2" weight="bold">
            {person.name}
          </Text>
          <Text variant="caption" tone="muted">
            {person.handle} · {person.area}
          </Text>
          <Text variant="label" weight="regular" className="px-4 text-center">
            {person.bio}
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-2">
          {person.interests.map((i) => (
            <Chip key={i} label={i} />
          ))}
        </View>

        <View className="gap-3">
          <FollowButton
            following={isFollowing}
            onPress={() =>
              isGuest ? setSignIn(true) : toggleFollow(person.id)
            }
            name={person.name}
            size="md"
            fullWidth
          />
          <Button
            label="Blokker"
            variant="secondary"
            onPress={() => setBlock(true)}
          />
        </View>

        {hosts ? (
          <ListRow
            icon="pricetag-outline"
            title={`Vert for «${hosts.title}»`}
            subtitle={hosts.when}
            onPress={() => router.push(`/experience/${hosts.id}` as Href)}
          />
        ) : null}
      </ScrollView>

      {block ? (
        <BlockSheet name={person.name} onClose={() => setBlock(false)} />
      ) : null}
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="følge folk"
      />
    </Screen>
  );
}
