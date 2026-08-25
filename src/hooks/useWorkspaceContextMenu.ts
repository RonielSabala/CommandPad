import { CssClass } from "@/common/constants/css";
import { InputSelector } from "@/common/constants/dom";
import type { ContextMenuAnchor } from "@/components/common/contextMenu/ContextMenu";
import { useState, type MouseEvent } from "react";

export function useWorkspaceContextMenu(itemClass: string) {
  const [menuAnchor, setMenuAnchor] = useState<ContextMenuAnchor | null>(null);

  const onContextMenu = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.closest(InputSelector.EDITABLE) ||
      target.closest(`.${itemClass}`)
    ) {
      return;
    }

    event.preventDefault();

    // Right-clicking the open menu just closes it
    if (target.closest(`.${CssClass.CONTEXT_MENU}`)) {
      setMenuAnchor(null);
      return;
    }

    setMenuAnchor({ x: event.clientX, y: event.clientY });
  };

  return { menuAnchor, onContextMenu, closeMenu: () => setMenuAnchor(null) };
}
