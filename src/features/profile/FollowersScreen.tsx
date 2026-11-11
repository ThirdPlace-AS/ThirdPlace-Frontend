// Følgere / Følger (PDF p13): two tabs over who follows you (the fixture
// list) and who you follow (the shared following store); the counts in the
// tab labels are the list lengths. A follower you do not follow back gets
// "Følg tilbake". Someone you unfollow here stays in the list until you leave
// the page, so a slip can be undone. Rows open the person's page.
// BLOCKED_CONTRACT_GAP: no follow-graph backend; follows are session state
// shared with Oppdag folk and the person page.
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  EmptyState,
  FollowButton,
  Page,
  Pressable,
  Text,
} from "@/components/ui";
import { people, profile, type MockPerson } from "@/fixtures";
import { PersonListRow } from "@/features/people/PersonListRow";
import { followerPeople, toggleFollow, useFollowing } from "@/lib/following";
import { useMyProfile } from "@/lib/myProfile";

type Tab = "followers" | "following";

export default function FollowersScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [active, setActive] = useState<Tab>(
    tab === "following" ? "following" : "followers",
  );
  const set = useFollowing();
  const me = useMyProfile();
  const { isGuest } = useGuestMode();
  const [signIn, setSignIn] = useState(false);

  // Who was followed when the page opened, plus anyone followed here: they
  // stay listed under Følger after an unfollow until the page closes.
  const [kept, setKept] = useState<ReadonlySet<string>>(() => new Set(set));
  const follow = (id: string) => {
    if (isGuest) {
      setSignIn(true);
      return;
    }
    toggleFollow(id);
    setKept((k) => (k.has(id) ? k : new Set([...k, id])));
  };

  const followers = followerPeople();
  const followingList = people.filter((p) => kept.has(p.id) || set.has(p.id));
  const followingCount = people.filter((p) => set.has(p.id)).length;
  const list = active === "followers" ? followers : followingList;

  const followsMe = (id: string) => profile.followerIds.includes(id);
  const line = (p: MockPerson) => {
    if (set.has(p.id) && followsMe(p.id)) return "Venn";
    const shared = p.interests.filter((i) => me.interests.includes(i));
    return shared.length > 0 ? `Felles: ${shared.join(", ")}` : p.area;
  };

  return (
    <Page title="Følgere">
      <View
        accessibilityRole="tablist"
        className="flex-row border-b border-line"
      >
        <TabButton
          label={`Følgere (${followers.length})`}
          active={active === "followers"}
          onPress={() => setActive("followers")}
        />
        <TabButton
          label={`Følger (${followingCount})`}
          active={active === "following"}
          onPress={() => setActive("following")}
        />
      </View>

      {list.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={
            active === "followers"
              ? "Ingen følgere ennå"
              : "Du følger ingen ennå"
          }
          actionLabel="Oppdag folk"
          onAction={() => router.push("/people" as Href)}
        />
      ) : (
        list.map((p) => (
          <PersonListRow
            key={p.id}
            person={p}
            line={line(p)}
            onPress={() => router.push(`/people/${p.id}` as Href)}
            action={
              <FollowButton
                following={set.has(p.id)}
                followLabel={followsMe(p.id) ? "Følg tilbake" : "Følg"}
                name={p.name}
                onPress={() => follow(p.id)}
              />
            }
          />
        ))
      )}

      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="følge folk"
      />
    </Page>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      hitSlop={{ top: 7, bottom: 7 }}
      onPress={onPress}
      feedback="none"
      className="flex-1"
      contentClassName={`items-center pb-2.5 ${
        active ? "border-b-2 border-ink" : ""
      }`}
    >
      <Text
        variant="label"
        weight={active ? "semibold" : "medium"}
        tone={active ? "ink" : "muted"}
      >
        {label}
      </Text>
    </Pressable>
  );
}
