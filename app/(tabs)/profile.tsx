import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import {
  Header,
  Icon,
  IconButton,
  Screen,
  Avatar,
  ListRow,
  Pressable as UIPressable,
  Text,
  type IconName,
} from "@/components/ui";
import { GuestLock } from "@/components/GuestLock";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { tagIcon } from "@/components/swipe/SwipeCard";
import { experienceById, placeById, profile } from "@/fixtures";
import { useProfileCounts } from "@/lib/following";
import { useMyProfile } from "@/lib/myProfile";
import {
  coverForPlace,
  libImage,
  libThumb,
  smallImage,
} from "@/fixtures/images";

type Tab = "experiences" | "places" | "reviews";
const TABS: { key: Tab; label: string }[] = [
  { key: "experiences", label: "Opplevelser" },
  { key: "places", label: "Steder" },
  { key: "reviews", label: "Anmeldelser" },
];

// Profile, laid out per the design (PDF p12): header with name +
// age and bio, Følgere / Følger / Venner, interest chips, the "Veien til
// Skaper" card, and Opplevelser / Steder / Anmeldelser tabs. Settings sit
// behind the gear. Følgere / Følger / Venner are counted from the fixture
// follow lists and open them (PDF p13). BLOCKED_CONTRACT_GAP: no account,
// follow graph, review or creator-progression backend; everything is MOCK.
export default function ProfileScreen() {
  const { isGuest } = useGuestMode();
  const me = useMyProfile();
  const counts = useProfileCounts();
  const [tab, setTab] = useState<Tab>("experiences");
  const [signIn, setSignIn] = useState(false);

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-5 p-gutter pb-10">
        <Header
          title="Profil"
          size="large"
          inset={false}
          trailing={
            <>
              <HeaderIcon
                icon="calendar-outline"
                label="Mine planer"
                onPress={() => router.push("/plans")}
              />
              <HeaderIcon
                icon="bookmark-outline"
                label="Lagret"
                onPress={() => router.push("/saved")}
              />
              <HeaderIcon
                icon="settings-outline"
                label="Innstillinger"
                onPress={() => router.push("/settings" as Href)}
              />
            </>
          }
        />

        {isGuest ? (
          <GuestProfile onSignIn={() => setSignIn(true)} />
        ) : (
          <>
            {/* Header — tapping it opens Rediger profil (PDF p13). */}
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel="Rediger profil"
              accessibilityHint={`${me.name}, ${me.age}`}
              onPress={() => router.push("/profile/edit" as Href)}
              pressedScale={0.99}
              contentClassName="flex-row items-center gap-4"
            >
              <Avatar
                name={me.name}
                source={me.avatar ? libImage(me.avatar) : undefined}
                size="xl"
                decorative
              />
              <View className="flex-1 gap-1">
                <Text variant="h1" accessibilityRole="text">
                  {me.name}, {me.age}
                </Text>
                {me.bio ? (
                  <Text variant="caption" tone="muted">
                    {me.bio}
                  </Text>
                ) : null}
              </View>
            </UIPressable>

            {/* Counted from the follow lists (src/lib/following.ts); each
                opens its list (PDF p13). */}
            <View className="flex-row items-center gap-8">
              <Stat
                value={counts.followers}
                label="Følgere"
                onPress={() => router.push("/profile/followers" as Href)}
              />
              <Stat
                value={counts.following}
                label="Følger"
                onPress={() =>
                  router.push("/profile/followers?tab=following" as Href)
                }
              />
              <Stat
                value={counts.friends}
                label="Venner"
                onPress={() => router.push("/profile/friends" as Href)}
              />
            </View>

            <View className="flex-row flex-wrap gap-2">
              {me.interests.map((i) => (
                <View
                  key={i}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5"
                >
                  <Text variant="label">{i}</Text>
                </View>
              ))}
            </View>

            <NextPlanCard />

            <CreatorPathCard />

            <TabBar tab={tab} onChange={setTab} />
            {tab === "experiences" ? <ActivityList /> : null}
            {tab === "places" ? <PlacesList /> : null}
            {tab === "reviews" ? <ReviewsList /> : null}
          </>
        )}
      </ScrollView>

      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="se profilen din"
      />
    </Screen>
  );
}

