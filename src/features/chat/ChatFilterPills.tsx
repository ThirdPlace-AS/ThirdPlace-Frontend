// The pill row under the Chat search (0459): the shared `FilterPills` row
// (extracted in 0460, Varsler uses the same one) over the chat filters.
import { FilterPills } from "@/components/ui";

import type { ChatFilter, ChatFilterKey } from "./chatFilters";

export function ChatFilterPills({
  pills,
  value,
  onChange,
}: {
  pills: readonly ChatFilter[];
  value: ChatFilterKey;
  onChange: (key: ChatFilterKey) => void;
}) {
  return <FilterPills pills={pills} value={value} onChange={onChange} />;
}
