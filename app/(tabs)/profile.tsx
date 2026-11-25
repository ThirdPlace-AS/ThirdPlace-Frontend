import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { CountdownChip, planCountdown } from "@/components/CountdownChip";
import {
  Avatar,
  Header,
  Icon,
  IconButton,
  type IconName,
  ListRow,
  Pressable as UIPressable,
  Screen,
  Text,
  Button,
  LINK_SLOP,
} from "@/components/ui";
import { GuestLock } from "@/components/GuestLock";
import { AccountSheet, ActiveAccountChip } from "@/components/AccountSwitcher";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { tagIcon } from "@/components/swipe/SwipeCard";
import { experienceById, placeById, profile } from "@/fixtures";
import { useProfileCounts } from "@/lib/following";
import { useMyProfile, type MyProfile } from "@/lib/myProfile";
import { openProfileSteps, PROFILE_STEP_COUNT } from "@/lib/profileSteps";
import { useStarterSteps, type StarterStep } from "@/lib/starterSteps";
import { whenLabel } from "@/lib/whenLabel";
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
      <ScrollView contentContainerClassName="grow gap-6 px-gutter pb-12">
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
            {/* The account you act as (review PR-08, 0526): the chip and
                a long press on the Profil tab open the same sheet. */}
            <ActiveAccountChip />
            <AccountSheet />
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
            <View className="flex-row items-center gap-6">
              <Stat
                value={counts.followers}
                label="Følgere"
                onPress={() => router.push("/profile/followers" as Href)}
              />
              <Stat
                value={counts.following}
                label="Følger"
                // "3 følger" is ambiguous read aloud (TalkBack pass, 0257).
                spoken={`Du følger ${counts.following}`}
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
                  className="rounded-full border border-line bg-surface px-4 py-2"
                >
                  <Text variant="label">{i}</Text>
                </View>
              ))}
            </View>

            <ChecklistCard me={me} />

            <NextPlanCard />

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
  spoken,
  onPress,
}: {
  value: number;
  label: string;
  /** What a screen reader says, when "<value> <label>" is unclear. */
  spoken?: string;
  onPress: () => void;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={spoken ?? `${value} ${label.toLowerCase()}`}
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

// One checklist at a time (review PR-06, 0524): «Kom i gang» while any of
// its three first steps is open, then "Fullfør profilen" (Phase 18) for the
// Rediger profil fields still empty. Both are gone once everything is done.
function ChecklistCard({ me }: { me: MyProfile }) {
  const starter = useStarterSteps();
  const startOpen = starter.filter((s) => !s.done);
  if (startOpen.length > 0) {
    return (
      <StepsCard
        title="Kom i gang"
        done={starter.length - startOpen.length}
        total={starter.length}
        rows={startOpen.map((s: StarterStep) => ({
          key: s.key,
          icon: s.icon,
          label: s.label,
          href: s.href,
        }))}
      />
    );
  }
  const open = openProfileSteps(me);
  if (open.length === 0) return null;
  return (
    <StepsCard
      title="Fullfør profilen"
      done={PROFILE_STEP_COUNT - open.length}
      total={PROFILE_STEP_COUNT}
      rows={open.map((s) => ({
        key: s.key,
        icon: s.icon,
        label: s.label,
        href: "/profile/edit" as Href,
      }))}
    />
  );
}

function StepsCard({
  title,
  done,
  total,
  rows,
}: {
  title: string;
  done: number;
  total: number;
  rows: { key: string; icon: IconName; label: string; href: Href }[];
}) {
  return (
    <View className="gap-3 rounded-md border border-line bg-surface p-4">
      <View className="gap-1">
        <Text variant="body" weight="semibold" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          {done} av {total} er på plass
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={title}
        accessibilityValue={{ min: 0, max: total, now: done }}
        className="h-1.5 overflow-hidden rounded-full bg-surfaceMuted"
      >
        <View
          className="h-full rounded-full bg-ink"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </View>
      <View>
        {rows.map((r) => (
          <ListRow
            key={r.key}
            icon={r.icon}
            title={r.label}
            onPress={() => router.push(r.href)}
          />
        ))}
      </View>
    </View>
  );
}

// "Neste plan" (approved addition, 2026-11-06): the first upcoming plan from
// the same fixture Mine planer reads (no second attendance truth, spec §11),
// with its "when" label as written. Phase 16 (founder, after the section
// benchmark) adds the countdown chip from Mine planer; still no reminder copy.
function NextPlanCard() {
  const next = profile.plans.find((p) => p.state === "upcoming");
  const exp = next ? experienceById(next.experienceId) : undefined;
  if (!exp) return null;
  const countdown = planCountdown(exp);
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="label" weight="semibold">
          Neste plan
        </Text>
        <UIPressable
          accessibilityRole="link"
          hitSlop={LINK_SLOP}
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
        subtitle={whenLabel(exp)}
        accessibilityLabel={`Neste plan: ${exp.title}, ${whenLabel(exp)}${
          countdown ? `, ${countdown.toLowerCase()}` : ""
        }`}
        leading={
          <Image
            source={smallImage(exp.photos[0])}
            contentFit="cover"
            style={{ height: 44, width: 44, borderRadius: 8 }}
            accessible={false}
          />
        }
        trailing={<CountdownChip exp={exp} />}
        onPress={() => router.push(`/experience/${exp.id}` as Href)}
      />
    </View>
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
            hitSlop={{ top: 8, bottom: 8 }}
            onPress={() => onChange(t.key)}
            feedback="none"
            className="flex-1"
            contentClassName={`items-center pb-3 ${
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
        <View className="h-10 w-10 items-center justify-center rounded-sm bg-surfaceMuted">
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
