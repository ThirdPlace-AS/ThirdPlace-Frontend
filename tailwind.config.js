const { colors, radius, spacing } = require("./src/theme/tokens.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      borderRadius: radius,
      spacing,
    },
  },
  plugins: [],
};
