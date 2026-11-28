import { Redirect, useLocalSearchParams, type Href } from "expo-router";

// One page per person (review 2026-11-18 PR-10, 0528): a host's profile is
// their person page, with what they host under «Arrangerer». This route
// stays for old links and sends them there.
export default function CreatorRedirect() {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  return <Redirect href={`/people/${id}` as Href} />;
}
