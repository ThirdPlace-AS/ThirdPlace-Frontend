import PeopleScreen from "@/features/people/PeopleScreen";

// People discovery route. Reached from Profile; a person opens as a page
// (/people/[id]). No social-graph backend.
export default function People() {
  return <PeopleScreen />;
}
