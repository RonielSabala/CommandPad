import {
  ContextMenu,
  ContextMenuSeparator,
  type ContextMenuAnchor,
} from "@/components/common/contextMenu/ContextMenu";
import type { ReactNode } from "react";

import "./LibraryContextMenu.css";
import { LibraryNewSubmenu } from "./LibraryNewSubmenu";
import { LibrarySortItems } from "./LibrarySortItems";

interface Props {
  anchor: ContextMenuAnchor;
  folderId?: string;
  sortable?: boolean;
  onClose: () => void;
  actions?: ReactNode;
  endActions?: ReactNode;
}

export function LibraryContextMenu({
  anchor,
  folderId,
  sortable,
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

      <LibraryNewSubmenu folderId={folderId} />

      {sortable && <LibrarySortItems folderId={folderId ?? null} />}

      {endActions && (
        <>
          <ContextMenuSeparator />
          {endActions}
        </>
      )}
    </ContextMenu>
  );
}
