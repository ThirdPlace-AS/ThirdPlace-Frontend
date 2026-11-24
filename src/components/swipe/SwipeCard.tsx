import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoingLine } from "@/components/GoingLine";
import { MetaRow, Text } from "@/components/ui";
import { imageTopTint } from "@/fixtures/images";
import { headBandColors, media } from "@/theme";
import type { IconName } from "@/components/ui";

import type { DeckItem } from "./deckItems";
import { PhotoCarousel } from "./PhotoCarousel";
import {
  SWIPE_ACTIONS_HEIGHT,
  SWIPE_PANEL_HEIGHT,
  SWIPE_PANEL_PAD_BOTTOM,
} from "./SwipeActions";

// Leading icon per tag — still used by the Filtre sheet's interest chips.
const TAG_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Sosialt: "people-outline",
  Kaffe: "cafe-outline",
  Bøker: "book-outline",
  Diskusjon: "chatbubbles-outline",
  Vin: "wine-outline",
  Smaking: "restaurant-outline",
  Trening: "barbell-outline",
  Løping: "walk-outline",
  Spill: "game-controller-outline",
  Foto: "camera-outline",
  Kultur: "color-palette-outline",
};
export const tagIcon = (t: string): keyof typeof Ionicons.glyphMap =>
  TAG_ICONS[t] ?? "pricetag-outline";

// One icon + text meta row (location / date / spots). White, bright, single-line.
function InfoRow({ icon, children }: { icon: IconName; children: string }) {
  return <MetaRow icon={icon} text={children} tone="media" numberOfLines={1} />;
}

// What the info block shows under the title on each photo, as the reference
// does (user 2026-11-18): the first photo the basics (where, when, who is
// going), the next the "about" text, then the interests / vibes; later photos
// the title alone. A page with nothing to show is skipped.
export type InfoPage = "basics" | "about" | "tags";
export function infoPages(item: Pick<DeckItem, "about" | "chips">): InfoPage[] {
  const pages: InfoPage[] = ["basics"];
  if (item.about.trim()) pages.push("about");
  if (item.chips.length > 0) pages.push("tags");
  return pages;
}

// The pages shown on photo `photo` of `count`: one page per photo, and the last
// photo also takes every page left over (most cards have two photos, so the
// second shows the about text and the interests together). Empty = title only.
export function pagesForPhoto(
  item: Pick<DeckItem, "about" | "chips">,
  photo: number,
  count: number,
): InfoPage[] {
  const pages = infoPages(item);
  if (photo >= count - 1) return pages.slice(Math.max(0, photo));
  return pages.slice(photo, photo + 1);
}

// The info block sits a fixed gap above the action row, which floats over the
// card (2026-11-18: the shadow under the buttons is the card's own foot, not a
// panel, so a dragged card takes it along and the next card shows its own).
// FOOT_FADE is the photo's fade into the deck colour; FOOT_SOLID more stays
// solid above the row's reserve, and below it the card is solid to its bottom
// edge. Sized to what the info block needs to be readable and no more (user
// 2026-11-20: the shadow reached too far up the photo; it was 190 dp).
// The block's last line sits 17 dp above the large discs' tops (measured on
// the reference 2026-11-18: 52 px from the last info line to the X and heart).
// The pages under the title are kept to about one height (InfoPages), so the
// reserved block leaves no empty band above that gap.
// The card ends this far above the tab bar (7 dp, measured on the reference),
// so its bottom corners show against the bar's colour instead of running into
// it. The info keeps its distance to the discs, so it is measured from the
// card's own bottom less this gap.
export const CARD_BOTTOM_GAP = 7;
export const SWIPE_INFO_BOTTOM =
  SWIPE_PANEL_PAD_BOTTOM + SWIPE_ACTIONS_HEIGHT + 17 - CARD_BOTTOM_GAP;
