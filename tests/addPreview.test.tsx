// Review 2026-11-18 PR-07 (0525), «Se før du publiserer»: Legg til's last
// step shows an experience as its real page (built the way publishing builds
// it, nothing on it acts), every part has «Endre» that opens its step and
// comes back, and «Del» follows publishing.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ExperiencePage } from "@/components/experience/ExperiencePage";
import { AddWizard } from "@/features/add/AddWizard";
import { experienceById, experiences, places } from "@/fixtures";
import {
  buildExperience,
  createExperience,
  resetCreated,
} from "@/fixtures/created";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
  useFocusEffect: () => {},
}));

afterEach(() => resetCreated());

const INPUT = {
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
  steps: ["Vi møtes", "Vi strikker"],
};

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
  );
}

describe("the preview", () => {
  it("is what publishing saves", () => {
    const id = createExperience(INPUT);
    expect(experienceById(id)).toEqual(buildExperience(INPUT, id));
  });

  it("shows the page with nothing that acts, and Endre per part", () => {
    const onEdit = jest.fn();
    render(
      <ExperiencePage
        exp={buildExperience(INPUT)}
        onOpen={() => {}}
        onNavigate={() => {}}
        preview={{ onEdit }}
      />,
      { wrapper },
    );
    expect(screen.getByText("Strikkekveld")).toBeTruthy();
    expect(screen.getByText("Vi strikker sammen.")).toBeTruthy();
    // Nothing a visitor would act on.
    expect(screen.queryByText("Rapporter opplevelsen")).toBeNull();
    expect(screen.queryByText(/^Send melding til/)).toBeNull();
    expect(screen.queryByText("Se deltakere")).toBeNull();
    expect(screen.queryByText("Flere opplevelser i området")).toBeNull();
    // Each part goes to its step.
    const parts: [string, string][] = [
      ["Endre bildene", "photos"],
      ["Endre teksten", "about"],
      ["Endre stemningen", "mood"],
      ["Endre programmet", "plan"],
      ["Endre tiden", "when"],
      ["Endre møtestedet", "where"],
      ["Endre rammene", "frame"],
    ];
    for (const [label, part] of parts) {
      fireEvent.press(screen.getByLabelText(label));
      expect(onEdit).toHaveBeenLastCalledWith(part);
    }
    // The fact rows edit too, and say so.
    fireEvent.press(screen.getByLabelText(/^Endre: 6 plasser/));
    expect(onEdit).toHaveBeenLastCalledWith("frame");
  });
});

describe("the wizard", () => {
  /** A group through to its last step (five steps, two photos). */
  function groupToReview() {
    render(<AddWizard />, { wrapper });
    fireEvent.press(screen.getByText("Gruppe"));
    fireEvent.changeText(
      screen.getByPlaceholderText("F.eks. «Løpegjengen på Løkka»"),
      "Løp",
    );
    fireEvent.press(screen.getByLabelText("Kaffe"));
    fireEvent.press(screen.getByText("Neste"));
    fireEvent.press(screen.getByLabelText("Grünerløkka"));
    fireEvent.press(screen.getByText("Neste"));
    fireEvent.press(screen.getByLabelText("Bilde 1"));
    fireEvent.press(screen.getByLabelText("Bilde 2"));
    fireEvent.press(screen.getByText("Neste"));
    fireEvent.press(screen.getByText("Neste"));
    expect(screen.getByText("Se over gruppen")).toBeTruthy();
  }

  it("Endre opens the step and its button comes back", () => {
    groupToReview();
    fireEvent.press(screen.getByLabelText("Endre tilgangen"));
    expect(screen.queryByText("Se over gruppen")).toBeNull();
    fireEvent.press(screen.getByText("Tilbake til forhåndsvisningen"));
    expect(screen.getByText("Se over gruppen")).toBeTruthy();
    // Back from an Endre step returns to the preview too, not a step back.
    fireEvent.press(screen.getByLabelText("Endre teksten"));
    expect(screen.getByText("Om gruppen")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Tilbake"));
    expect(screen.getByText("Se over gruppen")).toBeTruthy();
    // Without Endre, the steps go forward as before.
    expect(screen.queryByText("Tilbake til forhåndsvisningen")).toBeNull();
  });

  it("offers Del after the group is made", () => {
    groupToReview();
    fireEvent.press(screen.getByText("Opprett gruppen"));
    expect(screen.getByText("Gruppen er opprettet")).toBeTruthy();
    fireEvent.press(screen.getByText("Del"));
    expect(screen.getByText(/^thirdplace\.app\/group\//)).toBeTruthy();
  });
});
