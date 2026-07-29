import { SyncDestination } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { LaptopFill } from "react-bootstrap-icons";
import { PROVIDER_ICON, PROVIDER_NAME, PROVIDERS } from "./cloudProviders";
import "./DestinationModal.css";
import { Modal } from "./Modal";

export function DestinationModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.destinationModalOpen);
  const chooseDestination = useStore((state) => state.chooseDestination);
  const closeDestinationModal = useStore(
    (state) => state.closeDestinationModal,
  );

  return (
    <Modal open={isOpen} onClose={closeDestinationModal}>
      <p className="modal-title">{t.destinationModal.title}</p>
      <p className="modal-message">{t.destinationModal.message}</p>

      <div className="destination-modal-options">
        <button
          className="destination-modal-option"
          onClick={() => chooseDestination(SyncDestination.LOCAL)}
        >
          <LaptopFill className="icon-lg" />
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
              <ProviderIcon className="icon-lg" />
              {PROVIDER_NAME[provider]}
            </button>
          );
        })}
      </div>

      <div className="modal-actions">
        <button className="btn btn-lg" onClick={closeDestinationModal}>
          {t.common.cancel}
        </button>
      </div>
    </Modal>
  );
}
