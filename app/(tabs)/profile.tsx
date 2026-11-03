import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DemoBadge } from "@/components/DemoBadge";
import { GuestLock } from "@/components/GuestLock";
import { Input } from "@/components/Input";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { Sheet } from "@/components/Sheet";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  PERSONAS,
  placeById,
  profile,
  type MockAchievement,
  type MockPersonaKey,
  type MockVisited,
} from "@/fixtures";
import { coverForPlaceCategory, libImage } from "@/fixtures/images";
import { colors } from "@/theme";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-ink">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

// Profile (DEMO ONLY). BLOCKED_CONTRACT_GAP: no account/session/trust/achievement
// backend. Verification, personas and achievements are demo art — they switch or
// prove nothing. Editing, persona-switch and logout are account-gated: a guest is
// sent to the (demo) sign-in prompt instead of a fake success.
export default function ProfileScreen() {
  const guest = useGuestMode();
  const [persona, setPersona] = useState<MockPersonaKey>("explorer");
  const [notifOpen, setNotifOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signIn, setSignIn] = useState<string | null>(null);

  // Account-only actions route a guest to the sign-in prompt (demo).
  const gated = (action: string, run: () => void) => () =>
    guest.isGuest ? setSignIn(action) : run();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-5 p-gutter pb-10">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Profil</Text>
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

        {/* Header */}
        <View className="items-center gap-2">
          <Image
            source={libImage(profile.avatar)}
            contentFit="cover"
            transition={200}
            style={{ height: 96, width: 96, borderRadius: 48 }}
            className="bg-surfaceMuted"
            accessibilityLabel={`Profilbilde av ${profile.name}`}
          />
          <View className="flex-row items-center gap-1.5">
            <Text className="text-lg font-bold text-ink">{profile.name}</Text>
            {profile.verification.verified ? (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.ember}
              />
            ) : null}
          </View>
          <Text className="text-sm text-muted">{profile.handle}</Text>
          <Text className="px-6 text-center text-sm text-muted">
            {profile.bio}
          </Text>

          {/* Verification chip — honest: not a real ID check */}
          <View className="mt-1 flex-row items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={colors.success}
            />
            <Text className="text-xs font-medium text-ink">
              {profile.verification.label}
            </Text>
            <DemoBadge />
          </View>
          <Text className="px-6 text-center text-[11px] text-muted">
            {profile.verification.note}
          </Text>
          <Text className="text-[11px] text-muted">{profile.memberSince}</Text>
        </View>

        {guest.isGuest ? (
          <GuestLock message="Du utforsker som gjest. Logg inn for å redigere profilen og bytte modus." />
        ) : null}

        <Card>
          <View className="flex-row justify-around">
            <Stat value={profile.stats.steder} label="Steder" />
            <Stat value={profile.stats.opplevelser} label="Opplevelser" />
            <Stat value={profile.stats.venner} label="Venner" />
          </View>
        </Card>

        {/* Persona switch (demo) */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-ink">Modus</Text>
            <DemoBadge />
          </View>
          <View className="flex-row gap-2">
            {PERSONAS.map((p) => {
              const active = persona === p.key;
              return (
                <Pressable
                  key={p.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={gated("bytte modus", () => setPersona(p.key))}
                  className={`flex-1 items-center gap-1 rounded-xl border px-2 py-3 ${
                    active
                      ? "border-ember bg-ember/10"
                      : "border-line bg-surface active:opacity-80"
                  }`}
                >
                  <Ionicons
                    name={p.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={active ? colors.ember : colors.muted}
                  />
                  <Text
                    className={`text-xs font-medium ${active ? "text-ember" : "text-muted"}`}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="text-[11px] text-muted">
            Demo — modus bytter ingen reell funksjon ennå.
          </Text>
        </View>

        {/* Steder jeg har vært */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-ink">
            Steder jeg har vært
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 pr-gutter"
          >
            {profile.visited.map((v) => (
              <VisitedCard key={v.placeId} visit={v} />
            ))}
          </ScrollView>
        </View>

        {/* Prestasjoner */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-ink">
              Prestasjoner
            </Text>
            <DemoBadge />
          </View>
          <View className="flex-row flex-wrap gap-3">
            {profile.achievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </View>
        </View>

        {/* Oppdag */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-ink">Oppdag</Text>
          <AccountRow
            icon="people-outline"
            label="Naboer"
            onPress={() => router.push("/people")}
          />
          <AccountRow
            icon="people-circle-outline"
            label="Grupper"
            onPress={() => router.push("/groups")}
          />
          <AccountRow
            icon="storefront-outline"
            label="Bedrifter"
            onPress={() => router.push("/businesses")}
          />
          <AccountRow
            icon="sparkles-outline"
            label="Skapere"
            onPress={() => router.push("/creators")}
          />
        </View>

        {/* Account */}
        <View className="gap-2">
          <AccountRow
            icon="notifications-outline"
            label="Varsler"
            onPress={() => setNotifOpen(true)}
          />
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Vis som gjest (demo)"
            accessibilityState={{ checked: guest.isGuest }}
            onPress={guest.toggle}
            className="flex-row items-center justify-between rounded-xl border border-line bg-surface px-4 py-3"
          >
            <View className="flex-1 flex-row items-center gap-2">
              <Ionicons name="eye-outline" size={20} color={colors.muted} />
              <Text className="text-base text-ink">Vis som gjest</Text>
              <DemoBadge />
            </View>
            <View
              className={`h-6 w-11 justify-center rounded-full px-0.5 ${
                guest.isGuest ? "bg-ink" : "bg-surfaceMuted"
              }`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-surface ${
                  guest.isGuest ? "self-end" : "self-start"
                }`}
              />
            </View>
          </Pressable>
        </View>

        <View className="gap-3">
          <Button
            label="Rediger profil"
            variant="secondary"
            icon="create-outline"
            onPress={gated("redigere profilen", () => setEditOpen(true))}
          />
          {guest.isGuest ? (
            <Button
              label="Logg inn"
              variant="ink"
              onPress={() => setSignIn("logge inn")}
            />
          ) : (
            <Button
              label="Logg ut"
              variant="ink"
              onPress={() => setLogoutOpen(true)}
            />
          )}
        </View>
      </ScrollView>

      <NotificationsSheet
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <EditProfileSheet visible={editOpen} onClose={() => setEditOpen(false)} />
      <LogoutSheet
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          router.replace("/");
        }}
      />
      <SignInPrompt
        visible={signIn !== null}
        onClose={() => setSignIn(null)}
        action={signIn ?? "fortsette"}
      />
    </SafeAreaView>
  );
}

function VisitedCard({ visit }: { visit: MockVisited }) {
  const place = placeById(visit.placeId);
  if (!place) return null;
  return (
    <View className="w-40 gap-1.5">
      <Image
        source={libImage(coverForPlaceCategory(place.category))}
        contentFit="cover"
        transition={200}
        style={{ height: 112, width: 160, borderRadius: 12 }}
        className="bg-surfaceMuted"
        accessibilityLabel={place.name}
      />
      <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
        {place.name}
      </Text>
      <View className="flex-row items-center gap-1">
        <Ionicons name="star" size={12} color={colors.ember} />
        <Text className="text-xs text-muted">{place.rating.toFixed(1)}</Text>
        <Text className="text-xs text-muted">· {visit.when}</Text>
      </View>
    </View>
  );
}

function AchievementBadge({ achievement }: { achievement: MockAchievement }) {
  const { earned } = achievement;
  return (
    <View
      className={`w-[31%] items-center gap-1 rounded-xl border px-2 py-3 ${
        earned ? "border-line bg-surface" : "border-line bg-surfaceMuted"
      }`}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          earned ? "bg-ember/10" : "bg-line"
        }`}
      >
        <Ionicons
          name={achievement.icon as keyof typeof Ionicons.glyphMap}
          size={22}
          color={earned ? colors.ember : colors.muted}
        />
      </View>
      <Text
        className={`text-center text-xs font-semibold ${earned ? "text-ink" : "text-muted"}`}
        numberOfLines={1}
      >
        {achievement.label}
      </Text>
      <Text className="text-center text-[10px] text-muted" numberOfLines={2}>
        {achievement.caption}
      </Text>
    </View>
  );
}

function AccountRow({
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
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 active:opacity-80"
    >
      <Ionicons name={icon} size={20} color={colors.muted} />
      <Text className="flex-1 text-base text-ink">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

// Inert edit sheet — fields are prefilled and editable locally, but "Lagre"
// saves nothing (no profile backend). A persistent note + DemoBadge say so.
function EditProfileSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  return (
    <Sheet visible={visible} onClose={onClose} title="Rediger profil">
      <View className="gap-3">
        <Input label="Navn" value={name} onChangeText={setName} />
        <Input label="Brukernavn" value={handle} onChangeText={setHandle} />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline />
        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — endringer lagres ikke.
          </Text>
        </View>
        <Button label="Lagre" variant="ink" onPress={onClose} />
      </View>
    </Sheet>
  );
}

// Demo logout — there is no real session to end. Confirming just returns to the
// welcome screen; a note + DemoBadge keep it honest (no fake "logged out").
function LogoutSheet({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Logg ut">
      <View className="gap-4">
        <Text className="text-sm text-muted">
          Vil du logge ut og gå tilbake til velkomstskjermen?
        </Text>
        <View className="flex-row items-center gap-2">
          <DemoBadge />
          <Text className="flex-1 text-xs text-muted">
            Demo — ingen reell økt avsluttes.
          </Text>
        </View>
        <Button label="Logg ut" variant="ink" onPress={onConfirm} />
        <Button label="Avbryt" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}
