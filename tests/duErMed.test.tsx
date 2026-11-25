// Review 2026-11-18 PR-03: once joined, the experience page itself says «Du
// er med» with the calendar, directions and chat, and the way out; the
// floating join card leads to the chat instead of offering Forlat.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import { ExperienceJoinBar } from "@/components/map/content/ExperienceJoinBar";
import {
  resetExperienceJoins,
  useExperienceJoin,
} from "@/components/map/hooks/useExperienceJoin";
import { useGuestMode } from "@/components/map/hooks/useGuestMode";
import { chatForExperience, experienceById } from "@/fixtures";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  ...(jest.requireActual("expo-router") as object),
  router: {
    push: (h: unknown) => mockPush(h),
    back: jest.fn(),
    canGoBack: () => true,
  },
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

const e1 = experienceById("e1")!;

function join(id = "e1") {
  const { result } = renderHook(() => useExperienceJoin(id, "none"));
  act(() => result.current[1]("joined"));
  return result;
}

function renderPage() {
  return render(
    <ExperiencePage exp={e1} onOpen={jest.fn()} onNavigate={jest.fn()} />,
    { wrapper },
  );
}

afterEach(() => {
  act(() => resetExperienceJoins());
  mockPush.mockClear();
});

describe("«Du er med» on the page", () => {
  it("is not there before joining", () => {
    renderPage();
    expect(screen.queryByText("Du er med")).toBeNull();
  });

  it("shows the next steps once joined", () => {
    // Tilgjengelighet and Møtested further down have their own calendar and
    // directions links; the card adds one of each near the top.
    const count = (t: string) => screen.queryAllByText(t).length;
    const before = renderPage();
    const cal = count("Legg til i kalender");
    const dir = count("Veibeskrivelse");
    before.unmount();
    join();
    renderPage();
    expect(screen.getByText("Du er med")).toBeTruthy();
    expect(count("Legg til i kalender")).toBe(cal + 1);
    expect(count("Veibeskrivelse")).toBe(dir + 1);
    const chat = chatForExperience("e1");
    if (chat) {
      fireEvent.press(screen.getByText("Til samtalen"));
      expect(mockPush).toHaveBeenCalledWith(`/chat/${chat.id}`);
    }
  });

  it("Forlat asks first, then leaves", () => {
    jest.useFakeTimers();
    try {
      const state = join();
      renderPage();
      fireEvent.press(screen.getByText("Forlat"));
      expect(screen.getByText(`Vil du forlate «${e1.title}»?`)).toBeTruthy();
      // The sheet's own Forlat comes last.
      fireEvent.press(screen.getAllByText("Forlat").at(-1)!);
      act(() => jest.advanceTimersByTime(300));
      expect(state.current[0]).toBe("none");
      expect(screen.queryByText("Du er med")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("a guest never sees it", () => {
    const guest = renderHook(() => useGuestMode());
    act(() => guest.result.current.setGuest(true));
    try {
      join();
      renderPage();
      expect(screen.queryByText("Du er med")).toBeNull();
    } finally {
      act(() => guest.result.current.setGuest(false));
    }
  });
});

describe("the floating join card once joined", () => {
  it("leads to the chat instead of Forlat", () => {
    const chat = chatForExperience("e1")!;
    expect(chat).toBeTruthy();
    join();
    render(<ExperienceJoinBar id="e1" />, { wrapper });
    expect(screen.queryByText("Forlat")).toBeNull();
    fireEvent.press(screen.getByText("Til samtalen"));
    expect(mockPush).toHaveBeenCalledWith(`/chat/${chat.id}`);
  });
});
