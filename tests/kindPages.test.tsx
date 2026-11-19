// Phase 19 S3c (founder 2026-11-08): each kind's page says what it is. A
// Bedrift names who runs it, an Organisasjon its form and contact person, a
// Byrom its facilities; every place lists what happens there and the groups
// that meet there; an Arrangement names its organiser and its days; a group
// page shows its interests, where it meets, its chat and its members (12
// faces at most, then "og N andre"). The dev catalogue lists the six kinds.
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  ExperiencePage,
  experienceChips,
} from "@/components/experience/ExperiencePage";
import { ChatSection } from "@/components/experience/ExperienceSections";
import {
  GroupContent,
  MAX_FACES,
  memberFaces,
} from "@/components/map/content/GroupContent";
import { moreExperiences } from "@/components/experience/experienceMeta";
import {
  PlacePage,
  nearbyPlaces,
  placeThingsToKnow,
} from "@/components/place/PlacePage";
import PlaceScreen from "@/features/place/PlaceScreen";
import CatalogScreen from "@/features/sandbox/CatalogScreen";
import {
  CATALOG_SLOTS,
  catalogSlots,
  filledSlots,
} from "@/features/sandbox/catalogSlots";
import {
  CHAT_ACCESS_LABEL,
  businessForPlace,
  chatById,
  chatForPlace,
  experienceById,
  experiences,
  groupById,
  groups,
  messagesForChat,
  organizationForPlace,
  personById,
  placeById,
  places,
} from "@/fixtures";
import { INTERESTS } from "@/fixtures/catalog/interests";
import { createGroup, resetCreated } from "@/fixtures/created";
import { NEARBY_M, distanceMeters } from "@/lib/distance";
import { resetJoinedChats } from "@/lib/joinedChats";

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  router: {
    push: (h: unknown) => mockPush(h),
    navigate: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
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

afterEach(() => {
  mockPush.mockClear();
  mockParams = {};
  act(() => {
    resetCreated();
    resetJoinedChats();
  });
});

describe("place pages by kind", () => {
  it("a Bedrift names who runs it and the group that meets there", () => {
    const gym = placeById("p-klatring-b")!;
    const biz = businessForPlace(gym.id)!;
    const nav = jest.fn();
    render(<PlacePage place={gym} onNavigate={nav} />, { wrapper });
    // One profile (user 2026-11-10): who runs it and their own words are a
    // fact on the page; a verified business wears the mark under its name.
    expect(screen.getByText(`Drives av ${biz.name}`)).toBeTruthy();
    expect(screen.getByText(biz.about)).toBeTruthy();
    expect(screen.queryAllByLabelText("Verifisert bedrift")).toHaveLength(
      biz.verified ? 1 : 0,
    );
    // The opplevelse is held here.
    expect(screen.getByText("Hva skjer her")).toBeTruthy();
    const exp = experienceById("e-klatring")!;
    fireEvent.press(screen.getByText(exp.title));
    expect(nav).toHaveBeenCalledWith("/experience/e-klatring");
    // Buldrevenner på Romerike meet at the gym.
    expect(screen.getByText("Grupper som møtes her")).toBeTruthy();
    fireEvent.press(screen.getByText(groupById("g-klatring")!.name));
    expect(nav).toHaveBeenCalledWith("/group/g-klatring");
    expect(screen.queryByText("Hva vi gjør")).toBeNull();
  });

  it("an Organisasjon shows its form, contact and what it organises", () => {
    const club = placeById("p-klatring-o")!;
    const org = organizationForPlace(club.id)!;
    const contact = personById(org.contactPersonId)!;
    const nav = jest.fn();
    render(<PlacePage place={club} onNavigate={nav} />, { wrapper });
    // The club shares its place's name: its row says what it is, with the
    // club's own words; the contact person is a row of their own.
    expect(org.name).toBe(club.name);
    expect(screen.getByText(org.form)).toBeTruthy();
    expect(screen.getByText(org.about)).toBeTruthy();
    expect(screen.getByText("Hva vi gjør")).toBeTruthy();
    fireEvent.press(
      screen.getByRole("button", { name: `${contact.name}, Kontaktperson` }),
    );
    expect(nav).toHaveBeenCalledWith(`/people/${contact.id}`);
    // Hengetak-dagene: organised by the club, two days.
    expect(screen.getByText("Festival · Lør 10:00")).toBeTruthy();
    expect(screen.queryByText(/^Drives av /)).toBeNull();
  });

  it("a Byrom lists its facilities under Ting å vite", () => {
    const crag = placeById("p-klatring-r")!;
    const know = placeThingsToKnow(crag);
    const facilities = know.find((k) => k.key === "fasiliteter")!;
    expect(facilities.summary).toBe(crag.space!.facilities.join(", "));
    render(<PlacePage place={crag} onNavigate={jest.fn()} />, { wrapper });
    expect(screen.getByText("Fasiliteter")).toBeTruthy();
    expect(screen.queryByText(/^Drives av /)).toBeNull();
    expect(screen.queryByText("Hva vi gjør")).toBeNull();
  });
});

describe("the place page's top bar", () => {
  it("says what the place is and where (Klatrefelt · Kolsås)", () => {
    // A city space by its own kind, not just "Byrom" (user 2026-11-09).
    mockParams = { id: "p-klatring-r" };
    render(<PlaceScreen />, { wrapper });
    expect(screen.getByText("Klatrefelt · Kolsås")).toBeTruthy();
    expect(screen.getAllByText("Kolsås klatrefelt").length).toBeGreaterThan(0);
  });
});

describe("an Arrangement's page", () => {
  it("names the organiser, says Program and counts the days", () => {
    const fest = experienceById("e-klatring-arr")!;
    const org = placeById(fest.organizerPlaceId!)!;
    const nav = jest.fn();
    render(<ExperiencePage exp={fest} onOpen={jest.fn()} onNavigate={nav} />, {
      wrapper,
    });
    fireEvent.press(screen.getByText(`Arrangør: ${org.name}`));
    expect(nav).toHaveBeenCalledWith(`/place/${org.id}`);
    expect(screen.getByText("Program")).toBeTruthy();
    expect(screen.queryByText("Hva dere skal gjøre")).toBeNull();
    expect(screen.getByText(/^2 dager · /)).toBeTruthy();
    // "Festival" is in the top bar, not repeated as a chip.
    expect(fest.tags).toContain("Festival");
    expect(experienceChips(fest)).not.toContain("Festival");
  });

  it("leaves the organiser out of an opplevelse", () => {
    const exp = experienceById("e-klatring")!;
    render(
      <ExperiencePage exp={exp} onOpen={jest.fn()} onNavigate={jest.fn()} />,
      { wrapper },
    );
    expect(screen.queryByText(/^Arrangør: /)).toBeNull();
    expect(screen.getByText("Hva dere skal gjøre")).toBeTruthy();
  });
});

describe("the group page", () => {
  it("shows its interests, where it meets, its chat and 12 faces", () => {
    const g = groupById("g-klatring")!;
    const home = placeById(g.homePlaceId!)!;
    render(<GroupContent id={g.id} />, { wrapper });
    expect(screen.getByText("Klatring")).toBeTruthy();
    expect(screen.getByText("Møtes på")).toBeTruthy();
    fireEvent.press(screen.getByText(home.name));
    expect(mockPush).toHaveBeenCalledWith(`/place/${home.id}`);
    expect(screen.getByText("Samtalen")).toBeTruthy();
    expect(
      screen.getByText(
        `${g.memberCount} medlemmer · ${CHAT_ACCESS_LABEL.open}`,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(`og ${g.memberCount - MAX_FACES} andre`),
    ).toBeTruthy();
    fireEvent.press(screen.getByText("Bli med i samtalen"));
    expect(mockPush).toHaveBeenCalledWith(`/chat/${g.chatId}`);
  });

  it("puts the group's own faces first and counts the rest", () => {
    for (const g of groups) {
      const { faces, others } = memberFaces(g);
      expect(faces).toHaveLength(Math.min(MAX_FACES, g.memberCount));
      expect(faces.length + others).toBe(g.memberCount);
      expect(new Set(faces.map((f) => f.key)).size).toBe(faces.length);
    }
    expect(memberFaces(groupById("g1")!).faces[0]).toMatchObject({
      initials: "MM",
    });
  });

  it("a new group is its creator alone, with its chat", () => {
    const { groupId, chatId } = createGroup({
      name: "Sjakk på Tøyen",
      about: "",
      interests: [],
      area: "Tøyen",
      photos: ["group-coffee", "venue-cafe"],
      access: "open",
    });
    const g = groupById(groupId)!;
    expect(g.chatId).toBe(chatId);
    expect(memberFaces(g)).toMatchObject({ others: 0 });
    expect(memberFaces(g).faces).toHaveLength(1);
    render(<GroupContent id={groupId} />, { wrapper });
    expect(screen.queryByText("Møtes på")).toBeNull();
    expect(screen.queryByText(/ andre$/)).toBeNull();
    expect(screen.getByText("Samtalen")).toBeTruthy();
  });
});

describe("group chats", () => {
  it("every group has one, with its members and a few messages", () => {
    for (const g of groups) {
      const chat = chatById(g.chatId!);
      expect(chat).toBeDefined();
      expect(chat!.type).toBe("user_created");
      expect(chat!.members).toBe(g.memberCount);
      expect(messagesForChat(chat!.id).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("the fixture groups' chats wait to be joined (Chat tab unchanged)", () => {
    for (const id of ["c-g1", "c-g2", "c-g3"])
      expect(chatById(id)).toMatchObject({ member: false });
  });

  it("a chat without a count shows its access mode alone", () => {
    const chat = chatForPlace("p-klatring-b")!;
    expect(chat.members).toBeUndefined();
    render(<ChatSection chat={chat} onNavigate={jest.fn()} />, { wrapper });
    expect(screen.getByText(CHAT_ACCESS_LABEL[chat.access])).toBeTruthy();
    expect(screen.queryByText(/medlemmer/)).toBeNull();
  });
});

describe("the dev catalogue", () => {
  it("finds Klatring's six items, one of each", () => {
    const slots = catalogSlots().get("klatring")!;
    expect(filledSlots(slots)).toBe(CATALOG_SLOTS.length);
    expect(slots.bedrift.map((i) => i.id)).toEqual(["p-klatring-b"]);
    expect(slots.organisasjon.map((i) => i.id)).toEqual(["p-klatring-o"]);
    expect(slots.byrom.map((i) => i.id)).toEqual(["p-klatring-r"]);
    expect(slots.opplevelse.map((i) => i.id)).toEqual(["e-klatring"]);
    expect(slots.arrangement.map((i) => i.id)).toEqual(["e-klatring-arr"]);
    expect(slots.gruppe.map((i) => i.href)).toEqual(["/group/g-klatring"]);
  });

  it("says how many interests have all six", () => {
    const all = catalogSlots();
    const complete = INTERESTS.filter(
      (i) => filledSlots(all.get(i.id)) === CATALOG_SLOTS.length,
    ).length;
    expect(complete).toBeGreaterThanOrEqual(1);
    render(<CatalogScreen />, { wrapper });
    expect(screen.getByText("Katalog")).toBeTruthy();
    expect(
      screen.getByText(
        `${complete} av ${INTERESTS.length} interesser har alle seks`,
      ),
    ).toBeTruthy();
  });
});

describe("the nearby rails", () => {
  it("list only what lies within NEARBY_M, nearest first", () => {
    for (const p of places) {
      const d = nearbyPlaces(p).map((q) => distanceMeters(q.coord, p.coord));
      expect(d.every((m) => m <= NEARBY_M)).toBe(true);
      expect([...d].sort((x, y) => x - y)).toEqual(d);
    }
    for (const x of experiences) {
      const here = x.meetingPoint.coord;
      const d = moreExperiences(x).map((o) =>
        distanceMeters(o.meetingPoint.coord, here),
      );
      expect(d.every((m) => m <= NEARBY_M)).toBe(true);
    }
    // Inner Oslo still has a full rail.
    expect(nearbyPlaces(placeById("p1")!)).toHaveLength(6);
  });
});
