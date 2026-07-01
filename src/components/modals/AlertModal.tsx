import { useEffect, useRef } from 'react';

import { useStore } from '@/store/store';
import { Modal } from './Modal';

export function AlertModal() {
  const dialog = useStore((s) => s.alertDialog);
  const resolve = useStore((s) => s.resolveAlert);
  const open = dialog !== null;
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      okRef.current?.focus();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={resolve}>
      <p className="modal-title">Invalid Format</p>
      <p className="modal-message">{dialog?.message}</p>
      <div className="modal-actions">
        <button ref={okRef} className="btn btn-lg btn-primary" onClick={resolve}>
          OK
        </button>
      </div>
    </Modal>
  );
}
