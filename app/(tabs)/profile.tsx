import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { DemoBadge } from "@/components/DemoBadge";
import { DemoNote } from "@/components/DemoNote";
import { GuestLock } from "@/components/GuestLock";
import { Input } from "@/components/Input";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { demoCopy } from "@/copy";
import { experienceById, placeById, profile } from "@/fixtures";
import { coverForPlace, libImage } from "@/fixtures/images";
import { colors } from "@/theme";

type Tab = "experiences" | "places" | "reviews";
const TABS: { key: Tab; label: string }[] = [
  { key: "experiences", label: "Opplevelser" },
  { key: "places", label: "Steder" },
  { key: "reviews", label: "Anmeldelser" },
];

// Profile (DEMO ONLY), laid out per the design (PDF p12): header with name +
// age and bio, Følgere / Følger / Venner, interest chips, the "Veien til
// Skaper" card, and Opplevelser / Steder / Anmeldelser tabs. Settings sit
// behind the gear. BLOCKED_CONTRACT_GAP: no account, follow graph, review or
// creator-progression backend — every count is mock and marked as such.
export default function ProfileScreen() {
  const { isGuest } = useGuestMode();
  const [tab, setTab] = useState<Tab>("experiences");
  const [editOpen, setEditOpen] = useState(false);
  const [signIn, setSignIn] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-5 p-gutter pb-10">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Profil</Text>
          <View className="flex-row items-center gap-1">
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Innstillinger"
              hitSlop={8}
              onPress={() => router.push("/settings")}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-surfaceMuted"
            >
              <Ionicons name="settings-outline" size={22} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        {isGuest ? (
          <GuestProfile onSignIn={() => setSignIn(true)} />
        ) : (
          <>
            {/* Header — tapping it opens Rediger profil (PDF p13). */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Rediger profil"
              onPress={() => setEditOpen(true)}
              className="flex-row items-center gap-4 active:opacity-80"
            >
              <Image
                source={libImage(profile.avatar)}
                contentFit="cover"
                transition={200}
                style={{ height: 84, width: 84, borderRadius: 42 }}
                className="bg-surfaceMuted"
                accessibilityLabel={`Profilbilde av ${profile.name}`}
              />
              <View className="flex-1 gap-1">
                <Text className="text-2xl font-bold text-ink">
                  {profile.name}, {profile.age}
                </Text>
                <Text className="text-sm text-muted">{profile.bio}</Text>
              </View>
            </Pressable>

            <View className="flex-row items-center gap-8">
              <Stat value={profile.stats.followers} label="Følgere" />
              <Stat value={profile.stats.following} label="Følger" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Venner — oppdag folk"
                onPress={() => router.push("/people")}
                className="active:opacity-70"
              >
                <Stat value={profile.stats.friends} label="Venner" />
              </Pressable>
              <DemoBadge />
            </View>

            <View className="flex-row flex-wrap gap-2">
              {profile.interests.map((i) => (
                <View
                  key={i}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5"
                >
                  <Text className="text-sm font-medium text-ink">{i}</Text>
                </View>
              ))}
            </View>

            <CreatorPathCard />

            <TabBar tab={tab} onChange={setTab} />
            {tab === "experiences" ? <ActivityList /> : null}
            {tab === "places" ? <PlacesList /> : null}
            {tab === "reviews" ? <ReviewsList /> : null}
          </>
        )}
      </ScrollView>

      <EditProfileSheet visible={editOpen} onClose={() => setEditOpen(false)} />
      <SignInPrompt
        visible={signIn}
        onClose={() => setSignIn(false)}
        action="se profilen din"
      />
    </SafeAreaView>
  );
}

function HeaderIcon({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full active:bg-surfaceMuted"
    >
      <Ionicons name={icon} size={22} color={colors.ink} />
    </Pressable>
  );
}

function GuestProfile({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View className="gap-4">
      <GuestLock message="Du utforsker som gjest. Opprett en konto for å få en profil, lagre steder og bli med på opplevelser." />
      <Button label="Logg inn" variant="ink" onPress={onSignIn} />
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View>
      <Text className="text-lg font-bold text-ink">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

// "Veien til Skaper" (PDF p12). The copy is illustrative: the real creator
// criteria are not defined in the contract, so nothing here is evaluated.
function CreatorPathCard() {
  const { hosted, required, rating } = profile.creatorPath;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Veien til Skaper — se kravene"
      onPress={() => router.push("/become-creator")}
      className="gap-2 rounded-lg bg-surfaceMuted p-4 active:opacity-80"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name="color-palette-outline" size={18} color={colors.ink} />
        <Text className="flex-1 text-base font-semibold text-ink">
          Veien til Skaper
        </Text>
        <DemoBadge />
      </View>
      <Text className="text-xs text-muted">
        {hosted} av {required} opplevelser arrangert · ★ {rating} snitt
      </Text>
      <View className="h-1.5 overflow-hidden rounded-full bg-surface">
        <View
          className="h-full rounded-full bg-ink"
          style={{ width: `${(hosted / required) * 100}%` }}
        />
      </View>
    </Pressable>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <View className="flex-row border-b border-line">
      {TABS.map((t) => {
        const active = t.key === tab;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(t.key)}
            className={`flex-1 items-center pb-2.5 ${
              active ? "border-b-2 border-ink" : ""
            }`}
          >
            <Text
              className={`text-sm ${
                active ? "font-semibold text-ink" : "font-medium text-muted"
              }`}
            >
              {t.label}
            </Text>
          </Pressable>
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
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-surfaceMuted">
        <Ionicons name={icon} size={18} color={colors.ink} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs text-muted" numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </View>
  );
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
            icon={a.role === "Arrangert" ? "mic-outline" : "camera-outline"}
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
          <View
            key={v.placeId}
            className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3"
          >
            <Image
              source={libImage(coverForPlace(place))}
              contentFit="cover"
              transition={150}
              style={{ height: 40, width: 40, borderRadius: 8 }}
              className="bg-surfaceMuted"
              accessibilityLabel={place.name}
            />
            <View className="flex-1">
              <Text
                className="text-base font-semibold text-ink"
                numberOfLines={1}
              >
                {place.name}
              </Text>
              <Text className="text-xs text-muted">
                {place.category} · {v.when}
              </Text>
            </View>
          </View>
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
              <Text className="text-base font-semibold text-ink">
                {place.name}
              </Text>
              <Text className="text-xs text-muted">{r.when}</Text>
            </View>
            <Text className="text-xs text-ember">
              {"★".repeat(r.stars)}
              {"☆".repeat(5 - r.stars)}
            </Text>
            <Text className="text-sm text-ink">{r.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Rediger profil (PDF p13: Navn, Bio, Interesser, Språk). Fields edit locally;
// "Lagre" saves nothing (no profile backend) — a DemoNote says so.
function EditProfileSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [lang, setLang] = useState("Norsk, Engelsk");
  return (
    <Sheet visible={visible} onClose={onClose} title="Rediger profil">
      <View className="gap-3">
        <Input label="Navn" value={name} onChangeText={setName} />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline />
        <Input label="Språk" value={lang} onChangeText={setLang} />
        <DemoNote>{demoCopy.editsNotSaved}</DemoNote>
        <Button label="Lagre" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}
