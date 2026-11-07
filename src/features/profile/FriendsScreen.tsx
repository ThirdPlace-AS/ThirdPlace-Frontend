// Venner (PDF p13): people who follow you and whom you follow
// ("gjensidige følginger"), counted from those lists, with search and a DM
// button that opens or starts the direct message. The header's person-add
// opens Oppdag folk. Left out: the PDF's "Sist aktiv" lines and online dots,
// because presence is not specified (MAP_BLOCKERS CB-2 / CB-3).
// BLOCKED_CONTRACT_GAP: no follow-graph or messaging backend.
import { router, type Href } from "expo-router";
import { useState } from "react";

import { Button } from "@/components/Button";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { EmptyState, IconButton, Page, SearchBar, Text } from "@/components/ui";
import { directChatFor } from "@/fixtures/created";
import { PersonListRow } from "@/features/people/PersonListRow";
import { friendPeople, useFollowing } from "@/lib/following";

export default function FriendsScreen() {
  const set = useFollowing();
  const { isGuest } = useGuestMode();
  const [q, setQ] = useState("");
  const [signIn, setSignIn] = useState(false);

  const friends = friendPeople(set);
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? friends.filter((p) => p.name.toLowerCase().includes(needle))
    : friends;

  return (
    <Page
      title="Venner"
      trailing={
        <IconButton
          icon="person-add-outline"
          label="Oppdag folk"
          onPress={() => router.push("/people" as Href)}
        />
      }
    >
      <Text variant="caption" tone="muted">
        {friends.length === 1
          ? "1 gjensidig følging"
          : `${friends.length} gjensidige følginger`}
      </Text>

      {friends.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Ingen venner ennå"
          message="Venner er folk du følger som også følger deg."
          actionLabel="Oppdag folk"
          onAction={() => router.push("/people" as Href)}
        />
      ) : (
        <>
          <SearchBar
            placeholder="Søk venner …"
            value={q}
            onChangeText={setQ}
            accessibilityLabel="Søk venner"
          />
          {shown.length === 0 ? (
            <EmptyState icon="search-outline" title="Ingen treff" />
          ) : (
            shown.map((p) => (
              <PersonListRow
                key={p.id}
                person={p}
                line={p.area}
                onPress={() => router.push(`/people/${p.id}` as Href)}
                action={
                  <Button
                    label="DM"
                    size="sm"
                    variant="secondary"
                    fullWidth={false}
                    accessibilityLabel={`Send melding til ${p.name}`}
                    onPress={() =>
                      isGuest
                        ? setSignIn(true)
                        : router.push(`/chat/${directChatFor(p)}` as Href)
                    }
                  />
                }
              />
            ))
          )}
        </>
      )}

      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="sende meldinger"
      />
    </Page>
  );
}
