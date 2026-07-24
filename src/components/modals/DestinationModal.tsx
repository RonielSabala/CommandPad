import { CloudProvider, SyncDestination, SyncModalMode } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import { Google, LaptopFill, Windows, type Icon } from "react-bootstrap-icons";
import "./DestinationModal.css";
import { Modal } from "./Modal";

const PROVIDER_ICON: Record<CloudProvider, Icon> = {
  [CloudProvider.SHAREPOINT]: Windows,
  [CloudProvider.GOOGLE_DRIVE]: Google,
};

// Proper nouns: left untranslated, same as "CommandPad" / "GitHub" elsewhere.
const PROVIDER_NAME: Record<CloudProvider, string> = {
  [CloudProvider.SHAREPOINT]: "SharePoint",
  [CloudProvider.GOOGLE_DRIVE]: "Google Drive",
};

const PROVIDERS: readonly CloudProvider[] = [
  CloudProvider.SHAREPOINT,
  CloudProvider.GOOGLE_DRIVE,
];

export function DestinationModal() {
  const t = useTranslation();
  const mode = useStore((state) => state.destinationModalMode);
  const closeDestinationModal = useStore(
    (state) => state.closeDestinationModal,
  );
  const chooseDestination = useStore((state) => state.chooseDestination);

  const isOpen = mode !== null;
  const [displayMode, setDisplayMode] = useState<SyncModalMode>(
    SyncModalMode.EXPORT,
  );

  useEffect(() => {
    if (mode) {
      setDisplayMode(mode);
    }
  }, [mode]);

  const handleChoose = (destination: SyncDestination) => {
    if (mode) {
      chooseDestination(mode, destination);
    }
  };

  return (
    <Modal open={isOpen} onClose={closeDestinationModal}>
      <p className="modal-title">
        {displayMode === SyncModalMode.EXPORT
          ? t.destinationModal.exportTitle
          : t.destinationModal.importTitle}
      </p>
      <p className="modal-message">
        {displayMode === SyncModalMode.EXPORT
          ? t.destinationModal.exportMessage
          : t.destinationModal.importMessage}
      </p>

      <div className="destination-modal-options">
        <button
          className="destination-modal-option"
          onClick={() => handleChoose(SyncDestination.LOCAL)}
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
              onClick={() => handleChoose(provider)}
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
