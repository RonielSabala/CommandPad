import { CssClass } from "@/common/constants/css";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { SortMenuItems } from "@/components/common/contextMenu/SortMenuItems";
import { useTranslation } from "@/i18n";
import { hasLibraryFolderToSort, useStore } from "@/store/store";
import { collapsesSubtree } from "@/utils/libraryTree";
import { ChevronBarContract, ChevronBarExpand } from "react-bootstrap-icons";

interface Props {
  folderId: string | null;
}

function SubtreeToggleItem({ folderId }: Props) {
  const t = useTranslation();
  const folders = useStore((state) => state.libraryFolders);
  const toggleLibrarySubtree = useStore((state) => state.toggleLibrarySubtree);

  const collapses = collapsesSubtree(folders, folderId);
  const Icon = collapses ? ChevronBarContract : ChevronBarExpand;

  return (
    <ContextMenuItem
      icon={<Icon className={CssClass.ICON_MD} />}
      onSelect={() => toggleLibrarySubtree(folderId)}
      disabled={folderId === null && folders.length === 0}
    >
      {collapses ? t.runbooks.collapseAll : t.runbooks.expandAll}
    </ContextMenuItem>
  );
}

/** What a folder's menu offers over its contents. */
export function LibraryLevelItems({ folderId }: Props) {
  const t = useTranslation();
  const sortLibraryFolder = useStore((state) => state.sortLibraryFolder);

  return (
    <>
      <SortMenuItems
        labels={t.runbooks.sortContents}
        canSort={(state, direction) =>
          hasLibraryFolderToSort(state, folderId, direction)
        }
        onSort={(direction) => sortLibraryFolder(folderId, direction)}
      />

      <SubtreeToggleItem folderId={folderId} />
    </>
  );
}
