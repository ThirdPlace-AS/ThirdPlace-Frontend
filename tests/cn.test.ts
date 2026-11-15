import { describe, expect, it } from "@jest/globals";

import { cn } from "@/lib/utils";

describe("cn (tailwind-merge with our tokens)", () => {
  it("keeps a named type size next to a colour", () => {
    expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
    expect(cn("text-micro text-muted")).toBe("text-micro text-muted");
  });

  it("the later of two type sizes wins", () => {
    expect(cn("text-body", "text-title")).toBe("text-title");
  });

  it("named spacing conflicts with numeric spacing", () => {
    expect(cn("p-gutter", "p-4")).toBe("p-4");
    expect(cn("px-4", "px-gutter")).toBe("px-gutter");
    expect(cn("gap-section", "gap-2")).toBe("gap-2");
  });

  it("radius tokens conflict with each other", () => {
    expect(cn("rounded-xs", "rounded-full")).toBe("rounded-full");
    expect(cn("rounded-2xl", "rounded-md")).toBe("rounded-md");
  });

  it("the later colour wins and opacity steps stay", () => {
    expect(cn("bg-surface", "bg-danger/15")).toBe("bg-danger/15");
    expect(cn("text-ink", "text-ember-text")).toBe("text-ember-text");
  });

  it("drops falsy inputs", () => {
    expect(cn("flex-1", false, undefined, null, "bg-surface")).toBe(
      "flex-1 bg-surface",
    );
  });
});
