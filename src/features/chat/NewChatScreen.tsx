// "Ny chat" (PDF p10): Navn, Type (Åpen / Lukket / Kun invitasjon) and
// members. A page since Phase 12 H4c (a form over several fields); the
// people picker stays a sheet. "Opprett chat" confirms in product voice
// (BLOCKED_CONTRACT_GAP: no chat creation contract).
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { UserSearch } from "@/components/pickers/Pickers";
import { showToast } from "@/components/Toast";
import {
  FormPage,
  Icon,
  Pressable as UIPressable,
  Text,
} from "@/components/ui";
import { confirmToast } from "@/copy";
import { CHAT_ACCESS_LABEL, type MockChatAccess } from "@/fixtures";
import { goBackOr } from "@/lib/navigation";

export default function NewChatScreen() {
  const [name, setName] = useState("");
  const [access, setAccess] = useState<MockChatAccess>("open");
  const [members, setMembers] = useState<string[]>([]);
  const [search, setSearch] = useState(false);
  return (
    <FormPage
      title="Ny chat"
      footer={
        <Button
          label="Opprett chat"
          variant="ink"
          disabled={name.trim().length === 0}
          onPress={() => {
            goBackOr("/chat");
            showToast(confirmToast.chatCreated);
          }}
        />
      }
    >
      <Input
        label="Navn"
        placeholder="F.eks. «Løpegjengen på Løkka»"
        value={name}
        onChangeText={setName}
        maxLength={50}
      />
      <View className="gap-2">
        <Text variant="label" weight="semibold">
          Type
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {(Object.keys(CHAT_ACCESS_LABEL) as MockChatAccess[]).map((a) => (
            <Chip
              key={a}
              label={CHAT_ACCESS_LABEL[a]}
              selected={access === a}
              onPress={() => setAccess(a)}
            />
          ))}
        </View>
      </View>
      <View className="gap-2">
        <Text variant="label" weight="semibold">
          Medlemmer
        </Text>
        {members.length ? (
          <Text variant="label" weight="regular">
            {members.join(", ")}
          </Text>
        ) : null}
        <UIPressable
          accessibilityRole="button"
          onPress={() => setSearch(true)}
          className="self-start"
          contentClassName="flex-row items-center gap-2 rounded-full border border-line bg-surface px-3 py-2"
          pressedScale={0.99}
        >
          <Icon name="person-add-outline" size="sm" tone="ink" />
          <Text variant="label">Legg til</Text>
        </UIPressable>
      </View>
      {search ? (
        <UserSearch
          onPick={(p) =>
            setMembers((m) => (m.includes(p.name) ? m : [...m, p.name]))
          }
          onClose={() => setSearch(false)}
        />
      ) : null}
    </FormPage>
  );
}
