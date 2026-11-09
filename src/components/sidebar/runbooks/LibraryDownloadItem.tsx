import { CssClass } from "@/common/constants/css";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { Download } from "react-bootstrap-icons";

interface Props {
  folderId: string | null;
  disabled: boolean;
}

export function LibraryDownloadItem({ folderId, disabled }: Props) {
  const t = useTranslation();
  const exportLibraryFolder = useStore((state) => state.exportLibraryFolder);

  return (
    <ContextMenuItem
      icon={<Download className={CssClass.ICON_MD} />}
      disabled={disabled}
      onSelect={() => void exportLibraryFolder(folderId)}
    >
      {t.runbooks.downloadZip}
    </ContextMenuItem>
  );
}
