import { View } from "react-native";

import { Avatar } from "@/components/ui";
import { libImage } from "@/fixtures/images";
import type { GoingFace } from "@/lib/going";

/** Overlapping faces of people going who chose to be shown (Phase 16). A
 *  ring in the surface colour (white over photos) keeps them apart.
 *  Decorative: the line next to it says how many are going. */
export function FaceStack({
  faces,
  onMedia = false,
}: {
  faces: GoingFace[];
  onMedia?: boolean;
}) {
  if (faces.length === 0) return null;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="flex-row"
    >
      {faces.map((f, i) => (
        <View
          key={f.key}
          className={`rounded-full border-2 ${
            onMedia ? "border-onMedia" : "border-surface"
          }`}
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: faces.length - i }}
        >
          <Avatar
            name={f.name}
            initials={f.initials}
            source={f.avatar ? libImage(f.avatar) : undefined}
            size="xs"
            decorative
          />
        </View>
      ))}
    </View>
  );
}
