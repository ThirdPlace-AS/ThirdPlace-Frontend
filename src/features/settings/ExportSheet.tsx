// Eksporter data (PDF p28, GDPR): one sheet for Innstillinger and
// Personvern (they used to differ). A short choice + confirm, so it stays a
// sheet. BLOCKED_CONTRACT_GAP: nothing is exported; it confirms in product
// voice and states no delivery rule.
import { Button } from "@/components/Button";
import { Sheet } from "@/components/Sheet";
import { showToastAfterSheet } from "@/components/Toast";
import { Text } from "@/components/ui";
import { confirmToast } from "@/copy";

import { ToggleList } from "./settingsUi";

export function ExportSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Eksporter data">
      <Text variant="caption" tone="muted">
        Få en kopi av alt ThirdPlace vet om deg (GDPR).
      </Text>
      <ToggleList
        initial={{
          "Profil og preferanser": true,
          Chathistorikk: true,
          "Opplevelser og påmeldinger": true,
          Anmeldelser: true,
        }}
        items={[
          { label: "Profil og preferanser", icon: "person-outline" },
          { label: "Chathistorikk", icon: "chatbubble-outline" },
          { label: "Opplevelser og påmeldinger", icon: "tp-experience" },
          { label: "Anmeldelser", icon: "star-outline" },
          { label: "Betalingshistorikk", icon: "card-outline" },
        ]}
      />
      <Button
        label="Be om eksport"
        variant="ink"
        onPress={() => {
          onClose();
          showToastAfterSheet(confirmToast.exportRequested);
        }}
      />
    </Sheet>
  );
}
