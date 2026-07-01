import { useEffect } from 'react';

import { Anchor, Cursor, DataAttr, Selector } from '@/common/constants/dom';
import { EventType, MouseButton } from '@/common/constants/events';
import { AppMode, LassoMode } from '@/common/enums';
import { useStore } from '@/store/store';
import { lasso } from './lasso';

/**
 * Document-level pointer interactions: alt-hover link cursor, alt+click to open
 * links, ctrl+drag lasso multi-select, and click-outside deselect. Faithful
 * port of the original document mousemove/mousedown/mouseup/click handlers.
 */
export function useDocumentInteractions(): void {
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;

    const isOverLink = (x: number, y: number): HTMLAnchorElement | undefined =>
      document
        .elementsFromPoint(x, y)
        .find((el): el is HTMLAnchorElement => el.matches(Selector.NOTE_LINK)) as
        | HTMLAnchorElement
        | undefined;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (e.altKey) {
        document.body.style.cursor = isOverLink(mouseX, mouseY) ? Cursor.POINTER : Cursor.DEFAULT;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const s = useStore.getState();
      if (!(e.ctrlKey || e.metaKey) || e.button !== MouseButton.LEFT || s.mode === AppMode.READ) {
        return;
      }

      const blockEl = (e.target as Element).closest(Selector.BLOCK_ITEM);
      if (blockEl) {
        const blockId = blockEl.getAttribute(DataAttr.BLOCK_ID);
        if (blockId) {
          lasso.mode = s.selectedBlockIds.has(blockId) ? LassoMode.DESELECT : LassoMode.SELECT;
          s.setBlockSelected(blockId, lasso.mode === LassoMode.SELECT);
        }
      } else {
        lasso.mode = LassoMode.SELECT;
      }
      lasso.active = true;
    };

    const onMouseUp = () => {
      lasso.active = false;
    };

    const onClick = (e: MouseEvent) => {
      const s = useStore.getState();

      if (e.altKey) {
        const link = isOverLink(e.clientX, e.clientY);
        if (!link) {
          return;
        }
        e.preventDefault();
        s.setAltHeld(false);
        window.open(link.href, Anchor.TARGET_BLANK, Anchor.REL);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        return;
      }

      const target = e.target as Element;
      if (s.focusedRunbookId !== null && !target.closest(Selector.RUNBOOK_ITEM_BTN)) {
        s.setRunbookFocus(null);
      }

      if (
        s.selectedBlockIds.size > 0 &&
        !target.closest(`${Selector.BLOCK_CONTROLS}, ${Selector.BLOCK_DRAG_HANDLE}`)
      ) {
        s.clearBlockSelection();
      }
    };

    document.addEventListener(EventType.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EventType.MOUSE_DOWN, onMouseDown);
    document.addEventListener(EventType.MOUSE_UP, onMouseUp);
    document.addEventListener(EventType.CLICK, onClick);
    return () => {
      document.removeEventListener(EventType.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EventType.MOUSE_DOWN, onMouseDown);
      document.removeEventListener(EventType.MOUSE_UP, onMouseUp);
      document.removeEventListener(EventType.CLICK, onClick);
    };
  }, []);
}
