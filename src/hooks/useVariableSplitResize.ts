import { CssClass } from "@/common/constants/css";
import { Cursor } from "@/common/constants/dom";
import { EventType, MouseButton } from "@/common/constants/events";
import { useStore } from "@/store/store";
import {
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * Drag the divider between a variable's key and value inputs to rebalance them.
 * The ratio is shared by every row, so one drag resizes the whole list.
 */
export function useVariableSplitResize() {
  const setVariableKeyRatio = useStore((state) => state.setVariableKeyRatio);
  const resetVariableKeyRatio = useStore(
    (state) => state.resetVariableKeyRatio,
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== MouseButton.LEFT) {
        return;
      }

      const handle = event.currentTarget;
      const inputs = handle.parentElement;
      if (!inputs) {
        return;
      }

      event.preventDefault();

      // The handle sits in its own column, so the inputs share what is left of the row
      const rect = inputs.getBoundingClientRect();
      const handleWidth = handle.getBoundingClientRect().width;
      const trackWidth = rect.width - handleWidth;
      if (trackWidth <= 0) {
        return;
      }

      document.body.classList.add(CssClass.VARIABLE_SPLIT_RESIZING);
      document.body.style.cursor = Cursor.COL_RESIZE;

      const onMove = (moveEvent: PointerEvent) => {
        const keyWidth = moveEvent.clientX - rect.left - handleWidth / 2;
        setVariableKeyRatio(keyWidth / trackWidth);
      };

      const onUp = () => {
        document.body.classList.remove(CssClass.VARIABLE_SPLIT_RESIZING);
        document.body.style.cursor = Cursor.DEFAULT;
        window.removeEventListener(EventType.POINTER_MOVE, onMove);
        window.removeEventListener(EventType.POINTER_UP, onUp);
      };

      window.addEventListener(EventType.POINTER_MOVE, onMove);
      window.addEventListener(EventType.POINTER_UP, onUp);
    },
    [setVariableKeyRatio],
  );

  const onDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      resetVariableKeyRatio();
    },
    [resetVariableKeyRatio],
  );

  return { onPointerDown, onDoubleClick };
}
