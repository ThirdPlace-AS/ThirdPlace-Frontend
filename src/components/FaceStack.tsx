import { View } from "react-native";

import { Avatar, Text } from "@/components/ui";
import { libImage } from "@/fixtures/images";
import { MAX_FACES, type GoingFace } from "@/lib/going";

// The "+N" circle, the size of an xs avatar (24 px).
const MORE = { width: 24, height: 24 };

/** Overlapping faces of people going who chose to be shown (Phase 16). A
 *  ring in the surface colour (white over photos) keeps them apart. With
 *  `count` above three, a last circle says how many more are going ("+2",
 *  user 2026-11-27). Decorative: the line next to it says how many go. */
export function FaceStack({
  faces,
  count,
  onMedia = false,
}: {
  faces: GoingFace[];
  /** Everyone going; the people beyond the faces show as "+N". */
  count?: number;
  onMedia?: boolean;
}) {
  const shown = faces.slice(0, MAX_FACES);
  const more =
    count !== undefined && count > MAX_FACES ? count - shown.length : 0;
  if (shown.length === 0 && more === 0) return null;
  const ring = `rounded-full border-2 ${
    onMedia ? "border-onMedia" : "border-surface"
  }`;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="flex-row"
    >
      {shown.map((f, i) => (
        <View
          key={f.key}
          className={ring}
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: i }}
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
      {more > 0 ? (
        <View
          className={ring}
          style={{
            marginLeft: shown.length === 0 ? 0 : -8,
            zIndex: shown.length,
          }}
        >
          {/* The line grey, not the avatar's surfaceMuted: on a white card
              in light mode that fill all but vanished (user 2026-11-27). */}
          <View
            className="items-center justify-center rounded-full bg-line"
            style={MORE}
          >
            <Text variant="micro" weight="semibold">
              {`+${more}`}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