// The head band, measured on the reference (2026-11-18, dp past the top
// inset): solid through the top bar (down to 22 dp above the photo pills), then
// a 26 dp fade into the photo: no taller than the tabs and pills need to be
// readable (user 2026-11-20).
const PILLS_TOP = 62;
const HEAD_FLAT = PILLS_TOP - 22;
const HEAD_H = HEAD_FLAT + 26;
// How far down the top shadow reaches past the status bar (dp): the top bar's
// touch area goes to the same line.
export const HEAD_BAND_H = HEAD_H;
function headStops(inset: number) {
  return [0, (inset + HEAD_FLAT) / (inset + HEAD_H), 1] as const;
}
// The card's corners, measured on the reference (2026-11-18): 120 px on a
// 3x screen, the same on all four corners, so the rounding shows at the top
// under the status bar and above the tab bar.
export const CARD_RADIUS = 40;
// The info area under the title: the tallest page (three basics lines at 70,
// the about text at 75) measured on the phone 2026-11-20.
const INFO_PAGES_H = 75;
const FOOT_FADE = 120;
const FOOT_SOLID = 30;
const FOOT_H = FOOT_FADE + FOOT_SOLID + SWIPE_PANEL_HEIGHT;
const FOOT_STOPS = [
  0,
  0.4 * (FOOT_FADE / FOOT_H),
  0.75 * (FOOT_FADE / FOOT_H),
  FOOT_FADE / FOOT_H,
  1,
] as const;

// A single full-bleed swipe card (presentational only — no gesture/animation).
// The photo fills the whole card edge-to-edge; a top + bottom gradient keep the
// overlaid filter bar and the white info legible. Drag stamps + expand/action
// overlays live in SwipeDeck (outside the gesture so taps work on web).
// Joining/saving is local state (BLOCKED_CONTRACT_GAP). The host and the rest
// of the details live on the full page.
//
// `minimal` leaves out the gradients and the info (the deck's third card, fully
// covered, where they would be pure overdraw). The tree keeps the same shape in
// every role, so a card that moves up the deck keeps its photo mounted and
// painted instead of being built again (the flash between swipes, 2026-11-18).
// `onInfoTop` reports the measured top Y of the info block
// so the deck can align the expand arrow to the actual title row.

