import { LibraryFolderConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { LibraryDropZone, LibraryItemKind } from "@/common/enums";
import type { LibraryFolder } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import { InfoMenuItem } from "@/components/common/info/InfoMenuItem";
import { useInfoTooltip } from "@/components/common/info/useInfoTooltip";
import { RenameInput } from "@/components/common/RenameInput";
import { NO_TOOLTIP, tooltip } from "@/components/common/tooltip/tooltip";
import {
  EditorToggleChevronIcon,
  FolderOpenFillIcon,
  TrashIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { libraryDropZone } from "@/utils/libraryTree";
import { classNames } from "@/utils/string";
import { memo, useEffect, useState } from "react";
import { FolderFill, Vr } from "react-bootstrap-icons";

import { LibraryContextMenu } from "./LibraryContextMenu";
import { libraryDepthStyle } from "./libraryDepth";
import { LibraryDownloadItem } from "./LibraryDownloadItem";
import "./LibraryFolderRow.css";
import { LibraryMenuItems } from "./LibraryMenuItems";
import { FolderProperties } from "./LibraryProperties";
import "./LibraryRow.css";
import { useLibraryRowDrag } from "./useLibraryRowDrag";
import { useLibraryRowMenu } from "./useLibraryRowMenu";

interface Props {
  folder: LibraryFolder;
  depth: number;
  empty: boolean;
}

export const LibraryFolderRow = memo(function LibraryFolderRow({
  folder,
  depth,
  empty,
}: Props) {
  const t = useTranslation();
  const folderId = folder.id;
  const FolderIcon = folder.collapsed ? FolderFill : FolderOpenFillIcon;
  const showsContents = !folder.collapsed && !empty;

  const removeLibraryFolder = useStore((state) => state.removeLibraryFolder);
  const renameLibraryFolder = useStore((state) => state.renameLibraryFolder);
  const toggleLibraryFolder = useStore((state) => state.toggleLibraryFolder);

  // A folder just created opens with its name ready to type over
  const renamePending = useStore(
    (state) => state.pendingLibraryFolderRenameId === folderId,
  );
  const consumeLibraryFolderRename = useStore(
    (state) => state.consumeLibraryFolderRename,
  );
  const [renaming, setRenaming] = useState(false);

  const info = useInfoTooltip();
  const { menuAnchor, onContextMenu, closeMenu } = useLibraryRowMenu();
  const { isDragging, dropZone, dropClassName, handleProps, rowProps } =
    useLibraryRowDrag(folderId, (sourceKind, fraction) =>
      libraryDropZone(
        sourceKind,
        LibraryItemKind.FOLDER,
        showsContents,
        fraction,
      ),
    );

  // Holding a drag over a folded folder opens it
  const opensUnderDrag =
    dropZone === LibraryDropZone.INTO && !empty && folder.collapsed === true;

  useEffect(() => {
    if (!opensUnderDrag) {
      return;
    }

    const timer = setTimeout(
      () => toggleLibraryFolder(folderId),
      LibraryFolderConfig.DRAG_EXPAND_DELAY_MS,
    );

    return () => clearTimeout(timer);
  }, [opensUnderDrag, folderId, toggleLibraryFolder]);

  const stopRenaming = () => {
    setRenaming(false);
    if (renamePending) {
      consumeLibraryFolderRename();
    }
  };

  const menuItems = {
    folderId,
    levelActions: true,
    actions: (
      <ContextMenuItem
        icon={<Vr className={CssClass.ICON_MD} />}
        onSelect={() => setRenaming(true)}
      >
        {t.runbooks.rename}
      </ContextMenuItem>
    ),
    endActions: (
      <>
        <LibraryDownloadItem folderId={folderId} disabled={empty} />

        <InfoMenuItem label={t.info.properties} onSelect={info.open} />
        <ContextMenuSeparator />

        <ContextMenuItem
          icon={
            <TrashIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => void removeLibraryFolder(folderId)}
          danger
        >
          {t.runbooks.deleteFolder}
        </ContextMenuItem>
      </>
    ),
  };

  return (
    <div
      className={classNames(
        dropClassName,
        CssClass.LIBRARY_ROW,
        CssClass.SIDEBAR_SECTION_LIST_ROW,
        isDragging && CssClass.DRAGGING,
        menuAnchor && CssClass.MENU_OPEN,
      )}
      style={libraryDepthStyle(depth)}
      {...rowProps}
      onContextMenu={onContextMenu}
    >
      <DragImage icon={<FolderIcon className={CssClass.ICON_MD} />}>
        {folder.name}
      </DragImage>

      <DragHandle handleProps={handleProps} />

      <div className={CssClass.LIBRARY_ROW_MAIN}>
        {renaming || renamePending ? (
          <RenameInput
            className={classNames(
              CssClass.LIBRARY_ROW_LABEL,
              CssClass.LIBRARY_ROW_RENAME_INPUT,
            )}
            value={folder.name}
            maxLength={LibraryFolderConfig.NAME_MAX_LENGTH}
            onCommit={(name) => {
              renameLibraryFolder(folderId, name);
              stopRenaming();
            }}
            onCancel={stopRenaming}
          />
        ) : (
          <button
            className={classNames(
              "library-folder-btn",
              empty && "library-folder-empty",
              folder.collapsed && CssClass.COLLAPSED,
              CssClass.LIBRARY_ROW_BTN,
              CssClass.LIBRARY_ROW_LABEL,
              CssClass.NO_USER_SELECT,
            )}
            aria-expanded={empty ? undefined : !folder.collapsed}
            onClick={() => toggleLibraryFolder(folderId)}
            {...tooltip(folder.name)}
          >
            <span
              className="library-folder-chevron-zone"
              onClick={empty ? (event) => event.stopPropagation() : undefined}
              {...NO_TOOLTIP}
            >
              <EditorToggleChevronIcon
                className={classNames(
                  "library-folder-chevron",
                  CssClass.ICON_SM,
                  CssClass.ICON_BOLD,
                )}
              />
            </span>

            <FolderIcon
              className={classNames(
                CssClass.ICON_MD,
                CssClass.LIBRARY_ROW_ICON,
              )}
            />

            <span className={CssClass.LIBRARY_ROW_NAME}>{folder.name}</span>
          </button>
        )}
      </div>

      <ActionsMenu
        className={classNames(CssClass.ROW_ACTIONS, info.menuClassName)}
        title={t.runbooks.folderActions}
        triggerRef={info.triggerRef}
      >
        <LibraryMenuItems {...menuItems} />
      </ActionsMenu>

      {menuAnchor && (
        <LibraryContextMenu
          anchor={menuAnchor}
          onClose={closeMenu}
          {...menuItems}
        />
      )}

      {info.render(() => (
        <FolderProperties folderId={folderId} />
      ))}
    </div>
  );
});
