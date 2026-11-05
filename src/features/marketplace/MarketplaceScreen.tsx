import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import { Icon, Screen } from "@/components/ui";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { DemoNote } from "@/components/DemoNote";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  LISTING_TYPES,
  listingById,
  listings,
  type MockListing,
  type MockListingType,
} from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { useThemeColors } from "@/theme";

// Marketplace (DEMO), per the design (PDF p15–p16) and master spec §13: a B2B
// collaboration space where creators, businesses and enterprises offer
// venues, hosting, sponsorships and brand deals. Search + type chips (Alle /
// Venue / Skaper / Sponsing / Co-hosting / Brand), listing cards, and a detail
// sheet with "Send forespørsel" / "Lagre". BLOCKED_CONTRACT_GAP: no offers,
// contracts or payments exist — nothing is sent, saved or signed.
export default function MarketplaceScreen() {
  const colors = useThemeColors();
  const { isGuest } = useGuestMode();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MockListingType | null>(null);
  // Filtre (PDF p16): only facets the fixtures carry — 'Kun gratis' reads
  // the display terms; no invented price logic.
  const [freeOnly, setFreeOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signIn, setSignIn] = useState(false);
  const selected = selectedId ? listingById(selectedId) : undefined;

  const q = query.trim().toLowerCase();
  const data = useMemo(
    () =>
      listings.filter(
        (l) =>
          (!type || l.type === type) &&
          (!freeOnly || l.terms.toLowerCase().includes("gratis")) &&
          (!q ||
            l.title.toLowerCase().includes(q) ||
            l.owner.toLowerCase().includes(q) ||
            l.tags.some((t) => t.toLowerCase().includes(q))),
      ),
    [q, type, freeOnly],
  );

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Marketplace" />
      <FlatList
        data={data}
        keyExtractor={(l) => l.id}
        contentContainerClassName="gap-3 px-gutter pb-10"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="gap-3 pb-1">
            <Text className="text-sm text-muted font-normal">
              Samarbeid mellom skapere og bedrifter — lokaler, vertskap,
              sponsing og brand.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/my-listings")}
              className="flex-row items-center gap-2 self-start"
            >
              <Icon name="albums-outline" size="sm" tone="ember" />
              <Text className="text-sm font-semibold text-emberText">
                Mine listings →
              </Text>
            </Pressable>
            <View className="flex-row gap-4">
              <Pressable
                accessibilityRole="button"
                onPress={() => setFilterOpen(true)}
                className="flex-row items-center gap-1.5"
              >
                <Icon name="options-outline" size="sm" tone="ink" />
                <Text className="text-sm font-semibold text-ink">
                  Filtre{freeOnly ? " (1)" : ""}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/workspace/analytics" as Href)}
                className="flex-row items-center gap-1.5"
              >
                <Icon name="stats-chart-outline" size="sm" tone="ink" />
                <Text className="text-sm font-semibold text-ink">Analyse</Text>
              </Pressable>
            </View>
            <View className="flex-row items-center gap-2 rounded-full border border-line bg-surface px-4">
              <Icon name="search" size="md" tone="muted" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Søk listings, samarbeid …"
                placeholderTextColor={colors.muted}
                className="flex-1 py-3 text-base text-ink font-normal"
                accessibilityLabel="Søk i Marketplace"
              />
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label="Alle"
                selected={type === null}
                onPress={() => setType(null)}
              />
              {LISTING_TYPES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={type === t}
                  onPress={() => setType(t)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text className="py-10 text-center text-sm text-muted font-normal">
            Ingen listings matcher søket.
          </Text>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => setSelectedId(item.id)} />
        )}
      />

      <ListingSheet
        listing={selected}
        onClose={() => setSelectedId(null)}
        onGuest={() => {
          setSelectedId(null);
          setSignIn(true);
        }}
        isGuest={isGuest}
      />
      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filtre"
      >
        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink">Type</Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip
              label="Alle"
              selected={type === null}
              onPress={() => setType(null)}
            />
            {LISTING_TYPES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={type === t}
                onPress={() => setType(t)}
              />
            ))}
          </View>
          <Text className="text-sm font-semibold text-ink">Vilkår</Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip
              label="Kun gratis / eksponering"
              selected={freeOnly}
              onPress={() => setFreeOnly((f) => !f)}
            />
          </View>
          <Button
            label={`Vis ${data.length} listings`}
            variant="ink"
            onPress={() => setFilterOpen(false)}
          />
        </View>
      </Sheet>
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="sende forespørsler i Marketplace"
      />
    </Screen>
  );
}

