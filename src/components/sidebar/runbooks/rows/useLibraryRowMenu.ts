import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import type { MouseEvent } from "react";

/** A library row's right-click menu. */
export function useLibraryRowMenu() {
  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu();

  const onRowContextMenu = (event: MouseEvent) => {
    event.stopPropagation();
    onContextMenu(event);
  };

  return { menuAnchor, onContextMenu: onRowContextMenu, closeMenu };
}
