import { EventType, Key } from "@/common/constants/events";
import { useEffect } from "react";

export function useModalDismiss(open: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === Key.ESCAPE) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener(EventType.KEY_DOWN, onKey);
    return () => document.removeEventListener(EventType.KEY_DOWN, onKey);
  }, [open, onClose]);
}
