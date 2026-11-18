import { View } from "react-native";

import { Button, Sheet, Text } from "@/components/ui";

/**
 * "Forkaste endringene?": asked before a form with unsaved input is left
 * (Phase 18, Hinge's "discard changes?"). Pages pair it with
 * `useConfirmLeave` (back, Android back, swipe); the Legg til wizard, a tab
 * that is never removed, opens it from its own first-step back.
 */
export function DiscardChangesSheet({
  visible,
  onStay,
  onDiscard,
}: {
  visible: boolean;
  /** "Fortsett å redigere", or the sheet closed. */
  onStay: () => void;
  /** "Forkast": leave without saving. */
  onDiscard: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onStay} title="Forkaste endringene?">
      <Text variant="label" weight="regular">
        Det du har endret, blir ikke lagret.
      </Text>
      <View className="mt-1 gap-2">
        <Button label="Forkast" variant="danger" onPress={onDiscard} />
        <Button
          label="Fortsett å redigere"
          variant="secondary"
          onPress={onStay}
        />
      </View>
    </Sheet>
  );
}
