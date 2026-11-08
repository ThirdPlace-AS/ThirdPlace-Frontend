import { Redirect, useLocalSearchParams } from "expo-router";

import { joinHref } from "@/lib/entityRoutes";

import NotFoundScreen from "./NotFoundScreen";

// thirdplace://join/<slug> (Phase 15): a shared chat invite link
// (ChatInfoScreens "Del invitasjonslenke") or the PDF p26 invite page's
// experience link. Opens that chat or experience; anything else is "Fant
// ikke siden". Only the app scheme is wired: https://thirdplace.app links
// need the domain and app-link files (LAUNCH_CHECKLIST).
export default function JoinLinkScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const href = slug ? joinHref(slug) : null;
  return href ? <Redirect href={href} /> : <NotFoundScreen />;
}
