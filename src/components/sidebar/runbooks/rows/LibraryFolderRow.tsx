import { LibraryFolderConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { AppMode, LibraryDropZone, LibraryItemKind } from "@/common/enums";
import type { LibraryFolder } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { DeleteMenuItem } from "@/components/common/contextMenu/DeleteMenuItem";
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import { InfoMenuItem } from "@/components/common/info/InfoMenuItem";
import { useInfoTooltip } from "@/components/common/info/useInfoTooltip";
import { NO_TOOLTIP, tooltip } from "@/components/common/tooltip/tooltip";
import {
  EditorToggleChevronIcon,
  FolderOpenFillIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { libraryDropZone } from "@/utils/libraryTree";
import { classNames } from "@/utils/string";
import { memo, useEffect, useState } from "react";
import { FolderFill, Vr } from "react-bootstrap-icons";

import { LibraryContextMenu } from "../menu/LibraryContextMenu";
import { LibraryDownloadItem } from "../menu/LibraryDownloadItem";
import { LibraryMenuItems } from "../menu/LibraryMenuItems";
import { FolderProperties } from "../menu/LibraryProperties";

import { libraryDepthStyle } from "./libraryDepth";
import "./LibraryFolderRow.css";
import "./LibraryRow.css";
import { LibraryRowLabel } from "./LibraryRowLabel";
import { renameOnBlank } from "./renameOnBlank";
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
  const readMode = useStore((state) => state.mode === AppMode.READ);

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
    readActions: (
      <>
        <LibraryDownloadItem folderId={folderId} disabled={empty} />
        <InfoMenuItem label={t.info.properties} onSelect={info.open} />
      </>
    ),
    endActions: (
      <DeleteMenuItem onSelect={() => void removeLibraryFolder(folderId)}>
        {t.runbooks.deleteFolder}
      </DeleteMenuItem>
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

      <div
        className={CssClass.LIBRARY_ROW_MAIN}
        onDoubleClick={renameOnBlank(readMode, () => setRenaming(true))}
      >
        <LibraryRowLabel
          className={classNames(
            "library-folder-btn",
            empty && "library-folder-empty",
            folder.collapsed && CssClass.COLLAPSED,
          )}
          leading={
            <>
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
            </>
          }
          name={folder.name}
          renaming={renaming || renamePending}
          maxLength={LibraryFolderConfig.NAME_MAX_LENGTH}
          onRename={(name) => renameLibraryFolder(folderId, name)}
          onRenameEnd={stopRenaming}
          aria-expanded={empty ? undefined : !folder.collapsed}
          onClick={() => toggleLibraryFolder(folderId)}
          {...tooltip(folder.name)}
        />
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
