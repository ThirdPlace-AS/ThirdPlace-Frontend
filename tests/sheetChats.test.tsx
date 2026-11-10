// User 2026-11-10: "every place, business and experiances must have a chat on
// the details modal sheet" ("same as the experiances have right now"). The
// map's place sheet (every kind) and the business sub-view behind "Drives av"
// show the Samtalen section; every place and experience has a chat to show.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BusinessContent } from "@/components/map/content/BusinessContent";
import { PlaceContent } from "@/components/map/content/PlaceContent";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import {
  businesses,
  chatForExperience,
  chatForPlace,
  experiences,
  places,
  type PlaceKind,
} from "@/fixtures";
import { createExperience, resetCreated } from "@/fixtures/created";
import { resetJoinedChats } from "@/lib/joinedChats";

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
  resetJoinedChats();
  resetCreated();
  mockPush.mockClear();
});

// Catalogue items: their chats are not joined to begin with.
const catalogue = (kind: PlaceKind) =>
  places.find((p) => p.kind === kind && p.id.startsWith("p-"))!;

describe("the map's details sheets show their chat", () => {
  it.each(["bedrift", "organisasjon", "byrom"] as const)("a %s", (kind) => {
    const place = catalogue(kind);
    const chat = chatForPlace(place.id)!;
    render(<PlaceContent id={place.id} push={jest.fn()} />, { wrapper });
    expect(screen.getByText("Samtalen")).toBeTruthy();
    // A place's chat carries its name (the title shows it too).
    expect(screen.getAllByText(chat.name).length).toBeGreaterThan(1);
    fireEvent.press(screen.getByText("Bli med i samtalen"));
    expect(mockPush).toHaveBeenCalledWith(`/chat/${chat.id}`);
  });

  it('the business behind "Drives av" shows its place\'s chat', () => {
    const business = businesses.find((b) => b.id.startsWith("b-"))!;
    const chat = chatForPlace(business.placeId)!;
    render(<BusinessContent id={business.id} push={jest.fn()} />, {
      wrapper,
    });
    expect(screen.getByText("Samtalen")).toBeTruthy();
    fireEvent.press(screen.getByText("Bli med i samtalen"));
    expect(mockPush).toHaveBeenCalledWith(`/chat/${chat.id}`);
  });

  it("asks a guest to sign in before joining", () => {
    const g = renderHook(() => useGuestMode());
    act(() => g.result.current.setGuest(true));
    try {
      const business = businesses.find((b) => b.id.startsWith("b-"))!;
      render(<BusinessContent id={business.id} push={jest.fn()} />, {
        wrapper,
      });
      fireEvent.press(screen.getByText("Bli med i samtalen"));
      expect(mockPush).not.toHaveBeenCalled();
    } finally {
      act(() => g.result.current.setGuest(false));
    }
  });
});

describe("every place and experience has a chat", () => {
  it("the fixtures: legacy and catalogue", () => {
    expect(places.filter((p) => !chatForPlace(p.id)).map((p) => p.id)).toEqual(
      [],
    );
    expect(
      experiences.filter((e) => !chatForExperience(e.id)).map((e) => e.id),
    ).toEqual([]);
  });

  it("an experience made in Legg til", () => {
    const id = createExperience({
      title: "Strikkekveld",
      about: "Vi strikker sammen.",
      category: "Kreativt",
      area: places[0]!.name,
      meetingPoint: "",
      photos: experiences[0]!.photos,
      date: "2026-11-20",
      startTime: "18:00",
      duration: "2 timer",
      repeat: "Ukentlig",
      capacity: 6,
      priceNok: 0,
      access: "Alle",
      cancellation: "Gratis frem til 24 t før",
      vibes: ["Koselig"],
      energy: null,
      languages: ["Norsk"],
      included: ["Garn"],
      steps: ["Vi møtes", "", "Vi strikker"],
    });
    expect(chatForExperience(id)).toBeTruthy();
  });
});