export const SwipeCard = memo(function SwipeCard({
  item,
  interactive = true,
  minimal = false,
  onInfoTop,
  photo: photoProp,
  onPhoto,
}: {
  /** An experience or a place, as one card model (deckItems.ts). */
  item: DeckItem;
  interactive?: boolean;
  minimal?: boolean;
  onInfoTop?: (y: number) => void;
  /** Controlled photo index (the deck shares it with the details). */
  photo?: number;
  onPhoto?: (index: number) => void;
}) {
  const insets = useSafeAreaInsets();
  // The photo on show picks the info under the title (the deck keys each top
  // card by item, so a new card starts at its first photo).
  const [ownPhoto, setOwnPhoto] = useState(0);
  const photo = photoProp ?? ownPhoto;
  const setPhoto = onPhoto ?? setOwnPhoto;
  const count = item.photos.length;
  const shown = pagesForPhoto(item, photo, count);
  // The whole photo shows, uncropped, between the two shadows: the box runs
  // from the middle of the top shadow to the middle of the foot shadow, both
  // inside the solid parts, so there is no seam (user 2026-11-21).
  const photoTop = Math.round((insets.top + HEAD_H) / 2);
  const photoBottom = Math.round(FOOT_H / 2);
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: CARD_RADIUS, backgroundColor: media.deck },
      ]}
      className="overflow-hidden"
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: photoTop,
          bottom: photoBottom,
        }}
      >
        <PhotoCarousel
          photos={item.photos}
          interactive={interactive}
          indicator={!minimal}
          indicatorTop={insets.top + PILLS_TOP - photoTop}
          fit="contain"
          variant="card"
          onIndexChange={setPhoto}
          index={photo}
          overlay={
            // Head band — even behind the status bar and the filter bar, then a
            // short fade: the top's counterpart of the foot. It takes the shown
            // photo's own colour (user 2026-11-18) and sits under the photo
            // pills, so they stay bright. Fixed height past the inset.
            minimal ? null : (
              <LinearGradient
                colors={headBandColors(imageTopTint(item.photos[photo]))}
                locations={headStops(insets.top)}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  // From the card's top edge, above the photo box's own top.
                  top: -photoTop,
                  height: insets.top + HEAD_H,
                }}
                pointerEvents="none"
              />
            )
          }
        />
      </View>
      {/* Foot — the photo fades into the deck colour and stays solid behind
          the action row. Fixed height, so the fade is the same on every
          phone (fractions of the card shifted with its height). */}
      {minimal ? null : (
        <LinearGradient
          colors={media.gradientFoot}
          locations={FOOT_STOPS}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: FOOT_H,
          }}
          pointerEvents="none"
        />
      )}

      {/* ─── Bottom info overlay — one consolidated block, bottom-anchored ─────
          name, then the info for the photo on show (pagesForPhoto): the
          basics (experience: where · distance, when, who is going and places
          left; place: kind · area · distance, rating), the about text, the
          interests. The full page has the rest. Reports its resolved
          top Y so the deck can pin the open-page arrow to the title row (the
          block height varies with title lines). */}
      {minimal ? null : (
        <View
          style={{ bottom: SWIPE_INFO_BOTTOM, gap: 8 }}
          className="absolute inset-x-0 px-gutter pr-16"
          onLayout={(e) => onInfoTop?.(e.nativeEvent.layout.y)}
        >
          {/* One line on every card, so the block is the same height on all of
              them (user 2026-11-20): a longer title shrinks its type to fit
              instead of taking a second line. */}
          <Text
            variant="display"
            tone="onMedia"
            className="tracking-tight"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            accessibilityRole="header"
            accessibilityLiveRegion={interactive ? "polite" : "none"}
          >
            {item.title}
          </Text>

          {/* The info under the title has one height on every photo and every
              card (INFO_PAGES_H, the tallest page measured on the fixtures); a
              shorter page starts right under the title, as on an experience, so the
              spacing is the same on every kind of card (user 2026-11-20). */}
          <View
            style={{ minHeight: INFO_PAGES_H, justifyContent: "flex-start" }}
          >
            <InfoPages item={item} shown={shown} />
          </View>
        </View>
      )}
    </View>
  );
});

// The info under the title for one photo: the basics, the about text, the
// interests (pagesForPhoto). Reports its laid-out height. Every page stays
// about as tall as the basics (three lines), so the reserved height (the
// tallest page) leaves little slack under the title (user 2026-11-18): the
// about text takes two lines, the interests one row.
function InfoPages({ item, shown }: { item: DeckItem; shown: InfoPage[] }) {
  return (
    <View style={{ gap: 8 }}>
      {shown.includes("basics") ? (
        <View style={{ gap: 4 }}>
          {/* An experience: the first two lines plus who is going and places
            left (user 2026-11-18). A place: its type, where it is and its
            rating, three rows like the experience (user 2026-11-20). */}
          {item.lines
            .filter((l, i) => i < (item.kind === "place" ? 3 : 2) || l.goingId)
            .map((l) =>
              l.goingId ? (
                // Who is going: faces of people who opted in, then the count.
                <GoingLine key={l.icon} id={l.goingId} onMedia />
              ) : (
                <InfoRow key={l.icon} icon={l.icon}>
                  {l.text}
                </InfoRow>
              ),
            )}
        </View>
      ) : null}
      {shown.includes("about") ? (
        <Text variant="body" tone="onMedia" numberOfLines={2}>
          {item.about}
        </Text>
      ) : null}
      {shown.includes("tags") ? (
        <View className="flex-row gap-2 overflow-hidden">
          {item.chips.slice(0, 3).map((t) => (
            <View
              key={t}
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: media.fillSubtle,
                borderWidth: 1,
                borderColor: media.hairlineStrong,
              }}
            >
              <Text variant="label" tone="onMedia" numberOfLines={1}>
                {t}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
