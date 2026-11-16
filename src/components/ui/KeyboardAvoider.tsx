// Keyboard handling through react-native-keyboard-controller (P10, shadcn
// plan): the padding follows the keyboard frame by frame on Android and iOS,
// also inside a Modal. Edge-to-edge Android resizes neither the window nor a
// Modal for the keyboard, so every input screen pads with this (CLAUDE.md
// "Keyboard").
//
// Interop boundary: the library builds a NativeEventEmitter when its module
// loads and throws there without its native module, so a dev client built
// before it was added (the phone's EAS build) would crash on start. It is
// required only once the native module is registered; otherwise, and on web
// and in Jest, React Native's own KeyboardAvoidingView pads instead.
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView as CoreKeyboardAvoidingView,
  Platform,
  TurboModuleRegistry,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type * as KeyboardController from "react-native-keyboard-controller";

const library: typeof KeyboardController | null =
  Platform.OS !== "web" && TurboModuleRegistry.get("KeyboardController")
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("react-native-keyboard-controller")
    : null;

/** Root of the app: lets the library follow the keyboard (no-op without it). */
export function KeyboardRoot({ children }: { children: ReactNode }) {
  if (!library) return children;
  return (
    <library.KeyboardProvider
      statusBarTranslucent
      navigationBarTranslucent
      preserveEdgeToEdge
    >
      {children}
    </library.KeyboardProvider>
  );
}

const FILL = { flex: 1 } as const;

/**
 * Fills its parent and pads its bottom by the keyboard's height. `className`
 * and `style` go on a core View inside (NativeWind does not style the
 * library's animated view reliably on a cold start).
 */
export function KeyboardAvoider({
  className,
  style,
  children,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const content = (
    <View className={className ?? "flex-1"} style={style}>
      {children}
    </View>
  );
  return library ? (
    <library.KeyboardAvoidingView behavior="padding" style={FILL}>
      {content}
    </library.KeyboardAvoidingView>
  ) : (
    <CoreKeyboardAvoidingView behavior="padding" style={FILL}>
      {content}
    </CoreKeyboardAvoidingView>
  );
}
