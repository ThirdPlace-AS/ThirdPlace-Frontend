import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  Badge,
  EmptyState,
  IconButton,
  Screen,
  ScrollRow,
  Text,
} from "@/components/ui";
import { Chip } from "@/components/Chip";
import { RouteHeader } from "@/components/RouteHeader";
import { listingById, myListingStates } from "@/fixtures";

// Mine listings, per the design (PDF p16); Ny / Rediger listing are form
// pages (/my-listings/new, /my-listings/[id]/edit, Phase 12 H4c).
// Tabs Aktive / Utkast / Avsluttede over the user's example listings, a
// pencil per row to edit, a "Venteliste (n)" link on a full listing (PDF p18)
// and a "+" for a new listing. BLOCKED_CONTRACT_GAP:
// no listing entity, publishing or pricing contract — nothing is published or
// saved, and no view/request counts are shown (no invented social proof).
const TABS = ["Aktive", "Utkast", "Avsluttede"] as const;
// The same list Marketplace-analyse counts (fixtures `myListingStates`).
const MINE = Object.entries(myListingStates).flatMap(([id, state]) => {
  const l = listingById(id);
  return l ? [{ ...l, state }] : [];
});

export default function MyListingsScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Aktive");
  const rows = MINE.filter((l) => l.state === tab);
  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Mine listings" />
      <ScrollView contentContainerClassName="gap-3 px-gutter py-4 pb-28">
        <ScrollRow radio>
          {TABS.map((t) => (
            <Chip
              key={t}
              role="radio"
              label={`${t} (${MINE.filter((l) => l.state === t).length})`}
              selected={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </ScrollRow>
        {rows.length === 0 ? (
          <EmptyState
            fill={false}
            icon="pricetags-outline"
            title="Ingen listings her ennå"
            message="Bruk + nederst for å lage en."
          />
        ) : null}
        {rows.map((l) => (
          <View
            key={l.id}
            className="flex-row items-center gap-3 rounded-lg border border-line bg-surface p-3.5"
          >
            <View className="flex-1 gap-1">
              <Text variant="body" weight="semibold">
                {l.title}
              </Text>
              <Badge kind="status" label={l.type} />
              {l.waitlist && l.waitlist.length > 0 ? (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Venteliste for ${l.title}, ${l.waitlist.length} venter`}
                  onPress={() =>
                    router.push(`/my-listings/${l.id}/waitlist` as Href)
                  }
                  hitSlop={{ top: 8, bottom: 8 }}
                  className="self-start"
                >
                  <Text
                    variant="caption"
                    weight="semibold"
                    className="underline"
                  >
                    Venteliste ({l.waitlist.length})
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Rediger ${l.title}`}
              onPress={() => router.push(`/my-listings/${l.id}/edit` as Href)}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text variant="label" weight="semibold" className="underline">
                Rediger
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <IconButton
        icon="add"
        label="Ny listing"
        variant="ember"
        size="xl"
        onPress={() => router.push("/my-listings/new" as Href)}
        className="absolute bottom-6 right-5"
      />
    </Screen>
  );
}
