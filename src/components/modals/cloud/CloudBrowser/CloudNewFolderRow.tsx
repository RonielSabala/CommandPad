import {
  FilenameInput,
  FilenameInputSize,
} from "@/components/common/FilenameInput";
import { useTranslation } from "@/i18n";
import { FolderFill } from "react-bootstrap-icons";
import "./CloudNewFolderRow.css";
import { CloudRowConfirmActions } from "./CloudRowConfirmActions";

interface CloudNewFolderRowProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CloudNewFolderRow({
  value,
  onChange,
  onSubmit,
  onCancel,
}: CloudNewFolderRowProps) {
  const t = useTranslation();

  return (
    <div className="cloud-browser-new-folder-row">
      <FolderFill className="icon-md cloud-browser-row-icon" />
      <FilenameInput
        value={value}
        size={FilenameInputSize.COMPACT}
        autoFocus
        placeholder={t.cloudModal.folderNamePlaceholder}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />

      <CloudRowConfirmActions
        onConfirm={onSubmit}
        onCancel={onCancel}
        confirmDisabled={!value.trim()}
        confirmTitle={t.cloudModal.createFolder}
        cancelTitle={t.cloudModal.cancelNewFolder}
      />
    </div>
  );
}
