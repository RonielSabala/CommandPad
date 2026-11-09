import { AppMode } from "@/common/enums";
import { ContextMenuSeparator } from "@/components/common/contextMenu/ContextMenu";
import { useStore } from "@/store/store";
import type { ReactNode } from "react";

import { LibraryLevelItems } from "./LibraryLevelItems";
import { LibraryNewSubmenu } from "./LibraryNewSubmenu";

export interface LibraryMenuItemsProps {
  folderId?: string;
  levelActions?: boolean;
  /** Edits, offered first. */
  actions?: ReactNode;
  /** What leaves the library as it is. */
  readActions: ReactNode;
  /** Edits, offered last. */
  endActions?: ReactNode;
}

export function LibraryMenuItems({
  folderId,
  levelActions,
  actions,
  readActions,
  endActions,
}: LibraryMenuItemsProps) {
  const isReadMode = useStore((state) => state.mode === AppMode.READ);

  return (
    <>
      {!isReadMode && actions && (
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

      {!isReadMode && (
        <>
          <LibraryNewSubmenu folderId={folderId} />
          <ContextMenuSeparator />
        </>
      )}

      {readActions}

      {!isReadMode && endActions && (
        <>
          <ContextMenuSeparator />
          {endActions}
        </>
      )}
    </>
  );
}
