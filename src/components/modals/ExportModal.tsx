import { ExportFormat } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { Modal } from "./Modal";

interface ExportButtonProps {
  className?: string;
  format: ExportFormat;
}

function ExportButton({ className, format }: ExportButtonProps) {
  const exportRunbook = useStore((state) => state.exportRunbook);

  return (
    <button
      className={`btn btn-lg ${className ?? ""}`}
      onClick={() => void exportRunbook(format)}
    >
      .{format}
    </button>
  );
}

export function ExportModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.exportModalOpen);
  const onClose = useStore((state) => state.closeExportModal);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <p className="modal-title">{t.exportModal.title}</p>
      <p className="modal-message">{t.exportModal.message}</p>
      <div className="modal-actions">
        <ExportButton className="btn-primary" format={ExportFormat.JSON} />
        <ExportButton format={ExportFormat.MD} />
        <ExportButton format={ExportFormat.TXT} />

        <div className="vertical-divider" />
        <button className="btn btn-lg" onClick={onClose}>
          {t.common.cancel}
        </button>
      </div>
    </Modal>
  );
}
