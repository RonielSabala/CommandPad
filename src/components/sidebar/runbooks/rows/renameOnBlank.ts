import type { MouseEvent } from "react";

export const renameOnBlank =
  (readMode: boolean, startRenaming: () => void) => (event: MouseEvent) => {
    if (!readMode && event.target === event.currentTarget) {
      startRenaming();
    }
  };