function HeaderIcon({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return <IconButton icon={icon} label={label} onPress={onPress} />;
}

function GuestProfile({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View className="gap-4">
      <GuestLock message="Du utforsker som gjest. Opprett en konto for å få en profil, lagre steder og bli med på opplevelser." />
      <Button label="Logg inn" variant="ink" onPress={onSignIn} />
    </View>
  );
}

function Stat({
  value,
  label,
  onPress,
}: {
  value: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label.toLowerCase()}`}
      onPress={onPress}
      hitSlop={8}
    >
      <Text variant="title" weight="bold">
        {value}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </UIPressable>
  );
}

// "Neste plan" (approved addition, 2026-11-06): the first upcoming plan from
// the same fixture Mine planer reads (no second attendance truth, spec §11),
// with its "when" label as written: no countdown, no reminder copy.
function NextPlanCard() {
  const next = profile.plans.find((p) => p.state === "upcoming");
  const exp = next ? experienceById(next.experienceId) : undefined;
  if (!exp) return null;
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="label" weight="semibold">
          Neste plan
        </Text>
        <UIPressable
          accessibilityRole="link"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          onPress={() => router.push("/plans")}
        >
          <Text variant="label" weight="semibold" tone="ember">
            Alle planer
          </Text>
        </UIPressable>
      </View>
      <ListRow
        variant="card"
        title={exp.title}
        subtitle={exp.when}
        leading={
          <Image
            source={smallImage(exp.photos[0])}
            contentFit="cover"
            style={{ height: 44, width: 44, borderRadius: 10 }}
            accessible={false}
          />
        }
        trailing={null}
        onPress={() => router.push(`/experience/${exp.id}` as Href)}
      />
    </View>
  );
}

// "Veien til Skaper" (PDF p12). The copy is illustrative: the real creator
// criteria are not defined in the contract, so nothing here is evaluated.
function CreatorPathCard() {
  const { hosted, required, rating } = profile.creatorPath;
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel="Veien til Skaper, se kravene"
      accessibilityValue={{ min: 0, max: required, now: hosted }}
      onPress={() => router.push("/become-creator")}
      pressedScale={0.99}
      contentClassName="gap-2 rounded-lg bg-surfaceMuted p-4"
    >
      <View className="flex-row items-center gap-2">
        <Icon name="color-palette-outline" size="md" tone="ink" />
        <Text variant="body" weight="semibold" className="flex-1">
          Veien til Skaper
        </Text>
      </View>
      <Text variant="caption" tone="muted">
        {hosted} av {required} opplevelser arrangert · ★ {rating} snitt
      </Text>
      <View className="h-1.5 overflow-hidden rounded-full bg-surface">
        <View
          className="h-full rounded-full bg-ink"
          style={{ width: `${(hosted / required) * 100}%` }}
        />
      </View>
    </UIPressable>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <View accessibilityRole="tablist" className="flex-row border-b border-line">
      {TABS.map((t) => {
        const active = t.key === tab;
        return (
          <UIPressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 7, bottom: 7 }}
            onPress={() => onChange(t.key)}
            haptic="selection"
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
              {t.label}
            </Text>
          </UIPressable>
        );
      })}
    </View>
  );
}

function Row({
  icon,
  title,
  meta,
}: {
  icon: IconName;
  title: string;
  meta: string;
}) {
  return (
    <ListRow
      variant="card"
      title={title}
      subtitle={meta}
      leading={
        <View className="h-10 w-10 items-center justify-center rounded-md bg-surfaceMuted">
          <Icon name={icon} size="md" tone="ink" />
        </View>
      }
    />
  );
}

// The row icon names what the experience is (camera for a photo walk, cup for
// coffee), not the user's role in it. Broad tags only win when nothing more
// specific maps.
const BROAD_TAGS = new Set(["Sosialt", "Kultur", "Diskusjon"]);
function experienceIcon(tags: readonly string[]): IconName {
  const mapped = tags.filter((t) => tagIcon(t) !== "pricetag-outline");
  const pick = mapped.find((t) => !BROAD_TAGS.has(t)) ?? mapped[0];
  return pick ? tagIcon(pick) : "tp-experience";
}

function ActivityList() {
  return (
    <View className="gap-2">
      {profile.activity.map((a) => {
        const exp = experienceById(a.experienceId);
        if (!exp) return null;
        return (
          <Row
            key={a.experienceId}
            icon={experienceIcon(exp.tags)}
            title={exp.title}
            meta={`${a.role} · ${a.meta}`}
          />
        );
      })}
    </View>
  );
}

function PlacesList() {
  return (
    <View className="gap-2">
      {profile.visited.map((v) => {
        const place = placeById(v.placeId);
        if (!place) return null;
        return (
          <ListRow
            key={v.placeId}
            variant="card"
            title={place.name}
            subtitle={`${place.category} · ${v.when}`}
            leading={
              <Image
                source={libThumb(coverForPlace(place))}
                contentFit="cover"
                transition={150}
                style={{ height: 40, width: 40, borderRadius: 8 }}
                accessible={false}
              />
            }
          />
        );
      })}
    </View>
  );
}

function ReviewsList() {
  return (
    <View className="gap-2">
      {profile.reviews.map((r) => {
        const place = placeById(r.placeId);
        if (!place) return null;
        return (
          <View
            key={r.placeId}
            className="gap-1 rounded-md border border-line bg-surface p-3"
          >
            <View className="flex-row items-center justify-between">
              <Text variant="body" weight="semibold">
                {place.name}
              </Text>
              <Text variant="caption" tone="muted">
                {r.when}
              </Text>
            </View>
            <Text
              variant="caption"
              tone="ink"
              accessibilityLabel={`${r.stars} av 5 stjerner`}
            >
              {"★".repeat(r.stars)}
              {"☆".repeat(5 - r.stars)}
            </Text>
            <Text variant="label" weight="regular">
              {r.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
