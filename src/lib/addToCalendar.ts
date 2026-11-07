// "Legg til i kalender" (Phase 16, founder: build it, after the section
// benchmark). Opens the phone's own calendar app with the event filled in;
// the user saves it there. The app never reads or writes the calendar itself,
// so it asks for no calendar permission (the Android calendar permissions are
// blocked in app.json). Uses expo-calendar's system-UI call, which lives in
// "expo-calendar/legacy" since SDK 57: the new object API needs a calendar
// handle, and with it a permission.
//
// Loaded lazily and guarded, like expo-location (src/lib/haptics.ts): a dev
// client built before Phase 16 has no native module, and then this reports
// "unavailable" instead of crashing.
import type { MockExperience, MockSession } from "@/fixtures";

export type CalendarEvent = {
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  notes: string;
};

type CalendarModule = {
  createEventInCalendarAsync(
    data: Partial<CalendarEvent>,
  ): Promise<{ action: string }>;
};

let calendarModule: CalendarModule | null | undefined;

function loadCalendar(): CalendarModule | null {
  if (calendarModule !== undefined) return calendarModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("expo-calendar/legacy") as Partial<CalendarModule>;
    calendarModule =
      typeof mod?.createEventInCalendarAsync === "function"
        ? (mod as CalendarModule)
        : null;
  } catch {
    calendarModule = null;
  }
  return calendarModule;
}

/** The event for one time of an experience: where to meet and the link. */
export function calendarEventFor(
  exp: Pick<MockExperience, "id" | "title" | "about" | "meetingPoint">,
  session: Pick<MockSession, "start" | "end">,
): CalendarEvent {
  return {
    title: exp.title,
    startDate: session.start,
    endDate: session.end,
    location: `${exp.meetingPoint.name}, ${exp.meetingPoint.address}`,
    notes: `${exp.about}\n\nthirdplace.app/experience/${exp.id}`,
  };
}

/** Opens the calendar app with the event; "unavailable" when it cannot. */
export async function addToCalendar(
  event: CalendarEvent,
): Promise<"opened" | "unavailable"> {
  const calendar = loadCalendar();
  if (!calendar) return "unavailable";
  try {
    await calendar.createEventInCalendarAsync(event);
    return "opened";
  } catch {
    return "unavailable";
  }
}

/** Tests: load the module again. */
export function resetCalendarModule() {
  calendarModule = undefined;
}
