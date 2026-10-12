// ESLint flat config (ESLint 9 / eslint-config-expo 57).
// eslint-config-expo/flat provides the Expo + React Native base;
// eslint-config-prettier disables stylistic rules that conflict with Prettier.
const expoConfig = require("eslint-config-expo/flat");
const prettier = require("eslint-config-prettier");

module.exports = [
  ...expoConfig,
  prettier,
  {
    ignores: ["node_modules/", ".expo/", "dist/", "web-build/", "coverage/"],
  },
];
