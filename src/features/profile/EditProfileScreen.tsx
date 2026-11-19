// Rediger profil (PDF p13): photo with "Bytt bilde", Navn, Bio, Interesser
// with "+ Legg til", Språk, Lagre. A form page since Phase 12 H4c. Lagre
// writes the shared in-memory profile (src/lib/myProfile.ts), so Profil shows
// the change, then goes back and confirms. Phase 18 (screen benchmark,
// Hinge): "Forhåndsvis" shows the unsaved draft the way others see a person
// page, and leaving with unsaved changes asks "Forkaste endringene?" first.
// BLOCKED_CONTRACT_GAP: no profile backend and no media upload, so "Bytt
// bilde" can only add the bundled portrait or remove the photo (same as
// onboarding's "Legg til profilbilde").
import { type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Sheet } from "@/components/Sheet";
import { showToast } from "@/components/Toast";
import {
  Avatar,
  Chip,
  FormPage,
  IconButton,
  Pressable,
  Text,
} from "@/components/ui";
import { confirmToast } from "@/copy";
import { experienceById, profile } from "@/fixtures";
import { libImage } from "@/fixtures/images";
import { PersonProfileBody } from "@/features/people/PersonProfileBody";
import {
  OWN_PORTRAIT,
  profileDraftChanged,
  updateMyProfile,
  useMyProfile,
} from "@/lib/myProfile";
import { goBackOr } from "@/lib/navigation";
import { InterestPicker } from "@/components/pickers/InterestPicker";
import { useConfirmLeave } from "@/lib/useConfirmLeave";

// The experiences you host are public on your person page (PDF p13).
const HOSTED = profile.activity
  .filter((a) => a.role === "Arrangert")
  .flatMap((a) => {
    const e = experienceById(a.experienceId);
    return e ? [{ id: e.id, title: e.title, when: e.when }] : [];
  });

export default function EditProfileScreen() {
  const me = useMyProfile();
  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio);
  const [lang, setLang] = useState(me.languages);
  const [interests, setInterests] = useState<readonly string[]>(me.interests);
  const [avatar, setAvatar] = useState(me.avatar);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const draft = { name, bio, languages: lang, interests, avatar };
  const leave = useConfirmLeave(profileDraftChanged(me, draft));

  const toggleInterest = (i: string) =>
    setInterests((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <FormPage
      title="Rediger profil"
      trailing={
        <IconButton
          icon="eye-outline"
          label="Forhåndsvis"
          onPress={() => setPreviewOpen(true)}
        />
      }
      footer={
        <Button
          label="Lagre"
          variant="ink"
          disabled={name.trim().length === 0}
          onPress={() => {
            leave.allowLeave();
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
        <InterestPicker value={interests} onToggle={toggleInterest} />
        <Button
          label="Ferdig"
          variant="ink"
          onPress={() => setInterestsOpen(false)}
        />
      </Sheet>

      {/* The draft as others will see it (Hinge's "View"): the same body as
          a person page, without Følg / Melding, nothing saved. */}
      <Sheet
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Forhåndsvisning"
        fullHeight
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 pb-10 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="caption" tone="muted">
            Slik ser andre profilen din.
          </Text>
          <PersonProfileBody
            name={name.trim() || me.name}
            avatar={avatar ? libImage(avatar) : undefined}
            meta={profile.handle}
            bio={bio.trim()}
            interests={interests}
            hosted={HOSTED}
          />
        </ScrollView>
      </Sheet>

      <Sheet
        visible={leave.asking}
        onClose={leave.stay}
        title="Forkaste endringene?"
      >
        <Text variant="label" weight="regular">
          Det du har endret, blir ikke lagret.
        </Text>
        <View className="mt-1 gap-2">
          <Button label="Forkast" variant="danger" onPress={leave.leave} />
          <Button
            label="Fortsett å redigere"
            variant="secondary"
            onPress={leave.stay}
          />
        </View>
      </Sheet>
    </FormPage>
  );
}
