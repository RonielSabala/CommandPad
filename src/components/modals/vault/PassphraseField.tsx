import { Key } from "@/common/constants/events";
import { EyeIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useId, useState } from "react";

import "./PassphraseField.css";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function PassphraseField({
  label,
  value,
  onChange,
  onSubmit,
  disabled = false,
  autoFocus = false,
}: Props) {
  const t = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const inputId = useId();

  const toggleLabel = revealed ? t.vaultModal.hide : t.vaultModal.reveal;

  return (
    <div className="passphrase-field">
      <label className="passphrase-label" htmlFor={inputId}>
        {label}
      </label>

      <div className="passphrase-control">
        <input
          id={inputId}
          className="passphrase-input"
          type={revealed ? "text" : "password"}
          value={value}
          disabled={disabled}
          spellCheck={false}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === Key.ENTER) {
              onSubmit();
            }
          }}
        />

        <button
          className="btn btn-flat-icon passphrase-reveal"
          type="button"
          onClick={() => setRevealed((shown) => !shown)}
          disabled={disabled}
          title={toggleLabel}
          aria-label={toggleLabel}
        >
          <EyeIcon slashed={!revealed} className="icon-md icon-bold" />
        </button>
      </div>
    </div>
  );
}
