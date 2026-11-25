import { GuestPage } from "@/components/GuestPage";
import EditProfileScreen from "@/features/profile/EditProfileScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Rediger profil"
      message="Logg inn for å redigere profilen."
      action="redigere profilen"
    >
      <EditProfileScreen />
    </GuestPage>
  );
}
