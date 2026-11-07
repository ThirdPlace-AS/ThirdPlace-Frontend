import { router, type Href } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import {
  Icon,
  ListRow,
  Pressable,
  Screen,
  StickyFooter,
  Text,
} from "@/components/ui";

// "Du er nå Skaper!", per the design (PDF p14, bottom left): the
// success screen after an approved Skaper application. Applications are not
// evaluated (BLOCKED_CONTRACT_GAP; Bli Skaper keeps its button muted until the
// example requirements are met), so this screen is reachable only by deep link
// (thirdplace://creator-welcome) for review. What the role gives access to is
// the design's copy, not a decided entitlement (BLOCKED_CONTRACT_GAP).
// The PDF's emoji row icons are drawn with the icon set instead.
const ROWS: {
  icon: "trending-up-outline" | "people-outline" | "calendar-outline";
  title: string;
  subtitle: string;
  href: Href;
}[] = [
  {
    icon: "trending-up-outline",
    title: "Dashbord",
    subtitle: "Analyse, inntekt og deltakeroversikt",
    href: "/workspace/analytics" as Href,
  },
  {
    icon: "people-outline",
    title: "Marketplace",
    subtitle: "Finn samarbeid og venue-partnere",
    href: "/marketplace" as Href,
  },
  {
    icon: "calendar-outline",
    title: "Innholdskalender",
    subtitle: "Planlegg og administrer opplevelser",
    href: "/workspace/calendar" as Href,
  },
];

export default function CreatorWelcomeScreen() {
  const leave = () =>
    router.canGoBack() ? router.back() : router.replace("/profile");
  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-6 px-gutter pb-8 pt-12">
        <View className="items-center gap-4">
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Godkjent"
            className="h-28 w-28 items-center justify-center rounded-full bg-success/15"
          >
            <View className="h-16 w-16 items-center justify-center rounded-full bg-success">
              <Icon name="checkmark" size="xl" tone="onInk" />
            </View>
          </View>
          <Text variant="h1" className="text-center">
            Du er nå Skaper!
          </Text>
          <Text variant="body" tone="muted" className="px-4 text-center">
            Gratulerer! Nå kan du bruke Dashbord, Marketplace og
            innholdskalenderen.
          </Text>
        </View>

        <View className="gap-2">
          {ROWS.map((r) => (
            <ListRow
              key={r.title}
              variant="card"
              icon={r.icon}
              title={r.title}
              subtitle={r.subtitle}
              onPress={() => router.push(r.href)}
            />
          ))}
        </View>
      </ScrollView>
      {/* Pinned: on a 640 dp phone the CTA used to sit under the fold. */}
      <StickyFooter>
        <Button
          label="Utforsk ditt nye hjem →"
          variant="ink"
          onPress={() => router.replace("/marketplace" as Href)}
        />
        <Pressable
          hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
          accessibilityRole="button"
          onPress={leave}
          className="items-center py-2"
        >
          <Text variant="label" weight="semibold" tone="muted">
            Hopp over for nå
          </Text>
        </Pressable>
      </StickyFooter>
    </Screen>
  );
}
