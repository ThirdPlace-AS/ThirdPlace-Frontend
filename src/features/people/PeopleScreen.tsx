import { router, type Href } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";

import {
  EmptyState,
  FollowButton,
  Header,
  IconButton,
  Screen,
  Avatar,
  Pressable as UIPressable,
  Text,
} from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { people, profile, type MockPerson } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { toggleFollow as toggleFollowing, useFollowing } from "@/lib/following";

// People discovery. BLOCKED_CONTRACT_GAP: no person entity, social
// graph, or follow backend. Following is local demo state (reset on reload) and a
// guest is sent to the demo sign-in prompt instead of a fake follow success.
export default function PeopleScreen() {
  const guest = useGuestMode();
  const following = useFollowing();
  const [signIn, setSignIn] = useState(false);
  // PDF p22: Alle / Nærheten / Interesser tabs + "Filter folk" sheet.
  const [tab, setTab] = useState<"all" | "near" | "interests">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const allTags = Array.from(new Set(people.flatMap((p) => p.interests)));
  const shared = (p: MockPerson) =>
    p.interests.filter((i) => profile.interests.includes(i));
  const list = people.filter((p) => {
    if (tab === "near" && p.area !== "Grünerløkka") return false;
    if (tab === "interests" && shared(p).length === 0) return false;
    if (filterTags.length && !p.interests.some((i) => filterTags.includes(i)))
      return false;
    return true;
  });

  const toggleFollow = (id: string) => {
    if (guest.isGuest) {
      setSignIn(true);
      return;
    }
    toggleFollowing(id);
  };

  return (
    <Screen edges={["top"]}>
      <Header title="Oppdag folk" />
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerClassName="px-gutter pb-10"
        ListEmptyComponent={
          <EmptyState
            fill={false}
            icon="people-outline"
            title="Ingen treff"
            message="Prøv et annet filter."
            actionLabel="Vis alle"
            onAction={() => {
              setTab("all");
              setFilterTags([]);
            }}
          />
        }
        ListHeaderComponent={
          <View className="gap-3 pb-3 pt-1">
            <Text variant="caption" tone="muted">
              Folk du kanskje vil bli kjent med.
            </Text>
            {/* The list shows example people with "felles" counts and Følg:
                say so here, not only on the person page. */}

            <View className="flex-row flex-wrap items-center gap-2">
              <Chip
                label="Alle"
                size="sm"
                role="radio"
                selected={tab === "all"}
                onPress={() => setTab("all")}
              />
              <Chip
                label="Nærheten"
                size="sm"
                role="radio"
                selected={tab === "near"}
                onPress={() => setTab("near")}
              />
              <Chip
                label="Interesser"
                size="sm"
                role="radio"
                selected={tab === "interests"}
                onPress={() => setTab("interests")}
              />
              <IconButton
                icon="options-outline"
                label="Filter folk"
                variant="outline"
                size="sm"
                badge={filterTags.length > 0}
                selected={filterTags.length > 0}
                onPress={() => setFilterOpen(true)}
                className="ml-auto"
              />
              <IconButton
                icon="person-add-outline"
                label="Inviter venner"
                variant="outline"
                size="sm"
                onPress={() => router.push("/invite")}
              />
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <PersonRow
            person={item}
            following={following.has(item.id)}
            onPress={() => router.push(`/people/${item.id}` as Href)}
            onFollow={() => toggleFollow(item.id)}
          />
        )}
      />

      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter folk"
      >
        <View className="gap-3">
          <Text variant="label" weight="semibold">
            Interesser
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {allTags.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={filterTags.includes(t)}
                onPress={() =>
                  setFilterTags((s) =>
                    s.includes(t) ? s.filter((x) => x !== t) : [...s, t],
                  )
                }
              />
            ))}
          </View>
          <Button
            label={`Vis ${list.length} personer`}
            variant="ink"
            onPress={() => setFilterOpen(false)}
          />
          {filterTags.length ? (
            <Button
              label="Nullstill"
              variant="secondary"
              onPress={() => setFilterTags([])}
            />
          ) : null}
        </View>
      </Sheet>
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="følge folk"
      />
    </Screen>
  );
}

function PersonRow({
  person,
  following,
  onPress,
  onFollow,
}: {
  person: MockPerson;
  following: boolean;
  onPress: () => void;
  onFollow: () => void;
}) {
  // Row is a View (not a Pressable) so the Følg button is a SIBLING, never a
  // nested Pressable — nested pressables are invalid DOM in the CI web bundle.
  return (
    <View className="flex-row items-center gap-3 rounded-md bg-surface px-3 py-3">
      <UIPressable
        accessibilityRole="button"
        accessibilityLabel={`${person.name}, ${person.area}${
          person.mutuals > 0 ? `, ${person.mutuals} felles` : ""
        }`}
        onPress={onPress}
        pressedScale={0.99}
        className="flex-1"
        contentClassName="flex-row items-center gap-3"
      >
        <Avatar
          name={person.name}
          source={libImage(person.avatar)}
          size="lg"
          decorative
        />
        <View className="flex-1">
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {person.name}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {person.area}
            {person.mutuals > 0 ? ` · ${person.mutuals} felles` : ""}
          </Text>
        </View>
      </UIPressable>
      <FollowButton
        following={following}
        onPress={onFollow}
        name={person.name}
      />
    </View>
  );
}
