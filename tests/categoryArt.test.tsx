import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";

import { CATEGORY_ART, type ArtKey } from "@/assets/3d/manifest";
import {
  CategoryArt,
  hasCategoryArt,
} from "@/components/illustrations/CategoryArt";

const KEYS: ArtKey[] = [
  "cafe",
  "bar",
  "restaurant",
  "outdoors",
  "culture",
  "workshop",
  "tasting",
  "music",
  "hiking",
  "art",
  "sport",
  "social",
  "place",
  "experience",
  "location",
];

describe("CategoryArt", () => {
  it.each(KEYS)("renders %s", (k) => {
    const { toJSON } = render(<CategoryArt name={k} size={48} />);
    expect(toJSON()).toBeTruthy();
  });

  it("maps every manifest label to a drawable key", () => {
    for (const [label, key] of Object.entries(CATEGORY_ART)) {
      expect(KEYS).toContain(key);
      expect(hasCategoryArt(label)).toBe(true);
    }
  });

  it("renders nothing for an unknown category", () => {
    const { toJSON } = render(<CategoryArt name="Ukjent" />);
    expect(toJSON()).toBeNull();
  });
});
