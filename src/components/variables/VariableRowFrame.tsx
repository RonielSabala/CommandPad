import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup, LassoMode, SelectionGroup } from "@/common/enums";
import { DragHandle } from "@/components/common/DragHandle";
import { lasso } from "@/hooks/lasso";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useStore, useStoreApi } from "@/store/store";
import { classNames } from "@/utils/string";
import type { ReactNode, RefObject } from "react";

import "./VariableItem.css";

interface Props {
  rowId: string;
  className?: string;
  /** What the pointer carries while the row is dragged. */
  dragImageRef: RefObject<HTMLElement | null>;
  menu: (className: string) => ReactNode;
  children: ReactNode;
}

export function VariableRowFrame({
  rowId,
  className,
  dragImageRef,
  menu,
  children,
}: Props) {
  const store = useStoreApi();

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const isSelected = useStore((state) => state.selectedVariableIds.has(rowId));
  const isFlashing = useStore((state) => state.flashVariableIds.has(rowId));
  const clearVariableFlash = useStore((state) => state.clearVariableFlash);
  const setVariableSelected = useStore((state) => state.setVariableSelected);
  const reorderVariables = useStore((state) => state.reorderVariables);

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    DragGroup.VARIABLE,
    rowId,
    reorderVariables,
    !readMode,
    dragImageRef,
  );

  return (
    <div
      className={classNames(
        CssClass.VARIABLE_ITEM,
        className,
        isDragging && CssClass.DRAGGING,
        isDragOver && CssClass.DRAG_OVER,
        isSelected && "variable-item-selected",
        isFlashing && CssClass.DUPLICATE_FLASH,
      )}
      {...{ [DataAttr.VARIABLE_ID]: rowId }}
      {...rowProps}
      onMouseEnter={() => {
        const drag = lasso[SelectionGroup.VARIABLE];
        if (drag.active && store.getState().mode !== AppMode.READ) {
          setVariableSelected(rowId, drag.mode === LassoMode.SELECT);
        }
      }}
      onAnimationEnd={() => {
        if (isFlashing) {
          clearVariableFlash(rowId);
        }
      }}
    >
      {children}

      <div className={CssClass.ITEM_DRAG_HANDLE}>
        <DragHandle handleProps={handleProps} />
      </div>

      {menu(CssClass.ITEM_ACTIONS)}
    </div>
  );
}
