import { LibraryFolderConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import type { LibraryFolder } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { RenameInput } from "@/components/common/RenameInput";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  EditorToggleChevronIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useState } from "react";
import { FileEarmarkPlus, FolderFill, FolderPlus } from "react-bootstrap-icons";

import { libraryDepthStyle } from "./libraryDepth";
import "./LibraryFolderRow.css";
import "./LibraryRow.css";

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

  const createNewTab = useStore((state) => state.createNewTab);
  const createLibraryFolder = useStore((state) => state.createLibraryFolder);
  const removeLibraryFolder = useStore((state) => state.removeLibraryFolder);
  const renameLibraryFolder = useStore((state) => state.renameLibraryFolder);
  const toggleLibraryFolder = useStore((state) => state.toggleLibraryFolder);

  // A folder just created opens with its name ready to type over
  const renamePending = useStore(
    (state) => state.pendingFolderRenameId === folderId,
  );
  const consumeFolderRename = useStore((state) => state.consumeFolderRename);
  const [renaming, setRenaming] = useState(false);

  const stopRenaming = () => {
    setRenaming(false);
    if (renamePending) {
      consumeFolderRename();
    }
  };

  return (
    <div
      className={classNames(
        CssClass.LIBRARY_ROW,
        CssClass.SIDEBAR_SECTION_LIST_ROW,
      )}
      style={libraryDepthStyle(depth)}
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
            <EditorToggleChevronIcon
              className={classNames(
                "library-folder-chevron",
                CssClass.ICON_SM,
                CssClass.ICON_BOLD,
              )}
            />

            <FolderFill
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
        className={CssClass.ROW_ACTIONS}
        title={t.runbooks.folderActions}
      >
        <ContextMenuItem
          icon={<FileEarmarkPlus className={CssClass.ICON_MD} />}
          onSelect={() => void createNewTab(folderId)}
        >
          {t.runbooks.newRunbook}
        </ContextMenuItem>

        <ContextMenuItem
          icon={<FolderPlus className={CssClass.ICON_MD} />}
          onSelect={() => createLibraryFolder(folderId)}
        >
          {t.runbooks.newFolder}
        </ContextMenuItem>

        <ContextMenuItem
          icon={
            <PencilIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => setRenaming(true)}
        >
          {t.runbooks.rename}
        </ContextMenuItem>

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
      </ActionsMenu>
    </div>
  );
});
