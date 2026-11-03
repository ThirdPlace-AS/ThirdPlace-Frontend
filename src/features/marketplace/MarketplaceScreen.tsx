import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DemoBadge } from "@/components/DemoBadge";
import { RouteHeader } from "@/components/RouteHeader";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { listingById, listings, type MockListing } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { colors } from "@/theme";

// Marketplace (DEMO). Reached from Profile → Oppdag → Markedsplass. A grid of
// neighbour listings opening a detail shell. NO checkout, no cart, no payment —
// "Kontakt selger" is a demo action. BLOCKED_CONTRACT_GAP: no listing/inventory/
// pricing/checkout backend; price is a display label only.
export default function MarketplaceScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? listingById(selectedId) : undefined;
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <RouteHeader title="Markedsplass" />
      <FlatList
        data={listings}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerClassName="gap-3 pb-10 pt-1"
        ListHeaderComponent={
          <View className="flex-row items-center gap-2 px-gutter pb-2">
            <DemoBadge />
            <Text className="flex-1 text-xs text-muted">
              Demo — ingen reell handel. Ingenting kan kjøpes eller selges.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => setSelectedId(item.id)} />
        )}
      />
      <ListingSheet listing={selected} onClose={() => setSelectedId(null)} />
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
      className="flex-1 overflow-hidden rounded-2xl bg-surface active:opacity-90"
    >
      <Image
        source={libImage(listing.cover)}
        contentFit="cover"
        transition={200}
        style={{ height: 150, width: "100%" }}
        className="bg-surfaceMuted"
        accessibilityLabel={listing.title}
      />
      <View className="gap-0.5 p-2.5">
        <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
          {listing.title}
        </Text>
        <Text className="text-sm font-bold text-ember">{listing.price}</Text>
        <Text className="text-xs text-muted" numberOfLines={1}>
          {listing.sellerArea} · {listing.condition}
        </Text>
      </View>
    </Pressable>
  );
}

function ListingSheet({
  listing,
  onClose,
}: {
  listing: MockListing | undefined;
  onClose: () => void;
}) {
  const guest = useGuestMode();
  const [signIn, setSignIn] = useState<string | null>(null);
  const [contacted, setContacted] = useState(false);

  // Reset the demo "contacted" state when a new listing opens.
  const [seededFor, setSeededFor] = useState<string | undefined>(listing?.id);
  if (listing?.id !== seededFor) {
    setSeededFor(listing?.id);
    setContacted(false);
  }

  return (
    <Sheet
      visible={listing != null}
      onClose={onClose}
      title={listing?.title}
      fullHeight
    >
      {listing ? (
        <View className="gap-4">
          <Image
            source={libImage(listing.cover)}
            contentFit="cover"
            transition={200}
            style={{ height: 220, width: "100%", borderRadius: 16 }}
            className="bg-surfaceMuted"
            accessibilityLabel={listing.title}
          />

          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-ember">
              {listing.price}
            </Text>
            <View className="rounded-full border border-line bg-surface px-3 py-1">
              <Text className="text-xs text-ink">{listing.condition}</Text>
            </View>
          </View>

          <Text className="text-sm leading-5 text-ink">
            {listing.description}
          </Text>

          <View className="flex-row items-center gap-3 rounded-2xl bg-surfaceMuted p-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Ionicons name="person" size={18} color={colors.muted} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">
                {listing.sellerName}
              </Text>
              <Text className="text-xs text-muted">{listing.sellerArea}</Text>
            </View>
            <Text className="text-xs text-muted">{listing.category}</Text>
          </View>

          <View className="gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                guest.isGuest
                  ? setSignIn("kontakte selgeren")
                  : setContacted(true)
              }
              disabled={contacted}
              className={`flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
                contacted ? "bg-surfaceMuted" : "bg-ember active:opacity-90"
              }`}
            >
              <Ionicons
                name={contacted ? "checkmark" : "chatbubble-outline"}
                size={18}
                color={contacted ? colors.muted : colors.onEmber}
              />
              <Text
                className={`text-base font-semibold ${
                  contacted ? "text-muted" : "text-onEmber"
                }`}
              >
                {contacted ? "Demo — ingen melding sendt" : "Kontakt selger"}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-2">
              <DemoBadge />
              <Text className="flex-1 text-xs text-muted">
                Demo — ingen melding sendes og ingen betaling skjer.
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <SignInPrompt
        visible={signIn !== null}
        onClose={() => setSignIn(null)}
        action={signIn ?? ""}
      />
    </Sheet>
  );
}
