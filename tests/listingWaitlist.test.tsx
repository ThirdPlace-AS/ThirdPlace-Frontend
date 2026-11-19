// Phase 13 J5: the listing owner's Venteliste (PDF p18), reached from Mine
// listings; "Tilby" opens Nytt samarbeid with the partner filled in.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { NewCollabScreen } from "@/features/collab/CollabScreens";
import ListingWaitlistScreen from "@/features/marketplace/ListingWaitlistScreen";
import MyListingsScreen from "@/features/marketplace/MyListingsScreen";
import { listingById } from "@/fixtures";

const mockPush = jest.fn();
let mockParams: Record<string, string> = { id: "m1" };
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    replace: jest.fn(),
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
  mockParams = { id: "m1" };
});

describe("Venteliste (PDF p18)", () => {
  const listing = listingById("m1")!;
  const waitlist = listing.waitlist!;

  it("the count is the list length, rows numbered in order", () => {
    render(<ListingWaitlistScreen />, { wrapper });
    expect(
      screen.getByText(`${listing.title} · ${waitlist.length} på venteliste`),
    ).toBeTruthy();
    expect(screen.getByText(`#${waitlist.length}`)).toBeTruthy();
    expect(
      screen.getByText(
        `Fullt (${listing.taken} av ${listing.capacity} samarbeid)`,
      ),
    ).toBeTruthy();
  });

  it("states no acceptance rule", () => {
    render(<ListingWaitlistScreen />, { wrapper });
    expect(screen.queryByText(/Auto-godta/i)).toBeNull();
  });

  it("Tilby opens Nytt samarbeid with the partner", () => {
    render(<ListingWaitlistScreen />, { wrapper });
    const first = waitlist[0]!;
    fireEvent.press(screen.getByLabelText(`Tilby samarbeid til ${first.name}`));
    expect(mockPush).toHaveBeenLastCalledWith(
      `/collab/new?listing=m1&partner=${encodeURIComponent(first.name)}`,
    );
  });

  it("Nytt samarbeid shows the partner it was opened for", () => {
    mockParams = { listing: "m1", partner: "Sofie Lind" };
    render(<NewCollabScreen />, { wrapper });
    expect(screen.getByText("Partner")).toBeTruthy();
    expect(screen.getByText("Sofie Lind")).toBeTruthy();
  });

  it("Mine listings links a full listing to its Venteliste", () => {
    render(<MyListingsScreen />, { wrapper });
    fireEvent.press(screen.getByText(`Venteliste (${waitlist.length})`));
    expect(mockPush).toHaveBeenLastCalledWith("/my-listings/m1/waitlist");
  });
});
