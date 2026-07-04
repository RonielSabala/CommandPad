import "./Modal.css";

import { useModalDismiss } from "@/hooks/useModalDismiss";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: Props) {
  useModalDismiss(open, onClose);

  return (
    <div
      className={`modal-backdrop${open ? " modal-visible" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal">{children}</div>
    </div>
  );
}
