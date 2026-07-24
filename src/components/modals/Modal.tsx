import { CloseIcon } from "@/components/icons";
import { useModalDismiss } from "@/hooks/useModalDismiss";
import { useTranslation } from "@/i18n";
import type { ReactNode } from "react";
import "./Modal.css";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: Props) {
  const t = useTranslation();
  useModalDismiss(open, onClose);

  return (
    <div
      className={`modal-backdrop${open ? " modal-visible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      inert={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal">
        <button
          className="modal-close btn btn-flat-icon"
          onClick={onClose}
          title={t.common.close}
          aria-label={t.common.close}
        >
          <CloseIcon className="icon-semibold" />
        </button>
        {children}
      </div>
    </div>
  );
}
