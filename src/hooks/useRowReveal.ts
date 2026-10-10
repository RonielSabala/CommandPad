import { ScrollIntoView } from "@/common/constants/dom";
import { whenElementSettles } from "@/utils/dom";
import { useEffect, type RefObject } from "react";

/** Scrolls a list to the row `pendingId` names, then calls `finish` once it stops moving. */
export function useRowReveal(
  listRef: RefObject<HTMLElement | null>,
  idAttr: string,
  pendingId: string | null,
  finish: () => void,
): void {
  useEffect(() => {
    if (!pendingId) {
      return;
    }

    let cancelSettle = () => {};
    let frame = 0;

    // A view or tab switch restores its saved scroll position in one
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const row = listRef.current?.querySelector<HTMLElement>(
          `[${idAttr}="${pendingId}"]`,
        );

        if (!row) {
          finish();
          return;
        }

        row.scrollIntoView({
          block: ScrollIntoView.BLOCK_CENTER,
          behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
        });

        cancelSettle = whenElementSettles(row, finish);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelSettle();
    };
  }, [listRef, idAttr, pendingId, finish]);
}
