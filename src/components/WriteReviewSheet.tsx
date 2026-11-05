import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Icon } from "@/components/ui";
import { Button } from "@/components/Button";
import { Sheet } from "@/components/Sheet";
import { useThemeColors } from "@/theme";
import { DemoNote } from "@/components/DemoNote";
import { demoCopy } from "@/copy";

export function WriteReviewSheet({
  placeName,
  visible,
  onClose,
}: {
  placeName: string;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={`Anmeld ${placeName}`}>
      {visible ? <Body onClose={onClose} /> : null}
    </Sheet>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const colors = useThemeColors();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  return (
    <>
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${n} stjerner`}
            onPress={() => setRating(n)}
          >
            <Icon
              name={n <= rating ? "star" : "star-outline"}
              size="xl"
              tone={n <= rating ? "ember" : "muted"}
            />
          </Pressable>
        ))}
      </View>

      <TextInput
        placeholder="Skriv noen ord om stedet…"
        placeholderTextColor={colors.muted}
        value={text}
        onChangeText={setText}
        multiline
        className="min-h-24 rounded-md border border-line bg-surface p-3 text-base text-ink font-normal"
        textAlignVertical="top"
      />

      <DemoNote>{demoCopy.reviewNotSent}</DemoNote>

      <Button
        label="Send anmeldelse"
        variant="ember"
        disabled={rating === 0}
        onPress={onClose}
      />
    </>
  );
}
