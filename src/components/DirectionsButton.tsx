import { Button } from "@/components/ui";
import { showToast } from "@/components/Toast";
import { openDirections } from "@/lib/directions";

/** "Veibeskrivelse" (Phase 16): the route to a place or a meeting point in
 *  the phone's maps app. Sits next to the address it belongs to. */
export function DirectionsButton({
  coord,
  name,
}: {
  coord: readonly [number, number];
  /** Where the route goes (read out to screen readers). */
  name: string;
}) {
  return (
    <Button
      label="Veibeskrivelse"
      variant="outline"
      size="sm"
      rounded="full"
      fullWidth={false}
      accessibilityLabel={`Veibeskrivelse til ${name}`}
      accessibilityHint="Åpner kartappen"
      onPress={() => {
        void openDirections(coord).then((opened) => {
          if (!opened)
            showToast({
              title: "Fikk ikke åpnet kartappen",
              icon: "alert-circle-outline",
            });
        });
      }}
    />
  );
}
