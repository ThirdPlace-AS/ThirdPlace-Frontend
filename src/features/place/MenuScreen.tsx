// The whole menu of a café, bar or restaurant (/place/[id]/menu), opened from
// the Meny section's "Vis hele menyen" (user 2026-11-10). A page, not a sheet:
// it is read and scrolled (founder 2026-11-06, pages for what you read). The
// offerings are single-choice chips; each section is a heading, so a screen
// reader can move section by section (the venue menus contract asks for
// accessible section navigation). Labels are the venue's own claims, so the
// page says so and points to the staff for allergens (never a medical
// guarantee). MOCK fixture content (src/fixtures/menus).
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  MenuItemRow,
  NO_MENU_TEXT,
  OfferingChips,
  offeringIndex,
} from "@/components/place/MenuSection";
import { RouteHeader } from "@/components/RouteHeader";
import { Screen, Text } from "@/components/ui";
import { placeById } from "@/fixtures";
import { menuForPlace } from "@/fixtures/menus";

export const MENU_FOOTNOTE =
  "Merkingen er stedets egen. Spør personalet om allergener.";

export default function MenuScreen() {
  const { id, offering: asked } = useLocalSearchParams<{
    id: string;
    offering?: string;
  }>();
  const place = id ? placeById(id) : undefined;
  const menu = place ? menuForPlace(place.id) : undefined;
  // Opens on the offering chosen in the page's Meny section.
  const [active, setActive] = useState(() =>
    offeringIndex(asked, menu?.offerings.length ?? 0),
  );
  const offering = menu?.offerings[active] ?? menu?.offerings[0];

  return (
    <Screen edges={["top"]}>
      <RouteHeader title="Meny" />
      <ScrollView contentContainerClassName="gap-5 px-gutter py-4 pb-12">
        {!place ? (
          <Text variant="body" tone="muted">
            Fant ikke stedet.
          </Text>
        ) : (
          <>
            <Text variant="label" tone="muted">
              {place.name}
            </Text>
            {!menu || !offering ? (
              <Text variant="body" tone="muted">
                {NO_MENU_TEXT}
              </Text>
            ) : (
              <>
                <OfferingChips
                  offerings={menu.offerings}
                  active={active}
                  onPick={setActive}
                />
                {offering.when ? (
                  <Text variant="caption" tone="muted">
                    {offering.when}
                  </Text>
                ) : null}
                {offering.sections.map((s) => (
                  <View key={s.title} className="gap-4">
                    <Text variant="h2" accessibilityRole="header">
                      {s.title}
                    </Text>
                    {s.items.map((it) => (
                      <MenuItemRow key={it.name} item={it} />
                    ))}
                  </View>
                ))}
                <Text variant="caption" tone="muted">
                  {MENU_FOOTNOTE}
                </Text>
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
