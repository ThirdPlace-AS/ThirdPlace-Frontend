import { describe, expect, it } from "@jest/globals";

import { demoCopy } from "@/copy";

// Lines rendered by DemoNote sit next to a DEMO badge, so they must not repeat
// "Demo"; standalone lines must carry it, or a demo state could read as real.
const STANDALONE = new Set<keyof typeof demoCopy>(["listingContacted"]);

describe("demoCopy", () => {
  it("badge-paired lines do not repeat the Demo prefix", () => {
    for (const [key, text] of Object.entries(demoCopy)) {
      if (STANDALONE.has(key as keyof typeof demoCopy)) continue;
      expect(text).not.toMatch(/^Demo\b/);
      expect(text.trim()).toBe(text);
    }
  });

  it("standalone lines are explicitly marked as demo", () => {
    for (const key of STANDALONE) {
      expect(demoCopy[key]).toMatch(/^Demo — /);
    }
  });
});
