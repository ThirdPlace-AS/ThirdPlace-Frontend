import { memo } from "react";

import { Chip } from "@/components/ui/Chip";
import type { IconName } from "@/components/ui/Icon";

// Icon + label pill for the "Opplevelsestype" / "Passer for" grids: the
// design-system Chip's "outline" variant (selected = ink ring, per the PDF
// "Filtre" video). Thin wrapper kept for existing call sites.
export const TypeChip = memo(function TypeChip({
  label,
  icon,
  selected = false,
  onPress,
}: {
  label: string;
  icon: string; // Ionicons glyph name (validated at call sites via fixtures)
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Chip
      variant="outline"
      label={label}
      icon={icon as IconName}
      selected={selected}
      onPress={onPress}
    />
  );
});
