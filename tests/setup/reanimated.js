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
