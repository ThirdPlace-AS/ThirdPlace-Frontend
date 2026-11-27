// Filtrer for Varsler (user 2026-11-27, 0561, Instagram's notification
// filter): Kategorier (the kinds of notice) and Kontotyper (people you follow,
// verified accounts), Tøm to clear and Bruk to apply side by side. The picks
// stay a draft until Bruk. "Merk alle lest" sits here too (user 2026-11-27):
// it acts at once and closes the sheet.
import { useState } from "react";
import { View } from "react-native";

import { CheckboxRow } from "@/components/CheckboxRow";
import { Button, Sheet, Text } from "@/components/ui";
import type { NotificationType } from "@/fixtures";

import {
  NO_NOTIFICATION_FILTER,
  NOTIFICATION_CATEGORIES,
  isNotificationFilterOn,
  type NotificationFilter,
} from "./notificationFilters";

export function NotificationFilterSheet({
  value,
  onApply,
  onClose,
  unread,
  onMarkAllRead,
}: {
  value: NotificationFilter;
  onApply: (next: NotificationFilter) => void;
  onClose: () => void;
  /** Unread notices; Merk alle lest is off at 0. */
  unread: number;
  onMarkAllRead: () => void;
}) {
  const [draft, setDraft] = useState<NotificationFilter>(value);
  const toggleType = (t: NotificationType) =>
    setDraft((d) => {
      const types = new Set(d.types);
      if (types.has(t)) types.delete(t);
      else types.add(t);
      return { ...d, types };
    });
  const on = isNotificationFilterOn(draft);
  return (
    <Sheet visible onClose={onClose} title="Filtrer">
      <View className="gap-6">
        <Button
          label="Merk alle lest"
          icon="checkmark-done-outline"
          variant="secondary"
          disabled={unread === 0}
          onPress={() => {
            onMarkAllRead();
            onClose();
          }}
        />
        <View>
          <Text variant="body" weight="semibold" accessibilityRole="header">
            Kategorier
          </Text>
          {NOTIFICATION_CATEGORIES.map((c) => (
            <CheckboxRow
              key={c.type}
              label={c.label}
              checked={draft.types.has(c.type)}
              onToggle={() => toggleType(c.type)}
            />
          ))}
        </View>
        <View>
          <Text variant="body" weight="semibold" accessibilityRole="header">
            Kontotyper
          </Text>
          <CheckboxRow
            label="Personer du følger"
            checked={draft.onlyFollowing}
            onToggle={() =>
              setDraft((d) => ({ ...d, onlyFollowing: !d.onlyFollowing }))
            }
          />
          <CheckboxRow
            label="Verifisert"
            checked={draft.onlyVerified}
            onToggle={() =>
              setDraft((d) => ({ ...d, onlyVerified: !d.onlyVerified }))
            }
          />
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Tøm"
              variant="secondary"
              disabled={!on}
              onPress={() => setDraft(NO_NOTIFICATION_FILTER)}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Bruk"
              variant="ink"
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Sheet>
  );
}
