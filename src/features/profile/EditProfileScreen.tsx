// Rediger profil (PDF p13: Navn, Bio, Språk), a page since Phase 12 H4c (a
// form over several fields). Fields edit locally; "Lagre" goes back and
// confirms (BLOCKED_CONTRACT_GAP: no profile backend).
import { type Href } from "expo-router";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { FormPage } from "@/components/ui";
import { confirmToast } from "@/copy";
import { profile } from "@/fixtures";
import { goBackOr } from "@/lib/navigation";

export default function EditProfileScreen() {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [lang, setLang] = useState("Norsk, Engelsk");
  return (
    <FormPage
      title="Rediger profil"
      footer={
        <Button
          label="Lagre"
          variant="ink"
          disabled={name.trim().length === 0}
          onPress={() => {
            goBackOr("/profile" as Href);
            showToast(confirmToast.profileSaved);
          }}
        />
      }
    >
      <Input label="Navn" value={name} onChangeText={setName} />
      <Input label="Bio" value={bio} onChangeText={setBio} multiline />
      <Input label="Språk" value={lang} onChangeText={setLang} />
    </FormPage>
  );
}
