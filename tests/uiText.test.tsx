import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Text } from "@/components/ui";
import { FONT_FAMILY, fontFamilyFor } from "@/theme/fonts";

function familyOf(label: string) {
  return StyleSheet.flatten(screen.getByText(label).props.style)?.fontFamily;
}

describe("Text primitive", () => {
  it("uses the variant's default weight family", () => {
    render(
      <>
        <Text variant="h1">Tittel</Text>
        <Text>Brødtekst</Text>
      </>,
    );
    expect(familyOf("Tittel")).toBe(fontFamilyFor("bold"));
    expect(familyOf("Brødtekst")).toBe(fontFamilyFor("regular"));
  });

  it("lets weight override the family", () => {
    render(<Text weight="semibold">Bli med</Text>);
    expect(familyOf("Bli med")).toBe(FONT_FAMILY.semibold);
  });

  it("marks headings with the header role, body without", () => {
    render(
      <>
        <Text variant="h2">Seksjon</Text>
        <Text variant="caption">Hjelpetekst</Text>
      </>,
    );
    expect(screen.getByText("Seksjon").props.accessibilityRole).toBe("header");
    expect(
      screen.getByText("Hjelpetekst").props.accessibilityRole,
    ).toBeUndefined();
  });

  it("defines all four weights", () => {
    expect(Object.keys(FONT_FAMILY).sort()).toEqual([
      "bold",
      "medium",
      "regular",
      "semibold",
    ]);
  });
});
