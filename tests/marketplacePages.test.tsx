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
});

const l1 = listings[0]!;

describe("marketplace pages", () => {
  it("a listing page sends a request into Nytt samarbeid", () => {
    mockParams = { id: l1.id };
    render(<ListingScreen />, { wrapper });
    expect(screen.getAllByText(l1.title).length).toBeGreaterThan(0);
    fireEvent.press(screen.getByText("Send forespørsel"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/collab/new",
      params: { listing: l1.id },
    });
    fireEvent.press(screen.getByText("Lagre"));
    expect(screen.getByText("Lagret")).toBeTruthy();
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
  });

  it("the contract signs in place", () => {
    render(<CollabContractScreen />, { wrapper });
    fireEvent.press(screen.getByText("Trykk for å signere"));
    expect(screen.getByText("✓ Signert")).toBeTruthy();
  });
});
