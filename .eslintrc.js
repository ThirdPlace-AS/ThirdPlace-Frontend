// eslint-config-expo provides the Expo/React Native base; prettier config
// disables formatting rules that conflict with Prettier.
module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  ignorePatterns: [
    "node_modules/",
    ".expo/",
    "dist/",
    "web-build/",
    "coverage/",
  ],
};
