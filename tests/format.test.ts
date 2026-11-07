import { describe, expect, it } from "@jest/globals";

import { formatDecimal, formatRating, formatThreshold } from "@/lib/format";

describe("nb-NO number formatting", () => {
  it("uses a decimal comma", () => {
    expect(formatRating(4.8)).toBe("4,8");
    expect(formatRating(4)).toBe("4,0");
    expect(formatDecimal(1.25, 2)).toBe("1,25");
  });

  it("thresholds drop the decimal for whole numbers", () => {
    expect(formatThreshold(4)).toBe("4");
    expect(formatThreshold(4.5)).toBe("4,5");
  });
});
