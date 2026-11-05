/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  // Shared mocks for native-only runtimes (animation, fonts).
  setupFiles: ["<rootDir>/tests/setup/nativeMocks.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop|@tanstack/.*|react-native-reanimated|react-native-gesture-handler))",
  ],
};
