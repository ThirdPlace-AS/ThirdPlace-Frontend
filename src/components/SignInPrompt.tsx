import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Sheet } from "@/components/Sheet";
import { colors } from "@/theme";
import { DemoNote } from "@/components/DemoNote";
import { demoCopy } from "@/copy";

// Respectful sign-in prompt shown when a guest tries an account-only action
// (save / join / follow / chat / create). It is a modal over the current screen,
// so the discovery context (area, mode, filters, selection) is preserved. Login
// itself is a DEMO — no real auth exists yet (CONTRACT-BLOCKED).
export function SignInPrompt({
  visible,
  onClose,
  action = "fortsette",
}: {
  visible: boolean;
  onClose: () => void;
  // What the user was trying to do, e.g. "lagre" / "bli med".
  action?: string;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Logg inn">
      <View className="flex-row items-center gap-2">
        <Ionicons name="lock-closed-outline" size={20} color={colors.muted} />
        <Text className="flex-1 text-sm text-muted">
          Du må ha en konto for å {action}. Utforsking er åpent for alle — du
          beholder stedet, filtrene og valget ditt.
        </Text>
      </View>

      {/* Route to the (demo) auth screens — login clears guest mode; the
          register flow continues into onboarding. */}
      <Button
        label="Logg inn"
        variant="ink"
        onPress={() => {
          onClose();
          router.push("/login");
        }}
      />
      <Button
        label="Opprett konto"
        variant="secondary"
        onPress={() => {
          onClose();
          router.push("/register");
        }}
      />

      <DemoNote>{demoCopy.signInInactive}</DemoNote>
    </Sheet>
  );
}
