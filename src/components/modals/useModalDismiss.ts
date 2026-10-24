import { EventType, Key } from "@/common/constants/events";
import { useEffect, useRef } from "react";

const openModals: symbol[] = [];

export function useModalDismiss(open: boolean, onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }

    const token = Symbol("modal");
    openModals.push(token);

    const onKey = (event: KeyboardEvent) => {
      if (
        event.key !== Key.ESCAPE ||
        openModals[openModals.length - 1] !== token
      ) {
        return;
      }

      event.preventDefault();
      onCloseRef.current();
    };

    document.addEventListener(EventType.KEY_DOWN, onKey);
    return () => {
      document.removeEventListener(EventType.KEY_DOWN, onKey);
      openModals.splice(openModals.indexOf(token), 1);
    };
  }, [open]);
}
