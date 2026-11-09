import { ContextMenuSeparator } from "@/components/common/contextMenu/ContextMenu";
import type { ReactNode } from "react";

import { LibraryLevelItems } from "./LibraryLevelItems";
import { LibraryNewSubmenu } from "./LibraryNewSubmenu";

export interface LibraryMenuItemsProps {
  folderId?: string;
  levelActions?: boolean;
  actions?: ReactNode;
  endActions?: ReactNode;
}

export function LibraryMenuItems({
  folderId,
  levelActions,
  actions,
  endActions,
}: LibraryMenuItemsProps) {
  return (
    <>
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
    </>
  );
}
