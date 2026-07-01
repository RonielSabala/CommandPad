import { useEffect } from 'react';
import { EventType, Key } from '@/common/constants/events';

/** While `open`, close the modal on Escape. Backdrop-click close lives in `Modal`. */
export function useModalDismiss(open: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === Key.ESCAPE) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener(EventType.KEY_DOWN, onKey);
    return () => document.removeEventListener(EventType.KEY_DOWN, onKey);
  }, [open, onClose]);
}
