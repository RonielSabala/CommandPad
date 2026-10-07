import { CssClass } from "@/common/constants/css";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { ArrowLeft } from "react-bootstrap-icons";

import { Modal } from "../Modal";
import { CloudBrowser } from "./CloudBrowser";
import { CloudModalTitle } from "./CloudModalTitle";

export function CloudImportModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.cloudImportModalOpen);
  const provider = useStore((state) => state.cloudProvider);
  const chooseDestination = useStore((state) => state.chooseDestination);
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
      <CloudModalTitle
        message={t.cloudModal.importTitle}
        provider={provider}
        onChange={chooseDestination}
      />

      <CloudBrowser showFiles />

      <div className="modal-actions">
        <button
          className={classNames(CssClass.BTN, CssClass.BTN_LG)}
          onClick={returnToDestinationModal}
        >
          <ArrowLeft
            className={classNames(CssClass.ICON_MD, CssClass.ICON_SEMIBOLD)}
          />
          {t.common.back}
        </button>

        <button
          className={classNames(CssClass.BTN, CssClass.BTN_LG)}
          onClick={closeCloudImportModal}
        >
          {t.common.close}
        </button>
      </div>
    </Modal>
  );
}
