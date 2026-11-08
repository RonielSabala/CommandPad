import { AppMode } from "@/common/enums";
import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import { useStore } from "@/store/store";
import type { MouseEvent } from "react";

/** A library row's right-click menu. */
export function useLibraryRowMenu() {
  const isReadMode = useStore((state) => state.mode === AppMode.READ);
  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu();

  const onRowContextMenu = (event: MouseEvent) => {
    event.stopPropagation();
    onContextMenu(event);
  };

  return {
    menuAnchor: isReadMode ? null : menuAnchor,
    onContextMenu: isReadMode ? undefined : onRowContextMenu,
    closeMenu,
  };
}
