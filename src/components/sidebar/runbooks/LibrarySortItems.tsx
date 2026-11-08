import { SortMenuItems } from "@/components/common/contextMenu/SortMenuItems";
import { useTranslation } from "@/i18n";
import { hasLibraryFolderToSort, useStore } from "@/store/store";

interface Props {
  folderId: string | null;
}

export function LibrarySortItems({ folderId }: Props) {
  const t = useTranslation();
  const sortLibraryFolder = useStore((state) => state.sortLibraryFolder);

  return (
    <SortMenuItems
      labels={t.runbooks.sortContents}
      canSort={(state, direction) =>
        hasLibraryFolderToSort(state, folderId, direction)
      }
      onSort={(direction) => sortLibraryFolder(folderId, direction)}
    />
  );
}
