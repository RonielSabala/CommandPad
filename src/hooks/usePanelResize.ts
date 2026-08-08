import { PANEL_DEFINITIONS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { Cursor } from "@/common/constants/dom";
import { EventType, MouseButton } from "@/common/constants/events";
import { PanelId, PanelSide } from "@/common/enums";
import { useStore, useStoreApi } from "@/store/store";
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
  const setPanelWidth = useStore((state) => state.setPanelWidth);
  const togglePanel = useStore((state) => state.togglePanel);
  const resetPanelWidth = useStore((state) => state.resetPanelWidth);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Ignore action buttons riding on the handle
      if (
        event.button !== MouseButton.LEFT ||
        (event.target as HTMLElement).closest("button")
      ) {
        return;
      }

      event.preventDefault();

      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const rect = panel.getBoundingClientRect();
      const isRight = store.getState().panels[panelId].side === PanelSide.RIGHT;

      document.body.classList.add(CssClass.PANEL_RESIZING);
      document.body.style.cursor = Cursor.COL_RESIZE;

      const onMove = (moveEvent: PointerEvent) => {
        const width = isRight
          ? rect.right - moveEvent.clientX
          : moveEvent.clientX - rect.left;

        setPanelWidth(panelId, width);
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
      if ((event.target as HTMLElement).closest("button")) {
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
