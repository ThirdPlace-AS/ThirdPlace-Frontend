import { describe, expect, it } from "@jest/globals";

import { memoVariants } from "@/lib/memoVariants";
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
    expect(cn("rounded-xl", "rounded-md")).toBe("rounded-md");
  });

  it("the later colour wins and opacity steps stay", () => {
    expect(cn("bg-surface", "bg-danger/15")).toBe("bg-danger/15");
    expect(cn("text-ink", "text-emberText")).toBe("text-emberText");
  });

  it("drops falsy inputs", () => {
    expect(cn("flex-1", false, undefined, null, "bg-surface")).toBe(
      "flex-1 bg-surface",
    );
  });
});

describe("memoVariants", () => {
  it("returns the same string and calls cva once per combination", () => {
    let calls = 0;
    const f = memoVariants((p: { a?: string; b?: boolean }) => {
      calls += 1;
      return `${p.a}-${p.b}`;
    });
    expect(f({ a: "x", b: true })).toBe("x-true");
    expect(f({ a: "x", b: true })).toBe("x-true");
    expect(f({ a: "x", b: false })).toBe("x-false");
    expect(f({ a: "x" })).toBe("x-undefined");
    expect(calls).toBe(3);
  });
});
