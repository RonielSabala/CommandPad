import { SidebarWidth } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { Cursor } from "@/common/constants/dom";
import { EventType, MouseButton } from "@/common/constants/events";
import { SidebarPosition } from "@/common/enums";
import { useStore } from "@/store/store";
import {
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export function useSidebarResize() {
  const setSidebarSize = useStore((state) => state.setSidebarSize);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const resetSidebarSize = useStore((state) => state.resetSidebarSize);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Ignore secondary buttons
      if (
        event.button !== MouseButton.LEFT ||
        (event.target as HTMLElement).closest("button")
      ) {
        return;
      }

      event.preventDefault();

      const sidebar = event.currentTarget.closest("aside");
      if (!sidebar) {
        return;
      }

      const rect = sidebar.getBoundingClientRect();
      const isRight =
        useStore.getState().sidebarPosition === SidebarPosition.RIGHT;

      document.body.classList.add(CssClass.SIDEBAR_RESIZING);
      document.body.style.cursor = Cursor.COL_RESIZE;

      const onMove = (moveEvent: PointerEvent) => {
        const width = isRight
          ? rect.right - moveEvent.clientX
          : moveEvent.clientX - rect.left;

        setSidebarSize(width);
      };

      const onUp = () => {
        document.body.classList.remove(CssClass.SIDEBAR_RESIZING);
        document.body.style.cursor = Cursor.DEFAULT;
        window.removeEventListener(EventType.POINTER_MOVE, onMove);
        window.removeEventListener(EventType.POINTER_UP, onUp);
      };

      window.addEventListener(EventType.POINTER_MOVE, onMove);
      window.addEventListener(EventType.POINTER_UP, onUp);
    },
    [setSidebarSize],
  );

  const onDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }

      event.preventDefault();

      const { sidebarCollapsed, sidebarWidth } = useStore.getState();
      if (!sidebarCollapsed && sidebarWidth > SidebarWidth.DEFAULT) {
        resetSidebarSize();
        return;
      }

      toggleSidebar();
    },
    [toggleSidebar, resetSidebarSize],
  );

  return { onPointerDown, onDoubleClick };
}
