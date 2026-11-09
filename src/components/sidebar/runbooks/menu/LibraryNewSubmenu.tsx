import { CssClass, STANDARD_ICON_CLASS } from "@/common/constants/css";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import { PlusIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { FileEarmark, Folder } from "react-bootstrap-icons";

interface Props {
  folderId?: string;
}

export function LibraryNewSubmenu({ folderId }: Props) {
  const t = useTranslation();
  const createNewTab = useStore((state) => state.createNewTab);
  const createLibraryFolder = useStore((state) => state.createLibraryFolder);

  return (
    <ContextMenuSubmenu
      icon={<PlusIcon className={STANDARD_ICON_CLASS} />}
      label={t.runbooks.new}
    >
      <ContextMenuItem
        icon={<Folder className={CssClass.ICON_MD} />}
        onSelect={() => createLibraryFolder(folderId ?? null)}
      >
        {t.runbooks.newFolderItem}
      </ContextMenuItem>

      <ContextMenuItem
        icon={<FileEarmark className={CssClass.ICON_MD} />}
        onSelect={() => void createNewTab(folderId)}
      >
        {t.runbooks.newRunbookItem}
      </ContextMenuItem>
    </ContextMenuSubmenu>
  );
}
