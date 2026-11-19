// Long-press quick actions as the platform's own menu (P10, user 2026-11-16:
// only where apps normally have one, the Chat tab's rows and Lagret). Android
// shows a native popup menu under the row; iOS and web keep ItemActionsSheet
// (react-native-menu has no programmatic open on iOS, and it is unverified
// there). On Android react-native-menu's view takes every touch from its
// children, so the menu sits as a 1 px anchor along the row's bottom edge,
// outside hit testing, and opens from the row's own long press: taps, the
// long-press haptic and the screen reader's "Flere valg" stay the row's.
import { MenuView, type MenuComponentRef } from "@react-native-menu/menu";
import { useEffect, useState, type ReactNode } from "react";
import { Platform, UIManager, View } from "react-native";

import { ItemActionsSheet, type ItemAction } from "./ActionSheets";

// A dev client built before the menu was added has no MenuView: mounting it
// would throw, so such a build keeps the sheet.
const NATIVE_MENU =
  Platform.OS === "android" && UIManager.hasViewManagerConfig("MenuView");

export function ContextMenu({
  title,
  actions,
  children,
}: {
  /** The item's name: the fallback sheet's title. */
  title: string;
  actions: ItemAction[];
  /** The row, given the function that opens its menu. */
  children: (open: () => void) => ReactNode;
}) {
  // Android builds its PopupMenu when the view mounts, so a row mounts the
  // anchor only on its first long press (a long chat list builds none up
  // front), then keeps it for later presses.
  const [armed, setArmed] = useState(false);
  // The menu as state (a callback ref), so opening it reads no ref in render.
  const [menu, setMenu] = useState<MenuComponentRef | null>(null);
  const [sheet, setSheet] = useState(false);
  const openSheet = () => setSheet(true);
  // A popup shown before its anchor is laid out opens in the screen's
  // top-left corner, so the first press waits for the anchor's layout.
  const [placed, setPlaced] = useState(false);
  const openMenu = () => (menu && placed ? menu.show() : setArmed(true));
  // The view mounts only after a press arms it, so a menu that is placed for
  // the first time means that first press: open it then.
  useEffect(() => {
    if (placed) menu?.show();
  }, [menu, placed]);

  return (
    <>
      {NATIVE_MENU ? (
        <View>
          {children(openMenu)}
          {armed ? (
            <View
              onLayout={() => setPlaced(true)}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 1,
              }}
            >
              <MenuView
                ref={setMenu}
                style={{ flex: 1 }}
                actions={actions.map((a, i) => ({
                  id: String(i),
                  title: a.label,
                }))}
                onPressAction={({ nativeEvent }) =>
                  actions[Number(nativeEvent.event)]?.onPress()
                }
              />
            </View>
          ) : null}
        </View>
      ) : (
        children(openSheet)
      )}
      {sheet ? (
        <ItemActionsSheet
          title={title}
          actions={actions}
          onClose={() => setSheet(false)}
        />
      ) : null}
    </>
  );
}
