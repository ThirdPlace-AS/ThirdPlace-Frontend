// The map's place detail is the PlacePage in the page sheet, as experiences
// have ExperiencePage (user 2026-11-09: "make businesses and places the same
// map details sheet as experience"). Del and Lagre live in the sheet header
// and page top bar. The page is a business's or organisation's one profile
// (user 2026-11-10: "businesses and organizations don't need 2 business
// profiles"): who runs it is a fact on the page, nothing opens a second one.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PlaceContent } from "@/components/map/content/PlaceContent";
import {
  businessForPlace,
  organizationForPlace,
  personById,
  placeById,
  places,
} from "@/fixtures";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({}),
}));

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

afterEach(() => {
  mockPush.mockClear();
});

describe("PlaceContent", () => {
  it("renders the place page for a place", () => {
    const p1 = placeById("p1")!;
    render(<PlaceContent id="p1" />, { wrapper });
    expect(screen.getByRole("header", { name: p1.name })).toBeTruthy();
    expect(screen.getByText("Hvor du finner oss")).toBeTruthy();
    // Vibe chips from the fixture (p1 = Rolig/Koselig).
    expect(screen.getByText("Rolig")).toBeTruthy();
    // Del and Lagre moved to the sheet header / page top bar.
    expect(screen.queryByText("Del")).toBeNull();
  });

  it("a Bedrift's page is its one profile", () => {
    const place = places.find(
      (p) => p.kind === "bedrift" && businessForPlace(p.id)?.verified,
    )!;
    const business = businessForPlace(place.id)!;
    render(<PlaceContent id={place.id} />, { wrapper });
    // Who runs it, in their own words, as a fact: not a way to a second
    // profile.
    expect(screen.getByText(`Drives av ${business.name}`)).toBeTruthy();
    expect(screen.getByText(business.about)).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: new RegExp("^Drives av") }),
    ).toBeNull();
    // Its verified mark sits under the name (PDF p6).
    expect(screen.getByLabelText("Verifisert bedrift")).toBeTruthy();
  });

  it("an unverified business has no verified mark", () => {
    const place = places.find((p) => {
      const b = p.kind === "bedrift" ? businessForPlace(p.id) : undefined;
      return b !== undefined && !b.verified;
    });
    expect(place).toBeDefined();
    render(<PlaceContent id={place!.id} />, { wrapper });
    expect(screen.queryByLabelText("Verifisert bedrift")).toBeNull();
  });

  it("an organisation's details are rows; its contact opens the person", () => {
    const place = places.find(
      (p) =>
        p.kind === "organisasjon" &&
        organizationForPlace(p.id) &&
        personById(organizationForPlace(p.id)!.contactPersonId),
    )!;
    const org = organizationForPlace(place.id)!;
    const contact = personById(org.contactPersonId)!;
    render(<PlaceContent id={place.id} />, { wrapper });
    expect(screen.getByText(org.about)).toBeTruthy();
    expect(screen.getByText("Hva vi gjør")).toBeTruthy();
    expect(screen.queryByText("Om organisasjonen")).toBeNull();
    fireEvent.press(
      screen.getByRole("button", {
        name: `${contact.name}, Kontaktperson`,
      }),
    );
    expect(mockPush).toHaveBeenCalledWith(`/people/${contact.id}`);
  });

  it("shows a not-found message for an unknown id", () => {
    render(<PlaceContent id="nope" />, { wrapper });
    expect(screen.getByText("Fant ikke stedet.")).toBeTruthy();
  });
});
