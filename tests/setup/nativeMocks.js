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

// Device settings (Phase 15) use AsyncStorage: the package's in-memory mock.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Pages that ask before they are left (src/lib/useConfirmLeave.ts) use
// react-navigation's usePreventRemove, which needs a navigator. Screens render
// without one under Jest: the hook only records its arguments (a test can run
// the callback), and navigation is one shared stub.
jest.mock("expo-router/react-navigation", () => {
  const navigation = { dispatch: jest.fn() };
  return {
    usePreventRemove: jest.fn(),
    useNavigation: () => navigation,
  };
});
