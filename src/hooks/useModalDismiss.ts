import { EventType, Key } from "@/common/constants/events";
import { useEffect } from "react";

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
