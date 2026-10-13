import { Text, View } from "react-native";

// ThirdPlace mark: Ember rounded square + a white dot (location glyph),
// optional wordmark. Provisional — matches the rendered screens.
export function Logo({
  size = 44,
  showWordmark = true,
}: {
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <View className="items-center gap-2">
      <View
        className="items-center justify-center rounded-lg bg-ember"
        style={{ width: size, height: size }}
      >
        <View
          className="rounded-full bg-onEmber"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      </View>
      {showWordmark ? (
        <Text className="text-base font-semibold text-ink">ThirdPlace</Text>
      ) : null}
    </View>
  );
}
