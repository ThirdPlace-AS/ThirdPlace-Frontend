import { experienceById } from "@/fixtures";
import { goingFor, useShowMeAsAttendee, type Going } from "@/lib/going";

import { useExperienceJoin } from "./useExperienceJoin";

/** Who is going right now: the fixtures plus the viewer's own join (and
 *  face, if they opted in), so cards agree with the page once you join. */
export function useGoing(expId: string): Going & { left: number } {
  const exp = experienceById(expId);
  const [user] = useExperienceJoin(
    expId,
    exp?.status === "joined" ? "joined" : "none",
  );
  const showMe = useShowMeAsAttendee();
  const going = goingFor(expId, { joined: user === "joined", showMe });
  return {
    ...going,
    left: exp ? Math.max(0, exp.capacity - going.count) : 0,
  };
}
