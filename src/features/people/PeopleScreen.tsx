import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Header, Icon, IconButton, Screen } from "@/components/ui";
import { BlockSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { experienceById, people, profile, type MockPerson } from "@/fixtures";
import { libImage } from "@/fixtures/images";

// People discovery (DEMO ONLY). BLOCKED_CONTRACT_GAP: no person entity, social
// graph, or follow backend. Following is local demo state (reset on reload) and a
// guest is sent to the demo sign-in prompt instead of a fake follow success.
export default function PeopleScreen() {
  const guest = useGuestMode();
  const [open, setOpen] = useState<MockPerson | null>(null);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
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
    setFollowing((f) => ({ ...f, [id]: !f[id] }));
  };

  return (
    <Screen edges={["top"]}>
      <Header title="Oppdag folk" />
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        contentContainerClassName="px-gutter pb-10"
        ListEmptyComponent={
          <Text className="py-10 text-center text-sm text-muted font-normal">
            Ingen treff — prøv et annet filter.
          </Text>
        }
        ListHeaderComponent={
          <View className="gap-3 pb-3 pt-1">
            <Text className="text-sm text-muted font-normal">
              Mennesker du kanskje vil møte.
            </Text>
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
            following={!!following[item.id]}
            onPress={() => setOpen(item)}
            onFollow={() => toggleFollow(item.id)}
          />
        )}
      />

      <PersonDetailSheet
        person={open}
        following={open ? !!following[open.id] : false}
        onFollow={() => open && toggleFollow(open.id)}
        onClose={() => setOpen(null)}
      />
      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter folk"
      >
        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink">Interesser</Text>
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
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="flex-1 flex-row items-center gap-3 active:opacity-80"
      >
        <Image
          source={libImage(person.avatar)}
          contentFit="cover"
          transition={150}
          style={{ height: 52, width: 52, borderRadius: 26 }}
          className="bg-surfaceMuted"
          accessibilityLabel={person.name}
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {person.name}
          </Text>
          <Text className="text-sm text-muted font-normal" numberOfLines={1}>
            {person.area}
            {person.mutuals > 0 ? ` · ${person.mutuals} felles` : ""}
          </Text>
        </View>
      </Pressable>
      <FollowButton following={following} onPress={onFollow} compact />
    </View>
  );
}

function FollowButton({
  following,
  onPress,
  compact = false,
}: {
  following: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={following ? "Slutt å følge" : "Følg"}
      onPress={onPress}
      className={`items-center justify-center rounded-full ${
        compact ? "px-4 py-2" : "px-5 py-2.5"
      } ${following ? "bg-surfaceMuted" : "bg-ink active:opacity-80"}`}
    >
      <Text
        className={`text-sm font-semibold ${following ? "text-ink" : "text-onInk"}`}
      >
        {following ? "Følger" : "Følg"}
      </Text>
    </Pressable>
  );
}

function PersonDetailSheet({
  person,
  following,
  onFollow,
  onClose,
}: {
  person: MockPerson | null;
  following: boolean;
  onFollow: () => void;
  onClose: () => void;
}) {
  const hosts = person?.hostsExperienceId
    ? experienceById(person.hostsExperienceId)
    : undefined;
  const [block, setBlock] = useState(false);
  return (
    <Sheet visible={person !== null} onClose={onClose} title="Profil">
      {person ? (
        <View className="gap-4">
          <View className="items-center gap-2">
            <Image
              source={libImage(person.avatar)}
              contentFit="cover"
              transition={200}
              style={{ height: 88, width: 88, borderRadius: 44 }}
              className="bg-surfaceMuted"
              accessibilityLabel={person.name}
            />
            <Text className="text-lg font-bold text-ink">{person.name}</Text>
            <Text className="text-sm text-muted font-normal">
              {person.handle} · {person.area}
            </Text>
            <Text className="px-4 text-center text-sm text-muted font-normal">
              {person.bio}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-center gap-2">
            {person.interests.map((i) => (
              <Chip key={i} label={i} />
            ))}
          </View>

          {hosts ? (
            <View className="flex-row items-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5">
              <Icon name="pricetag-outline" size="sm" tone="ember" />
              <Text
                className="flex-1 text-sm text-ink font-normal"
                numberOfLines={1}
              >
                Vert for «{hosts.title}»
              </Text>
            </View>
          ) : null}

          <FollowButton following={following} onPress={onFollow} />
          <Button
            label="Blokker"
            variant="secondary"
            onPress={() => setBlock(true)}
          />
          <DemoNote>Å følge lagrer eller sender ingenting.</DemoNote>
          {block ? (
            <BlockSheet name={person.name} onClose={() => setBlock(false)} />
          ) : null}
        </View>
      ) : null}
    </Sheet>
  );
}
