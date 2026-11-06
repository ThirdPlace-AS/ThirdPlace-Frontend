import PeopleScreen from "@/features/people/PeopleScreen";

// People discovery route. Reached from Profile. Detail is a sheet, not a
// route, per the app's "detail = sheet" architecture. No social-graph backend.
export default function People() {
  return <PeopleScreen />;
}
