/* global jest */
// Reanimated 4 / worklets have no native runtime under Jest — use their JS
// mocks. `useReducedMotion` is missing from the stock reanimated mock.
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/lib/module/mock"),
);
jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  useReducedMotion: () => false,
}));

// Icon fonts: report as loaded so @expo/vector-icons doesn't set state after
// render (act() warnings) — there are no real fonts under Jest.
jest.mock("expo-font", () => ({
  ...jest.requireActual("expo-font"),
  isLoaded: () => true,
  loadAsync: () => Promise.resolve(),
  useFonts: () => [true, null],
}));

// Gesture handler: GestureDetector/RootView render as plain views under Jest.
require("react-native-gesture-handler/jestSetup");
