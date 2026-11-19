const plugin = require("tailwindcss/plugin");
const {
  themeColors,
  shadcnColors,
  radius,
  spacing,
  fontSize,
  fontFamily,
} = require("./src/theme/tokens.js");
const defaultTheme = require("tailwindcss/defaultTheme");

// Padding, margin, gap and inset in real px (0427). NativeWind's rem is 14 on
// native, so Tailwind's rem scale rendered p-4 as 14 px next to the 16 px
// gutter. Here every step is its web value in px (p-4 = 16, gap-6 = 24), the
// 4-pt scale DESIGN_SYSTEM.md "Spacing" names. Width and height keep the rem
// scale (component and touch-target sizes were tuned on it).
const pxScale = Object.fromEntries(
  Object.entries(defaultTheme.spacing).map(([k, v]) => [
    k,
    v.endsWith("rem") ? `${parseFloat(v) * 16}px` : v,
  ]),
);
const layoutSpacing = { ...pxScale, ...spacing };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Semantic colours read CSS variables set by ThemeRoot (light/dark).
      // shadcn/RNR slots alias the same variables (ours win on a clash).
      colors: { ...shadcnColors, ...themeColors },
      borderRadius: radius,
      spacing,
      padding: layoutSpacing,
      margin: layoutSpacing,
      gap: layoutSpacing,
      space: layoutSpacing,
      inset: layoutSpacing,
      // Named type scale (text-display … text-micro); Tailwind's defaults stay.
      fontSize,
    },
  },
  // Inter is one family per weight (Android ignores fontWeight for custom
  // fonts), so weight utilities select the family instead of setting
  // fontWeight. Later entries win when several are present (cascade order),
  // so "font-normal" on a Text is overridden by any heavier weight class.
  // On the Android dev build these classes still rendered Roboto (2026-11-15),
  // so code uses the Text primitive's weight or fontFamilyFor() instead; the
  // design guard bans the classes.
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
