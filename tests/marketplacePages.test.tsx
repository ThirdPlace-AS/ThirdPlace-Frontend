// Phase 12 H4c: a Marketplace listing, the listing editor and the collab
// offer/contract are pages (were sheets). No arrows on their buttons.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  CollabContractScreen,
  CollabDetailScreen,
  CollabOfferScreen,
} from "@/features/collab/CollabScreens";
import ListingEditorScreen from "@/features/marketplace/ListingEditorScreen";
import ListingScreen from "@/features/marketplace/ListingScreen";
import MyListingsScreen from "@/features/marketplace/MyListingsScreen";
import { listings } from "@/fixtures";
import { getCollabDeal, resetCollabDeal } from "@/lib/collabDeal";

const mockPush = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: () => mockBack(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
  useFocusEffect: () => {},
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

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockParams = {};
  resetCollabDeal();
});

// l1 (m1) is the account's own listing; requests go to someone else's
// (review 2026-11-18 #18).
const l1 = listings[0]!;
const other = listings.find((l) => l.id === "m2")!;

describe("marketplace pages", () => {
  it("a listing page sends a request into Nytt samarbeid", () => {
    mockParams = { id: other.id };
    render(<ListingScreen />, { wrapper });
    expect(screen.getAllByText(other.title).length).toBeGreaterThan(0);
    fireEvent.press(screen.getByText("Send forespørsel"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/collab/new",
      params: { listing: other.id },
    });
    fireEvent.press(screen.getByText("Lagre"));
    expect(screen.getByText("Lagret")).toBeTruthy();
  });

  it("your own listing offers Rediger listing, not a request (#18)", () => {
    mockParams = { id: l1.id };
    render(<ListingScreen />, { wrapper });
    expect(screen.queryByText("Send forespørsel")).toBeNull();
    fireEvent.press(screen.getByText("Rediger listing"));
    expect(mockPush).toHaveBeenCalledWith(`/my-listings/${l1.id}/edit`);
  });

  it("My listings opens the editor pages", () => {
    render(<MyListingsScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText("Ny listing"));
    expect(mockPush).toHaveBeenLastCalledWith("/my-listings/new");
    fireEvent.press(screen.getByLabelText(`Rediger ${l1.title}`));
    expect(mockPush).toHaveBeenLastCalledWith(`/my-listings/${l1.id}/edit`);
  });

  it("a new listing needs a 3-character title, no arrow", () => {
    render(<ListingEditorScreen />, { wrapper });
    expect(screen.getByText("Ny listing")).toBeTruthy();
    fireEvent.press(screen.getByText("Publiser listing"));
    expect(mockBack).not.toHaveBeenCalled();
    fireEvent.changeText(
      screen.getByPlaceholderText("F.eks. «Koselig lokale med scene»"),
      "Scene på Løkka",
    );
    fireEvent.press(screen.getByText("Publiser listing"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/→/)).toBeNull();
  });

  it("editing starts from the listing", () => {
    mockParams = { id: l1.id };
    render(<ListingEditorScreen />, { wrapper });
    expect(screen.getByText("Rediger listing")).toBeTruthy();
    expect(screen.getByDisplayValue(l1.title)).toBeTruthy();
  });
});

describe("collab pages", () => {
  it("the collab page opens offer and contract as pages", () => {
    render(<CollabDetailScreen />, { wrapper });
    fireEvent.press(screen.getByText("Kontrakt"));
    expect(mockPush).toHaveBeenLastCalledWith("/collab/contract");
    fireEvent.press(screen.getByText("Innkommende tilbud"));
    expect(mockPush).toHaveBeenLastCalledWith("/collab/offer");
  });

  it("accepting an offer goes back; a counter-offer has no arrow", () => {
    render(<CollabOfferScreen />, { wrapper });
    fireEvent.press(screen.getByText("Send mottilbud"));
    expect(screen.getByText("Mottilbud")).toBeTruthy();
    expect(screen.queryByText(/→/)).toBeNull();
    fireEvent.press(screen.getByText("Send mottilbud"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    // Review 2026-11-18 #9: the answer stays with the deal.
    expect(getCollabDeal()).toMatchObject({
      answer: "Mottilbud sendt",
      counterSplit: "50 / 50",
    });
  });

  it("an answered offer shows its answer instead of the buttons (#9)", () => {
    render(<CollabOfferScreen />, { wrapper });
    expect(screen.queryByText(/70 %/)).toBeNull();
    fireEvent.press(screen.getByText("Godta tilbud"));
    expect(getCollabDeal().answer).toBe("Godtatt");
    expect(screen.getByText("Godtatt")).toBeTruthy();
    expect(screen.queryByText("Avslå")).toBeNull();
  });

  it("the collab page shows the answer and no 70/30 split (#9, H-05)", () => {
    const first = render(<CollabDetailScreen />, { wrapper });
    expect(screen.queryByText("Inntektsdeling")).toBeNull();
    expect(screen.queryByText(/70 %/)).toBeNull();
    first.unmount();
    const offer = render(<CollabOfferScreen />, { wrapper });
    fireEvent.press(screen.getByText("Avslå"));
    offer.unmount();
    render(<CollabDetailScreen />, { wrapper });
    expect(screen.getByText("Avslått")).toBeTruthy();
  });

  it("Signer needs a full name and Jeg har lest avtalen (#9)", () => {
    render(<CollabContractScreen />, { wrapper });
    expect(screen.queryByText(/Inntektsdeling/)).toBeNull();
    const signer = () => screen.getByRole("button", { name: "Signer" });
    expect(signer().props.accessibilityState?.disabled).toBe(true);
    const name = screen.getByPlaceholderText("Fornavn Etternavn");
    fireEvent.changeText(name, "Ola");
    fireEvent.press(screen.getByLabelText("Jeg har lest avtalen"));
    expect(signer().props.accessibilityState?.disabled).toBe(true);
    fireEvent.changeText(name, "Ola Nordmann");
    expect(signer().props.accessibilityState?.disabled).toBe(false);
    fireEvent.press(signer());
    expect(getCollabDeal().signedBy).toBe("Ola Nordmann");
    expect(screen.getByText("Signert av Ola Nordmann")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Signer" })).toBeNull();
  });
});
