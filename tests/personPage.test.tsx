// Phase 13 J3: the person page per PDF p13 — Følg + Melding (the direct
// message, existing or new), shared interests marked, Rapporter / Blokker
// behind the •••, guests asked to sign in.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import PersonScreen from "@/features/people/PersonScreen";
import { chatById } from "@/fixtures";
import { resetCreated } from "@/fixtures/created";
import { resetFollowing, useFollowing } from "@/lib/following";

const mockPush = jest.fn();
let mockParams: Record<string, string> = { id: "u1" };
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
  mockParams = { id: "u1" };
});
afterEach(() => {
  act(() => {
    resetCreated();
    resetFollowing();
  });
});

describe("person page (PDF p13)", () => {
  it("Melding opens the existing direct message", () => {
    render(<PersonScreen />, { wrapper });
    fireEvent.press(screen.getByText("Melding"));
    expect(mockPush).toHaveBeenLastCalledWith("/chat/c2");
  });

  it("Melding starts one direct message per person", () => {
    mockParams = { id: "u2" };
    render(<PersonScreen />, { wrapper });
    fireEvent.press(screen.getByText("Melding"));
    const href = mockPush.mock.calls.at(-1)?.[0] as string;
    const id = href.replace("/chat/", "");
    const chat = chatById(id);
    expect(chat?.type).toBe("dm");
    expect(chat?.personId).toBe("u2");
    expect(chat?.name).toBe("Jonas B.");
    fireEvent.press(screen.getByText("Melding"));
    expect(mockPush).toHaveBeenLastCalledWith(href);
  });

  it("marks shared interests", () => {
    render(<PersonScreen />, { wrapper });
    // Maria shares Kaffe and Fotografi with the profile.
    expect(screen.getByText("Felles interesser")).toBeTruthy();
    expect(screen.getByLabelText("Kaffe")).toBeTruthy();
  });

  it("Følg uses the shared following store", () => {
    const f = renderHook(() => useFollowing());
    render(<PersonScreen />, { wrapper });
    fireEvent.press(screen.getByLabelText("Følg Maria Movik"));
    expect(f.result.current.has("u1")).toBe(true);
  });

  it("guests are asked to sign in before writing", () => {
    const g = renderHook(() => useGuestMode());
    act(() => g.result.current.setGuest(true));
    try {
      render(<PersonScreen />, { wrapper });
      fireEvent.press(screen.getByText("Melding"));
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText(/for å sende meldinger/)).toBeTruthy();
    } finally {
      act(() => g.result.current.setGuest(false));
    }
  });

  it("Rapporter and Blokker sit behind the •••", () => {
    jest.useFakeTimers();
    try {
      render(<PersonScreen />, { wrapper });
      expect(screen.queryByText("Blokker")).toBeNull();
      fireEvent.press(screen.getByLabelText("Mer"));
      fireEvent.press(screen.getByText("Blokker"));
      act(() => {
        jest.advanceTimersByTime(400);
      });
      expect(screen.getByText(/Blokkere Maria/)).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
