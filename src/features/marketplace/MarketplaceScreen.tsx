import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { colors } from "@/theme";

// Marketplace (DEMO), per the design (PDF p15–p16) and master spec §13: a B2B
// collaboration space where creators, businesses and enterprises offer
// venues, hosting, sponsorships and brand deals. Search + type chips (Alle /
// Venue / Skaper / Sponsing / Co-hosting / Brand), listing cards, and a detail
// sheet with "Send forespørsel" / "Lagre". BLOCKED_CONTRACT_GAP: no offers,
// contracts or payments exist — nothing is sent, saved or signed.
export default function MarketplaceScreen() {
  const { isGuest } = useGuestMode();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MockListingType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signIn, setSignIn] = useState(false);
  const selected = selectedId ? listingById(selectedId) : undefined;

  const q = query.trim().toLowerCase();
  const data = useMemo(
    () =>
      listings.filter(
        (l) =>
          (!type || l.type === type) &&
          (!q ||
            l.title.toLowerCase().includes(q) ||
            l.owner.toLowerCase().includes(q) ||
            l.tags.some((t) => t.toLowerCase().includes(q))),
      ),
    [q, type],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Marketplace" />
      <FlatList
        data={data}
        keyExtractor={(l) => l.id}
        contentContainerClassName="gap-3 px-gutter pb-10"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="gap-3 pb-1">
            <Text className="text-sm text-muted">
              Samarbeid mellom skapere og bedrifter — lokaler, vertskap,
              sponsing og brand.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/my-listings")}
              className="flex-row items-center gap-2 self-start"
            >
              <Ionicons name="albums-outline" size={16} color={colors.ember} />
              <Text className="text-sm font-semibold text-ember">
                Mine listings →
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-2 rounded-full border border-line bg-surface px-4">
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Søk listings, samarbeid …"
                placeholderTextColor={colors.muted}
                className="flex-1 py-3 text-base text-ink"
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
          <Text className="py-10 text-center text-sm text-muted">
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
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="sende forespørsler i Marketplace"
      />
    </SafeAreaView>
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
      className="flex-row gap-3 rounded-2xl border border-line bg-surface p-3 active:opacity-80"
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
        <Text className="text-xs text-muted" numberOfLines={1}>
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
          <Text className="text-sm text-ink">{listing.description}</Text>
          <View className="overflow-hidden rounded-xl border border-line bg-surface">
            {[{ label: "Pris", value: listing.terms }, ...listing.details].map(
              (d) => (
                <View
                  key={d.label}
                  className="flex-row justify-between border-b border-line px-3.5 py-3"
                >
                  <Text className="text-sm text-muted">{d.label}</Text>
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
          <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <Ionicons name="storefront-outline" size={18} color={colors.ink} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">
                {listing.owner}
              </Text>
              <Text className="text-xs text-muted">{listing.ownerMeta}</Text>
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
