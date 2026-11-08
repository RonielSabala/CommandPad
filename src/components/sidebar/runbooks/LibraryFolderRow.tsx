import { LibraryFolderConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import type { LibraryFolder } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
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
import { classNames } from "@/utils/string";
import { memo, useState } from "react";
import { FolderFill, Vr } from "react-bootstrap-icons";

import { LibraryContextMenu } from "./LibraryContextMenu";
import { libraryDepthStyle } from "./libraryDepth";
import "./LibraryFolderRow.css";
import { LibraryNewSubmenu } from "./LibraryNewSubmenu";
import { FolderProperties } from "./LibraryProperties";
import "./LibraryRow.css";
import { useLibraryRowMenu } from "./useLibraryRowMenu";

interface Props {
  folder: LibraryFolder;
  depth: number;
}

export const LibraryFolderRow = memo(function LibraryFolderRow({
  folder,
  depth,
}: Props) {
  const t = useTranslation();
  const folderId = folder.id;
  const FolderIcon = folder.collapsed ? FolderFill : FolderOpenFillIcon;

  const removeLibraryFolder = useStore((state) => state.removeLibraryFolder);
  const renameLibraryFolder = useStore((state) => state.renameLibraryFolder);
  const toggleLibraryFolder = useStore((state) => state.toggleLibraryFolder);

  // A folder just created opens with its name ready to type over
  const renamePending = useStore(
    (state) => state.pendingFolderRenameId === folderId,
  );
  const consumeFolderRename = useStore((state) => state.consumeFolderRename);
  const [renaming, setRenaming] = useState(false);

  const info = useInfoTooltip();
  const { menuAnchor, onContextMenu, closeMenu } = useLibraryRowMenu();

  const stopRenaming = () => {
    setRenaming(false);
    if (renamePending) {
      consumeFolderRename();
    }
  };

  const folderActions = (
    <ContextMenuItem
      icon={<Vr className={CssClass.ICON_MD} />}
      onSelect={() => setRenaming(true)}
    >
      {t.runbooks.rename}
    </ContextMenuItem>
  );

  const endActions = (
    <>
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
  );

  return (
    <div
      className={classNames(
        CssClass.LIBRARY_ROW,
        CssClass.SIDEBAR_SECTION_LIST_ROW,
        menuAnchor && CssClass.MENU_OPEN,
      )}
      style={libraryDepthStyle(depth)}
      onContextMenu={onContextMenu}
    >
      <span className="library-row-spacer" />

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
              folder.collapsed && CssClass.COLLAPSED,
              CssClass.LIBRARY_ROW_BTN,
              CssClass.LIBRARY_ROW_LABEL,
              CssClass.NO_USER_SELECT,
            )}
            aria-expanded={!folder.collapsed}
            onClick={() => toggleLibraryFolder(folderId)}
            {...tooltip(folder.name)}
          >
            <span className="library-folder-chevron-zone" {...NO_TOOLTIP}>
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
        {folderActions}
        <ContextMenuSeparator />
        <LibraryNewSubmenu folderId={folderId} />
        <ContextMenuSeparator />
        {endActions}
      </ActionsMenu>

      {menuAnchor && (
        <LibraryContextMenu
          anchor={menuAnchor}
          folderId={folderId}
          onClose={closeMenu}
          actions={folderActions}
          endActions={endActions}
        />
      )}

      {info.render(() => (
        <FolderProperties folderId={folderId} />
      ))}
    </div>
  );
});
