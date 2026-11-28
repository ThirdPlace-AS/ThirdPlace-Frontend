// Ledger 0351: react-native-screens 4.26.2 crashed the app natively on about
// one cold start in four on the emulator (SIGSEGV in
// MountingCoordinator::pullTransaction, a listener created twice by two
// threads). scripts/apply-patches.js applies the upstream fix on every
// install; this fails if an install skipped it.
import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

const dir = path.join(__dirname, "..", "node_modules", "react-native-screens");
const version: string = JSON.parse(
  fs.readFileSync(path.join(dir, "package.json"), "utf8"),
).version;
const read = (file: string) => fs.readFileSync(path.join(dir, file), "utf8");

describe("react-native-screens listener fix", () => {
  it("is installed with the upstream fix", () => {
    if (version !== "4.26.2") {
      // Past 4.28.0 the fix ships with the package and the patch goes.
      const [major, minor] = version.split(".").map(Number);
      expect(major! > 4 || (major === 4 && minor! >= 28)).toBe(true);
      return;
    }
    expect(read("android/src/main/cpp/NativeProxy.cpp")).toContain(
      "removalListener()->setListener(",
    );
    expect(read("android/src/main/cpp/NativeProxy.cpp")).not.toContain(
      "if (!screenRemovalListener_)",
    );
    expect(read("cpp/RNSScreenRemovalListener.cpp")).toContain(
      "RNSScreenRemovalListener::setListener(",
    );
  });
});

// Ledger 0576: @gorhom/bottom-sheet 5.2.14 animated its content mask's height
// on every drag frame; on the Android 10 phone the mask fell far short of its
// target and the map page sheet's lower part went unpainted on a slow drag.
// The patch sets the mask's height and padding directly, in the source Metro
// bundles and in both built copies.
describe("@gorhom/bottom-sheet content mask", () => {
  const gorhom = path.join(
    __dirname,
    "..",
    "node_modules",
    "@gorhom",
    "bottom-sheet",
  );
  const gorhomVersion: string = JSON.parse(
    fs.readFileSync(path.join(gorhom, "package.json"), "utf8"),
  ).version;
  it("is installed unanimated", () => {
    // A new gorhom release stops the install (apply-patches.js) until the
    // patch is checked against it.
    expect(gorhomVersion).toBe("5.2.14");
    for (const file of [
      "src/components/bottomSheet/BottomSheetContent.tsx",
      "lib/module/components/bottomSheet/BottomSheetContent.js",
      "lib/commonjs/components/bottomSheet/BottomSheetContent.js",
    ]) {
      const text = fs.readFileSync(path.join(gorhom, file), "utf8");
      expect(text).toContain("ThirdPlace patch: unanimated mask (0576)");
      expect(text).not.toMatch(/height: (\(0, _utilities\.)?animate\)?\(/);
    }
  });
});
