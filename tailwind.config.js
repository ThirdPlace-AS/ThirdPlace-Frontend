const {
  themeColors,
  radius,
  spacing,
  fontSize,
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
  plugins: [],
};
