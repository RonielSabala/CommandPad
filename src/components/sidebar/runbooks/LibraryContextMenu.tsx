import {
  ContextMenu,
  ContextMenuSeparator,
  type ContextMenuAnchor,
} from "@/components/common/contextMenu/ContextMenu";
import type { ReactNode } from "react";

import "./LibraryContextMenu.css";
import { LibraryLevelItems } from "./LibraryLevelItems";
import { LibraryNewSubmenu } from "./LibraryNewSubmenu";

interface Props {
  anchor: ContextMenuAnchor;
  folderId?: string;
  levelActions?: boolean;
  onClose: () => void;
  actions?: ReactNode;
  endActions?: ReactNode;
}

export function LibraryContextMenu({
  anchor,
  folderId,
  levelActions,
  onClose,
  actions,
  endActions,
}: Props) {
  return (
    <ContextMenu
      className="library-context-menu"
      anchor={anchor}
      onClose={onClose}
    >
      {actions && (
        <>
          {actions}
          <ContextMenuSeparator />
        </>
      )}

      {levelActions && (
        <>
          <LibraryLevelItems folderId={folderId ?? null} />
          <ContextMenuSeparator />
        </>
      )}

      <LibraryNewSubmenu folderId={folderId} />

      {endActions && (
        <>
          <ContextMenuSeparator />
          {endActions}
        </>
      )}
    </ContextMenu>
  );
}
