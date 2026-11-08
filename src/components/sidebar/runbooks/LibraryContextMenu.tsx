import { CssClass } from "@/common/constants/css";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  type ContextMenuAnchor,
} from "@/components/common/contextMenu/ContextMenu";
import { TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
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
  const t = useTranslation();
  const clearRunbookLibrary = useStore((state) => state.clearRunbookLibrary);
  const isEmpty = useStore(
    (state) =>
      state.libraryFolders.length === 0 && state.libraryRunbooks.length === 0,
  );

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

      {!isEmpty && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem
            icon={
              <TrashIcon
                className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
              />
            }
            onSelect={() => void clearRunbookLibrary()}
            danger
          >
            {t.runbooks.clearLibraryTitle}
          </ContextMenuItem>
        </>
      )}
    </ContextMenu>
  );
}
