import { ExportFormat } from '@/common/enums';
import { useStore } from '@/store/store';
import { Modal } from './Modal';

export function ExportModal() {
  const open = useStore((s) => s.exportModalOpen);
  const close = useStore((s) => s.closeExportModal);
  const exportRunbook = useStore((s) => s.exportRunbook);

  return (
    <Modal open={open} onClose={close}>
      <p className="modal-title">Export</p>
      <p className="modal-message">Choose an export format.</p>
      <div className="modal-actions">
        <button className="btn btn-lg btn-primary" onClick={() => void exportRunbook(ExportFormat.JSON)}>
          .json
        </button>
        <button className="btn btn-lg" onClick={() => void exportRunbook(ExportFormat.MD)}>
          .md
        </button>
        <button className="btn btn-lg" onClick={() => void exportRunbook(ExportFormat.TXT)}>
          .txt
        </button>
        <div className="vertical-divider" />
        <button className="btn btn-lg" onClick={close}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
