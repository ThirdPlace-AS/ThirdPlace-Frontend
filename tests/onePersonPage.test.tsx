// Review 2026-11-18 PR-10 (0528), «Én profil per person»: a host's profile is
// their person page, with what they host under «Arrangerer»; /creator/[id]
// sends old links there; experience pages link a host to it; and Profil
// opens your own page as others see it (/people/me), without Følg, Melding
// or the ••• menu.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CreatorRedirect from "../app/creator/[id]";
import ProfileScreen from "../app/(tabs)/profile";
import { ExperiencePage } from "@/components/experience/ExperiencePage";
import { experiences, experiencesHostedBy, people } from "@/fixtures";
import PersonScreen from "@/features/people/PersonScreen";
import { getMyProfile } from "@/lib/myProfile";

const mockPush = jest.fn();
const mockRedirect = jest.fn();
let mockId = "";
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({ id: mockId }),
  useFocusEffect: () => {},
  Redirect: ({ href }: { href: unknown }) => {
    mockRedirect(href);
    return null;
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

afterEach(() => {
  mockPush.mockClear();
  mockRedirect.mockClear();
});

const host = people.find((p) => experiencesHostedBy(p.id).length > 0)!;

describe("one page per person", () => {
  it("a host's page lists what they host under Arrangerer", () => {
    mockId = host.id;
    render(<PersonScreen />, { wrapper });
    expect(screen.getByText("Arrangerer")).toBeTruthy();
    const first = experiencesHostedBy(host.id)[0]!;
    fireEvent.press(screen.getAllByText(first.title)[0]!);
    expect(mockPush).toHaveBeenLastCalledWith(`/experience/${first.id}`);
    // Still the visitor's actions.
    expect(screen.getByText("Melding")).toBeTruthy();
  });

  it("/creator/[id] sends old links to the person page", () => {
    mockId = host.id;
    render(<CreatorRedirect />);
    expect(mockRedirect).toHaveBeenCalledWith(`/people/${host.id}`);
  });

  it("an experience's host opens the person page", () => {
    const exp = experiences.find(
      (e) => e.hostId && people.some((p) => p.id === e.hostId),
    )!;
    const hostName = people.find((p) => p.id === exp.hostId)!.name;
    const onNavigate = jest.fn();
    render(
      <ExperiencePage exp={exp} onOpen={() => {}} onNavigate={onNavigate} />,
      { wrapper },
    );
    fireEvent.press(screen.getByLabelText(`${hostName}, vert. Se profilen`));
    expect(onNavigate).toHaveBeenLastCalledWith(`/people/${exp.hostId}`);
  });
});

describe("your own page as others see it", () => {
  it("opens from Profil", () => {
    render(<ProfileScreen />, { wrapper });
    fireEvent.press(screen.getByText("Se profilen som andre ser den"));
    expect(mockPush).toHaveBeenLastCalledWith("/people/me");
  });

  it("shows your profile with nothing to follow or report", () => {
    mockId = "me";
    render(<PersonScreen />, { wrapper });
    expect(screen.getByText("Slik ser andre deg")).toBeTruthy();
    expect(screen.getByText(getMyProfile().name)).toBeTruthy();
    expect(screen.queryByText("Melding")).toBeNull();
    expect(screen.queryByText("Følg")).toBeNull();
    expect(screen.queryByLabelText("Mer")).toBeNull();
  });
});
