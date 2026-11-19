// Person page (/people/[id]), laid out per PDF p13 ("other user"): photo,
// name, handle and area, bio, interest chips with the ones you share marked,
// "Offentlige opplevelser", then Følg + Melding. Rapporter and Blokker sit
// behind the ••• in the header. A page since Phase 12 H4c (content you read).
// BLOCKED_CONTRACT_GAP: no person entity, follow or messaging backend.
// Following is the shared in-memory store; Melding opens the direct message
// with this person or starts an empty one (src/fixtures/created.ts); guests
// get the sign-in prompt.
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { BlockSheet, ReportSheet } from "@/components/actions/ActionSheets";
import { Button } from "@/components/Button";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  EmptyState,
  FollowButton,
  Header,
  IconButton,
  ListRow,
  Screen,
} from "@/components/ui";
import { experiencesHostedBy, people, profile } from "@/fixtures";
import { directChatFor } from "@/fixtures/created";
import { libImage } from "@/fixtures/images";
import { toggleFollow, useFollowing } from "@/lib/following";
import { useMyProfile } from "@/lib/myProfile";
import { goBackOr } from "@/lib/navigation";

import { PersonProfileBody } from "./PersonProfileBody";

// Sheets close in 200 ms; the next one opens after that (one Modal at a time).
const SHEET_SWAP_MS = 260;

type SubSheet = "report" | "block";

export default function PersonScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const person = people.find((p) => p.id === id);
  const following = useFollowing();
  const me = useMyProfile();
  const { isGuest } = useGuestMode();
  const [menu, setMenu] = useState(false);
  const [sub, setSub] = useState<SubSheet | null>(null);
  const [signIn, setSignIn] = useState<string | null>(null);

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

  // Everything the person hosts (catalogue hosts run several, Phase 19).
  const hosted = experiencesHostedBy(person.id);
  const isFollowing = following.has(person.id);
  const shared = new Set(
    person.interests.filter((i) => me.interests.includes(i)),
  );

  const openSub = (next: SubSheet) => {
    setMenu(false);
    setTimeout(() => setSub(next), SHEET_SWAP_MS);
  };

  const message = () => {
    if (isGuest) {
      setSignIn("sende meldinger");
      return;
    }
    router.push(`/chat/${directChatFor(person)}` as Href);
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <Header
        title={person.name}
        trailing={
          <IconButton
            icon="ellipsis-horizontal"
            label="Mer"
            onPress={() => setMenu(true)}
          />
        }
      />
      <ScrollView contentContainerClassName="gap-6 px-gutter pb-12 pt-4">
        <PersonProfileBody
          name={person.name}
          avatar={libImage(person.avatar)}
          meta={`${person.handle} · ${person.area}`}
          bio={person.bio}
          interests={person.interests}
          shared={shared}
          hosted={hosted}
          onOpenExperience={(eid) => router.push(`/experience/${eid}` as Href)}
          actions={
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FollowButton
                  following={isFollowing}
                  onPress={() =>
                    isGuest ? setSignIn("følge folk") : toggleFollow(person.id)
                  }
                  followLabel={
                    profile.followerIds.includes(person.id)
                      ? "Følg tilbake"
                      : "Følg"
                  }
                  name={person.name}
                  size="md"
                  fullWidth
                />
              </View>
              <Button
                label="Melding"
                variant="secondary"
                fullWidth={false}
                onPress={message}
              />
            </View>
          }
        />
      </ScrollView>

      <Sheet visible={menu} onClose={() => setMenu(false)} title={person.name}>
        <ListRow
          icon="flag-outline"
          title="Rapporter"
          onPress={() => openSub("report")}
        />
        <ListRow
          icon="ban-outline"
          title="Blokker"
          onPress={() => openSub("block")}
        />
      </Sheet>
      {sub === "report" ? <ReportSheet onClose={() => setSub(null)} /> : null}
      {sub === "block" ? (
        <BlockSheet
          name={person.name}
          personId={person.id}
          onClose={() => setSub(null)}
        />
      ) : null}
      <SignInPrompt
        visible={signIn !== null}
        onClose={() => setSignIn(null)}
        action={signIn ?? ""}
      />
    </Screen>
  );
}
