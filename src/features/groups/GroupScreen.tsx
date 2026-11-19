// Group page (/group/[id]), Phase 12 H4c: a group opened from an experience,
// a deep link or (H5b) the new-group flow is a page with a real back.
import { useLocalSearchParams } from "expo-router";

import { GroupContent } from "@/components/map/content/GroupContent";
import { groupById } from "@/fixtures";
import { EntityPage } from "@/features/entity/EntityPage";

export default function GroupScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const group = groupById(id);
  return (
    <EntityPage
      title={group?.name ?? "Gruppe"}
      missing={group ? undefined : "Fant ikke gruppen"}
    >
      {() => <GroupContent id={id} />}
    </EntityPage>
  );
}
