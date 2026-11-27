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

// A native Modal reports `onShow` once its window is up; Sheet and Overlay
// wait for it before they animate in (usePresence). Jest has no window, so
// report it as soon as the Modal is shown.
jest.mock("react-native/Libraries/Modal/Modal", () => {
  const React = require("react");
  // React Native's own jest Modal (renders nothing while not visible).
  const Actual = jest.requireActual(
    "@react-native/jest-preset/jest/mocks/Modal",
  );
  const RealModal = Actual.default ?? Actual;
  function ShowingModal(props) {
    const { visible, onShow } = props;
    React.useEffect(() => {
      if (visible !== false) onShow?.();
    }, [visible, onShow]);
    // Bracket access: NativeWind's Babel plugin rewrites React.createElement.
    return React["create" + "Element"](RealModal, props);
  }
  return { __esModule: true, default: ShowingModal };
});

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

// Drag to reorder (P9): react-native-sortables needs Reanimated's worklet
// runtime, which the mock above leaves out. Under Jest a Grid renders its rows
// in order and Flex / Handle render their children; the screen-reader move
// actions (src/components/ui/Sortable.tsx) are what tests drive.
jest.mock("react-native-sortables", () => require("./sortablesMock"));
