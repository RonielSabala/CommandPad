import { PANEL_DEFINITIONS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { Cursor, HtmlTag } from "@/common/constants/dom";
import { EventType, MouseButton } from "@/common/constants/events";
import { PanelId, PanelSide } from "@/common/enums";
import { useStoreActions, useStoreApi } from "@/store/store";
import {
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

export function usePanelResize(
  panelId: PanelId,
  panelRef: RefObject<HTMLElement | null>,
) {
  const store = useStoreApi();
  const { setPanelWidth, togglePanel, resetPanelWidth } = useStoreActions();

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Ignore action buttons riding on the handle
      if (
        event.button !== MouseButton.LEFT ||
        (event.target as HTMLElement).closest(HtmlTag.BUTTON)
      ) {
        return;
      }

      event.preventDefault();

      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const { side, width: startWidth } = store.getState().panels[panelId];
      const isRight = side === PanelSide.RIGHT;
      const rect = panel.getBoundingClientRect();

      document.body.classList.add(CssClass.PANEL_RESIZING);
      document.body.style.cursor = Cursor.COL_RESIZE;

      const onMove = (moveEvent: PointerEvent) => {
        const width = isRight
          ? rect.right - moveEvent.clientX
          : moveEvent.clientX - rect.left;

        setPanelWidth(panelId, width, startWidth);
      };

      const onUp = () => {
        document.body.classList.remove(CssClass.PANEL_RESIZING);
        document.body.style.cursor = Cursor.DEFAULT;
        window.removeEventListener(EventType.POINTER_MOVE, onMove);
        window.removeEventListener(EventType.POINTER_UP, onUp);
      };

      window.addEventListener(EventType.POINTER_MOVE, onMove);
      window.addEventListener(EventType.POINTER_UP, onUp);
    },
    [panelId, panelRef, setPanelWidth, store],
  );

  const onDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest(HtmlTag.BUTTON)) {
        return;
      }

      event.preventDefault();

      // A panel dragged wider snaps back to its default before it collapses
      const { collapsed, width } = store.getState().panels[panelId];
      if (!collapsed && width > PANEL_DEFINITIONS[panelId].defaultWidth) {
        resetPanelWidth(panelId);
        return;
      }

      togglePanel(panelId);
    },
    [panelId, resetPanelWidth, store, togglePanel],
  );

  return { onPointerDown, onDoubleClick };
}
