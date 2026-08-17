import { VAULT_PROMPT_FIELDS } from "@/common/config";
import { VaultField, VaultPrompt } from "@/common/enums";
import { NoteText } from "@/components/blocks/note/NoteText";
import { Spinner } from "@/components/common/Spinner";
import { useTranslation } from "@/i18n";
import { useStore, type VaultPassphrases } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { ShieldLock } from "react-bootstrap-icons";
import { Modal } from "../Modal";
import { PassphraseField } from "./PassphraseField";
import "./VaultModal.css";

const EMPTY_PASSPHRASES: VaultPassphrases = {
  [VaultField.CURRENT]: "",
  [VaultField.NEXT]: "",
  [VaultField.CONFIRM]: "",
};

export function VaultModal() {
  const t = useTranslation();
  const dialog = useStore((state) => state.vaultDialog);
  const submit = useStore((state) => state.submitVaultPassphrase);
  const dismiss = useStore((state) => state.dismissVaultDialog);

  const [passphrases, setPassphrases] =
    useState<VaultPassphrases>(EMPTY_PASSPHRASES);
  const [session, setSession] = useState(0);

  const isOpen = !!dialog;
  const shown = useRef(dialog);
  if (dialog) {
    shown.current = dialog;
  }

  const active = shown.current;

  // A fresh prompt starts empty
  useEffect(() => {
    if (isOpen) {
      setPassphrases(EMPTY_PASSPHRASES);
      setSession((current) => current + 1);
    }
  }, [isOpen]);

  if (!active) {
    return null;
  }

  const { prompt, busy, error, filename } = active;
  const fields = VAULT_PROMPT_FIELDS[prompt];

  const handleSubmit = () => {
    if (!busy) {
      void submit(passphrases);
    }
  };

  const message =
    prompt === VaultPrompt.UNLOCK && filename
      ? t.vaultModal.unlockFileMessage(filename)
      : t.vaultModal.message[prompt];

  return (
    <Modal open={isOpen} onClose={dismiss} className="modal-vault">
      <div className="vault-header">
        <span className="vault-badge">
          <ShieldLock className="icon-lg" />
        </span>

        <div className="vault-heading">
          <p className="modal-title vault-title">
            {t.vaultModal.title[prompt]}
          </p>
          <div className="vault-message">
            <NoteText text={message} />
          </div>
        </div>
      </div>

      <div className="vault-fields">
        {fields.map((field, index) => (
          <PassphraseField
            key={`${field}-${session}`}
            label={t.vaultModal.fieldLabel[prompt][field]}
            value={passphrases[field]}
            disabled={busy}
            autoFocus={index === 0}
            onChange={(value) =>
              setPassphrases((current) => ({ ...current, [field]: value }))
            }
            onSubmit={handleSubmit}
          />
        ))}
      </div>

      {error && <p className="vault-error">{t.vaultModal.errors[error]}</p>}

      <div className="modal-actions">
        <button className="btn btn-lg" onClick={dismiss} disabled={busy}>
          {t.vaultModal.skip}
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-primary"
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <>
              <Spinner />
              {t.vaultModal.working}
            </>
          ) : (
            t.vaultModal.submit[prompt]
          )}
        </button>
      </div>
    </Modal>
  );
}
