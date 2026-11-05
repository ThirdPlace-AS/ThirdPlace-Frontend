import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Sheet } from "@/components/Sheet";
import { colors } from "@/theme";
import { DemoNote } from "@/components/DemoNote";
import { demoCopy } from "@/copy";
import { resetTo } from "@/lib/navigation";

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
          Du må ha en konto for å {action}. Utforsking er åpent for alle.
        </Text>
      </View>

      {/* Route to the (demo) auth screens — login clears guest mode; the
          register flow continues into onboarding. resetTo (not push): the
          prompt is often open on top of another Modal (map detail sheet,
          swipe detail), which would otherwise cover the pushed auth screen. */}
      <Button
        label="Logg inn"
        variant="ink"
        onPress={() => {
          onClose();
          resetTo("/login");
        }}
      />
      <Button
        label="Opprett konto"
        variant="secondary"
        onPress={() => {
          onClose();
          resetTo("/register");
        }}
      />

      <DemoNote>{demoCopy.signInInactive}</DemoNote>
    </Sheet>
  );
}
