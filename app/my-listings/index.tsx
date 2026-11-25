import { GuestPage } from "@/components/GuestPage";
import MyListingsScreen from "@/features/marketplace/MyListingsScreen";

// Account-only (founder 2026-11-19 Q1: guests browse only): a guest sees
// the lock and Logg inn, which returns here once signed in.
export default function Route() {
  return (
    <GuestPage
      title="Mine listings"
      message="Logg inn for å se listingene dine."
      action="se listingene dine"
    >
      <MyListingsScreen />
    </GuestPage>
  );
}
