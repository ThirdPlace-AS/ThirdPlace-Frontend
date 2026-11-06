// Applies the active scheme's colour variables to the whole tree via NativeWind
// `vars()`. Every `bg-*` / `text-*` / `border-*` token class below it reads
// these variables, so switching the scheme restyles the app without `dark:`
// variants. Modal content is still a React child, so it inherits them too.
import { vars } from "nativewind";
import { useEffect, useMemo, type ReactNode } from "react";
import { View } from "react-native";

import { setStatusBarFallback } from "@/components/ui/StatusBarStyle";

import { useScheme } from "./scheme";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tokens = require("./tokens.js") as {
  cssVars: (scheme: "light" | "dark") => Record<string, string>;
};

export function ThemeRoot({ children }: { children: ReactNode }) {
  const scheme = useScheme();
  const style = useMemo(() => vars(tokens.cssVars(scheme)), [scheme]);
  // Status-bar content contrasts with the scheme background; screens over a
  // fixed dark/light surface override it while focused (StatusBarStyle).
  useEffect(() => {
    setStatusBarFallback(scheme === "dark" ? "light" : "dark");
  }, [scheme]);
  return (
    <View style={[{ flex: 1 }, style]} className="bg-background">
      {children}
    </View>
  );
}
