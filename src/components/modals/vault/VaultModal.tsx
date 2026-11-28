import { CssClass } from "@/common/constants/css";
import { VaultField, VaultPrompt } from "@/common/enums";
import { VAULT_PROMPT_FIELDS } from "@/common/vaultConfig";
import { NoteText } from "@/components/blocks/note/NoteText";
import { Spinner } from "@/components/common/Spinner";
import { VerticalDivider } from "@/components/common/VerticalDivider";
import { useTranslation } from "@/i18n";
import {
  useStore,
  useStoreActions,
  type VaultPassphrases,
} from "@/store/store";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState } from "react";
import {
  ExclamationCircleFill,
  InfoCircleFill,
  KeyFill,
  ShieldFillPlus,
  ShieldLockFill,
  type Icon,
} from "react-bootstrap-icons";

import { Modal, ModalActions, ModalTitle } from "../Modal";
import { PassphraseField } from "./PassphraseField";
import "./VaultModal.css";

const EMPTY_PASSPHRASES: VaultPassphrases = {
  [VaultField.CURRENT]: "",
  [VaultField.NEXT]: "",
  [VaultField.CONFIRM]: "",
};

const PROMPT_ICON: Record<VaultPrompt, Icon> = {
  [VaultPrompt.CREATE]: ShieldFillPlus,
  [VaultPrompt.UNLOCK]: ShieldLockFill,
  [VaultPrompt.CHANGE]: KeyFill,
};

export function VaultModal() {
  const t = useTranslation();
  const dialog = useStore((state) => state.vaultDialog);
  const {
    submitVaultPassphrase: submit,
    dismissVaultDialog: dismiss,
    skipVaultBatch: skipBatch,
  } = useStoreActions();

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

  const { prompt, busy, error, filename, batch } = active;
  const pending = batch?.pending ?? 0;
  const fields = VAULT_PROMPT_FIELDS[prompt];
  const PromptIcon = PROMPT_ICON[prompt];

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
      <header className="vault-hero">
        <span className="vault-emblem" aria-hidden={true}>
          <PromptIcon />
        </span>

        <ModalTitle className="vault-title">
          {t.vaultModal.title[prompt]}
        </ModalTitle>

        <div
          className={classNames("vault-message", CssClass.NOTE_CODE_NEUTRAL)}
        >
          <p>
            <NoteText text={message} />
          </p>

          {pending > 0 && (
            <p className="vault-batch">
              <NoteText
                text={t.vaultModal.batchMessage(pending, t.vaultModal.skipAll)}
              />
            </p>
          )}
        </div>
      </header>

      <div className="vault-body">
        <div className="vault-fields">
          {fields.map((field, index) => (
            <PassphraseField
              key={`${field}-${session}`}
              label={t.vaultModal.fieldLabel[prompt][field]}
              value={passphrases[field]}
              disabled={busy}
              invalid={!!error}
              autoFocus={index === 0}
              onChange={(value) =>
                setPassphrases((current) => ({ ...current, [field]: value }))
              }
              onSubmit={handleSubmit}
            />
          ))}
        </div>

        {error && (
          <p className="vault-error" role="alert">
            <ExclamationCircleFill className="vault-note-icon" />
            {t.vaultModal.errors[error]}
          </p>
        )}

        <p className="vault-footnote">
          <InfoCircleFill className="vault-note-icon" />
          <span>
            <NoteText text={t.vaultModal.footnote[prompt]} />
          </span>
        </p>
      </div>

      <ModalActions className="vault-actions">
        {pending > 0 && (
          <button
            className={classNames(CssClass.BTN, CssClass.BTN_LG)}
            onClick={skipBatch}
            disabled={busy}
          >
            {t.vaultModal.skipAll}
          </button>
        )}

        <button
          className={classNames(CssClass.BTN, CssClass.BTN_LG)}
          onClick={dismiss}
          disabled={busy}
        >
          {pending > 0 ? t.vaultModal.skipOne : t.vaultModal.skip}
        </button>

        <VerticalDivider />

        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_PRIMARY,
          )}
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
      </ModalActions>
    </Modal>
  );
}
