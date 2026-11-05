const plugin = require("tailwindcss/plugin");
const {
  themeColors,
  radius,
  spacing,
  fontSize,
  fontFamily,
} = require("./src/theme/tokens.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Semantic colours read CSS variables set by ThemeRoot (light/dark).
      colors: themeColors,
      borderRadius: radius,
      spacing,
      // Named type scale (text-display … text-micro); Tailwind's defaults stay.
      fontSize,
    },
  },
  // DM Sans is one family per weight (Android ignores fontWeight for custom
  // fonts), so weight utilities select the family instead of setting
  // fontWeight. Later entries win when several are present (cascade order),
  // so "font-normal" on a Text is overridden by any heavier weight class.
  corePlugins: { fontWeight: false },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".font-light": { fontFamily: fontFamily.regular },
        ".font-normal": { fontFamily: fontFamily.regular },
        ".font-medium": { fontFamily: fontFamily.medium },
        ".font-semibold": { fontFamily: fontFamily.semibold },
        ".font-bold": { fontFamily: fontFamily.bold },
        ".font-extrabold": { fontFamily: fontFamily.bold },
      });
    }),
  ],
};
