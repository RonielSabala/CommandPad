import { CssClass } from "@/common/constants/css";
import { SyncDestination } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { LaptopFill } from "react-bootstrap-icons";

import {
  PROVIDER_ICON,
  PROVIDER_NAME,
  PROVIDERS,
} from "./cloud/cloudProviders";
import "./DestinationModal.css";
import { Modal, ModalActions, ModalMessage, ModalTitle } from "./Modal";

export function DestinationModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.destinationModalOpen);
  const chooseDestination = useStore((state) => state.chooseDestination);
  const closeDestinationModal = useStore(
    (state) => state.closeDestinationModal,
  );

  return (
    <Modal open={isOpen} onClose={closeDestinationModal}>
      <ModalTitle>{t.destinationModal.title}</ModalTitle>
      <ModalMessage>{t.destinationModal.message}</ModalMessage>

      <div className="destination-modal-options">
        <button
          className="destination-modal-option"
          onClick={() => chooseDestination(SyncDestination.LOCAL)}
        >
          <LaptopFill className={CssClass.ICON_LG} />
          {t.destinationModal.local}
        </button>

        {PROVIDERS.map((provider) => {
          const ProviderIcon = PROVIDER_ICON[provider];
          return (
            <button
              key={provider}
              className="destination-modal-option"
              onClick={() => chooseDestination(provider)}
            >
              <ProviderIcon className={CssClass.ICON_LG} />
              {PROVIDER_NAME[provider]}
            </button>
          );
        })}
      </div>

      <ModalActions>
        <button
          className={classNames(CssClass.BTN, CssClass.BTN_LG)}
          onClick={closeDestinationModal}
        >
          {t.common.cancel}
        </button>
      </ModalActions>
    </Modal>
  );
}
