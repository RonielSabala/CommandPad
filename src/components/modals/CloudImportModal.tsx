import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { ArrowLeft } from "react-bootstrap-icons";
import { CloudBrowser } from "./CloudBrowser";
import { Modal } from "./Modal";

export function CloudImportModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.cloudImportModalOpen);
  const closeCloudImportModal = useStore(
    (state) => state.closeCloudImportModal,
  );
  const returnToDestinationModal = useStore(
    (state) => state.returnToDestinationModal,
  );

  return (
    <Modal
      open={isOpen}
      onClose={closeCloudImportModal}
      className="modal-cloud"
    >
      <p className="modal-title">{t.cloudModal.importTitle}</p>

      <CloudBrowser showFiles />

      <div className="modal-actions">
        <button className="btn btn-lg" onClick={returnToDestinationModal}>
          <ArrowLeft className="icon-md icon-semibold" />
          {t.common.back}
        </button>

        <button className="btn btn-lg" onClick={closeCloudImportModal}>
          {t.common.close}
        </button>
      </div>
    </Modal>
  );
}
