import { View } from "react-native";

import { FaceStack } from "@/components/FaceStack";
import { useGoing } from "@/components/map/hooks/useGoing";
import { Text } from "@/components/ui";
import { experienceById } from "@/fixtures";
import { goingLine } from "@/lib/going";

/** "[faces] 5 skal · 3 plasser igjen" on experience cards (Sveip, the map's
 *  browse list), live with the viewer's own join (Phase 16). */
export function GoingLine({
  id,
  onMedia = false,
}: {
  id: string;
  onMedia?: boolean;
}) {
  const going = useGoing(id);
  const exp = experienceById(id);
  if (!exp) return null;
  return (
    <View className="flex-row items-center gap-2">
      <FaceStack faces={going.faces} onMedia={onMedia} />
      <Text
        variant="label"
        weight={onMedia ? undefined : "semibold"}
        tone={onMedia ? "onMedia" : "ink"}
        numberOfLines={1}
        className="flex-1"
      >
        {goingLine({ capacity: exp.capacity, going: going.count })}
      </Text>
    </View>
  );
}
