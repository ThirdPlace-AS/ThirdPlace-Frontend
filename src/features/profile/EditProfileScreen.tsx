// Rediger profil (PDF p13): photo with "Bytt bilde", Navn, Bio, Interesser
// with "+ Legg til", Språk, Lagre. A form page since Phase 12 H4c. Lagre
// writes the shared in-memory profile (src/lib/myProfile.ts), so Profil shows
// the change, then goes back and confirms. BLOCKED_CONTRACT_GAP: no profile
// backend and no media upload, so "Bytt bilde" can only add the bundled
// portrait or remove the photo (same as onboarding's "Legg til profilbilde").
import { type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Sheet } from "@/components/Sheet";
import { showToast } from "@/components/Toast";
import {
  Avatar,
  Chip,
  ChipGroup,
  FormPage,
  Pressable,
  Text,
} from "@/components/ui";
import { confirmToast } from "@/copy";
import { libImage } from "@/fixtures/images";
import { OWN_PORTRAIT, updateMyProfile, useMyProfile } from "@/lib/myProfile";
import { goBackOr } from "@/lib/navigation";
import { INTEREST_OPTIONS } from "@/lib/preferences";

export default function EditProfileScreen() {
  const me = useMyProfile();
  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio);
  const [lang, setLang] = useState(me.languages);
  const [interests, setInterests] = useState<readonly string[]>(me.interests);
  const [avatar, setAvatar] = useState(me.avatar);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);

  const toggleInterest = (i: string) =>
    setInterests((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <FormPage
      title="Rediger profil"
      footer={
        <Button
          label="Lagre"
          variant="ink"
          disabled={name.trim().length === 0}
          onPress={() => {
            updateMyProfile({
              name: name.trim(),
              bio: bio.trim(),
              languages: lang.trim(),
              interests,
              avatar,
            });
            goBackOr("/profile" as Href);
            showToast(confirmToast.profileSaved);
          }}
        />
      }
    >
      <View className="items-start gap-2">
        <Avatar
          name={name || me.name}
          source={avatar ? libImage(avatar) : undefined}
          size="xl"
          decorative
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bytt bilde"
          onPress={() => setPhotoOpen(true)}
          hitSlop={8}
        >
          <Text variant="label" weight="semibold" tone="ember">
            Bytt bilde
          </Text>
        </Pressable>
      </View>

      <Input label="Navn" value={name} onChangeText={setName} maxLength={60} />
      <Input label="Bio" value={bio} onChangeText={setBio} multiline />

      <View className="gap-2">
        <Text variant="label" weight="semibold">
          Interesser
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {interests.map((i) => (
            <Chip
              key={i}
              label={i}
              selected
              onPress={() => toggleInterest(i)}
            />
          ))}
          <Chip
            label="+ Legg til"
            variant="outline"
            onPress={() => setInterestsOpen(true)}
          />
        </View>
      </View>

      <Input label="Språk" value={lang} onChangeText={setLang} />

      <Sheet
        visible={photoOpen}
        onClose={() => setPhotoOpen(false)}
        title="Profilbilde"
      >
        <View className="gap-2">
          {avatar ? (
            <Button
              label="Fjern bildet"
              variant="secondary"
              onPress={() => {
                setAvatar(null);
                setPhotoOpen(false);
              }}
            />
          ) : (
            <Button
              label="Legg til bilde"
              variant="ink"
              onPress={() => {
                setAvatar(OWN_PORTRAIT);
                setPhotoOpen(false);
              }}
            />
          )}
          <Button
            label="Avbryt"
            variant="ghost"
            onPress={() => setPhotoOpen(false)}
          />
        </View>
      </Sheet>

      <Sheet
        visible={interestsOpen}
        onClose={() => setInterestsOpen(false)}
        title="Interesser"
      >
        <ChipGroup
          multiple
          label="Interesser"
          options={INTEREST_OPTIONS}
          value={interests}
          onChange={toggleInterest}
        />
        <Button
          label="Ferdig"
          variant="ink"
          onPress={() => setInterestsOpen(false)}
        />
      </Sheet>
    </FormPage>
  );
}