function ListingCard({
  listing,
  onPress,
}: {
  listing: MockListing;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row gap-3 rounded-lg border border-line bg-surface p-3 active:opacity-80"
    >
      <Image
        source={libImage(listing.cover)}
        contentFit="cover"
        transition={150}
        style={{ height: 88, width: 88, borderRadius: 12 }}
        className="bg-surfaceMuted"
        accessibilityLabel={listing.title}
      />
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {listing.title}
        </Text>
        <View className="self-start rounded-full bg-surfaceMuted px-2 py-0.5">
          <Text className="text-[11px] font-semibold text-ink">
            {listing.type}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-ink">{listing.terms}</Text>
        <Text className="text-xs text-muted font-normal" numberOfLines={1}>
          {listing.owner}
        </Text>
      </View>
    </Pressable>
  );
}

function ListingSheet({
  listing,
  onClose,
  onGuest,
  isGuest,
}: {
  listing: MockListing | undefined;
  onClose: () => void;
  onGuest: () => void;
  isGuest: boolean;
}) {
  const [notice, setNotice] = useState<"save" | null>(null);
  const close = () => {
    setNotice(null);
    onClose();
  };
  return (
    <Sheet
      visible={listing !== undefined}
      onClose={close}
      title={listing?.title ?? ""}
    >
      {listing ? (
        <View className="gap-4">
          <Image
            source={libImage(listing.cover)}
            contentFit="cover"
            style={{ height: 168, width: "100%", borderRadius: 14 }}
            className="bg-surfaceMuted"
          />
          <View className="self-start rounded-full bg-surfaceMuted px-2.5 py-1">
            <Text className="text-xs font-semibold text-ink">
              {listing.type}
            </Text>
          </View>
          <Text className="text-sm text-ink font-normal">
            {listing.description}
          </Text>
          <View className="overflow-hidden rounded-md border border-line bg-surface">
            {[{ label: "Pris", value: listing.terms }, ...listing.details].map(
              (d) => (
                <View
                  key={d.label}
                  className="flex-row justify-between border-b border-line px-3.5 py-3"
                >
                  <Text className="text-sm text-muted font-normal">
                    {d.label}
                  </Text>
                  <Text className="text-sm font-medium text-ink">
                    {d.value}
                  </Text>
                </View>
              ),
            )}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {listing.tags.map((t) => (
              <View key={t} className="rounded-full bg-surfaceMuted px-3 py-1">
                <Text className="text-xs font-medium text-ink">{t}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3">
            <Icon name="storefront-outline" size="md" tone="ink" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">
                {listing.owner}
              </Text>
              <Text className="text-xs text-muted font-normal">
                {listing.ownerMeta}
              </Text>
            </View>
          </View>
          {notice ? <DemoNote>Listingen lagres ikke.</DemoNote> : null}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Send forespørsel"
                variant="ink"
                onPress={() => {
                  if (isGuest) return onGuest();
                  close();
                  router.push({
                    pathname: "/collab/new",
                    params: { listing: listing.id },
                  });
                }}
              />
            </View>
            <View className="w-28">
              <Button
                label="Lagre"
                variant="secondary"
                onPress={() => (isGuest ? onGuest() : setNotice("save"))}
              />
            </View>
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}
