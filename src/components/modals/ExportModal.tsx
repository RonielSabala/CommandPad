import { ExportFormat } from "@/common/enums";
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
  const isOpen = useStore((state) => state.exportModalOpen);
  const onClose = useStore((state) => state.closeExportModal);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <p className="modal-title">Export</p>
      <p className="modal-message">Choose an export format.</p>
      <div className="modal-actions">
        <ExportButton className="btn-primary" format={ExportFormat.JSON} />
        <ExportButton format={ExportFormat.MD} />
        <ExportButton format={ExportFormat.TXT} />

        <div className="vertical-divider" />
        <button className="btn btn-lg" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
