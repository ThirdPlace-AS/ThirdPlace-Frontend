// Applies the active scheme's colour variables to the whole tree via NativeWind
// `vars()`. Every `bg-*` / `text-*` / `border-*` token class below it reads
// these variables, so switching the scheme restyles the app without `dark:`
// variants. Modal content is still a React child, so it inherits them too.
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { useMemo, type ReactNode } from "react";
import { View } from "react-native";

import { useScheme } from "./scheme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  cssVars: (scheme: "light" | "dark") => Record<string, string>;
};

export function ThemeRoot({ children }: { children: ReactNode }) {
  const scheme = useScheme();
  const style = useMemo(() => vars(tokens.cssVars(scheme)), [scheme]);
  return (
    <View style={[{ flex: 1 }, style]} className="bg-background">
      {/* Status-bar content contrasts with the scheme background. */}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {children}
    </View>
  );
}
