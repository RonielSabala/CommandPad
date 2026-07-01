import './Modal.css';

import type { ReactNode } from 'react';
import { CssClass } from '@/common/constants/css';
import { useModalDismiss } from '@/hooks/useModalDismiss';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Always-mounted backdrop (so the fade transition plays); Escape + backdrop
 *  click both close. */
export function Modal({ open, onClose, children }: Props) {
  useModalDismiss(open, onClose);

  return (
    <div
      className={`modal-backdrop${open ? ` ${CssClass.MODAL_VISIBLE}` : ''}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">{children}</div>
    </div>
  );
}
