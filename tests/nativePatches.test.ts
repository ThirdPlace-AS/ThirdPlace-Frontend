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
