import { describe, expect, it, jest } from "@jest/globals";

import { stripInteractive } from "@/components/ui/Pressable";

// Regression: `active:` on the inner content View made it the touch responder
// and every ghost IconButton stopped responding on device.
describe("Pressable contentClassName guard", () => {
  it("removes active/focus/hover variants and keeps the rest", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      stripInteractive(
        "items-center active:bg-surfaceMuted rounded-full focus:border-ink",
      ),
    ).toBe("items-center rounded-full");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("leaves clean class lists untouched", () => {
    expect(stripInteractive("bg-ink rounded-full")).toBe("bg-ink rounded-full");
    expect(stripInteractive(undefined)).toBeUndefined();
  });
});
