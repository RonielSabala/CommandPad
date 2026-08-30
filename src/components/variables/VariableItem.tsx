import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup, LassoMode, SelectionGroup } from "@/common/enums";
import type { Variable } from "@/common/types";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { DragIcon } from "@/components/icons";
import { lasso } from "@/hooks/lasso";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { useStore, useStoreApi } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useRef } from "react";

import { VariableActionsMenu } from "./VariableActionsMenu";
import { VariableEditor } from "./VariableEditor";
import "./VariableItem.css";

interface Props {
  variable: Variable;
  completions: VariableCompletion[];
  unused?: boolean;
}

export const VariableItem = memo(function VariableItem({
  variable,
  completions,
  unused,
}: Props) {
  const t = useTranslation();
  const store = useStoreApi();
  const variableId = variable.id;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const isSelected = useStore((state) =>
    state.selectedVariableIds.has(variableId),
  );
  const isFlashing = useStore((state) =>
    state.flashVariableIds.has(variableId),
  );
  const clearVariableFlash = useStore((state) => state.clearVariableFlash);
  const setVariableSelected = useStore((state) => state.setVariableSelected);
  const reorderVariables = useStore((state) => state.reorderVariables);

  const keyRef = useRef<HTMLInputElement>(null);

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    DragGroup.VARIABLE,
    variableId,
    reorderVariables,
    !readMode,
    keyRef,
  );

  return (
    <div
      className={classNames(
        CssClass.VARIABLE_ITEM,
        isSelected && "variable-selected",
        isFlashing && "duplicate-flash",
        isDragging && CssClass.DRAGGING,
        isDragOver && CssClass.DRAG_OVER,
      )}
      {...{ [DataAttr.VARIABLE_ID]: variableId }}
      {...rowProps}
      onMouseEnter={() => {
        const drag = lasso[SelectionGroup.VARIABLE];
        if (drag.active && store.getState().mode !== AppMode.READ) {
          setVariableSelected(variableId, drag.mode === LassoMode.SELECT);
        }
      }}
      onAnimationEnd={() => {
        if (isFlashing) {
          clearVariableFlash(variableId);
        }
      }}
    >
      <VariableEditor
        variable={variable}
        completions={completions}
        unused={unused}
        keyRef={keyRef}
      />

      <div className={CssClass.VARIABLE_DRAG_HANDLE}>
        <div
          className="drag-handle"
          {...tooltip(t.common.dragToReorder)}
          {...handleProps}
        >
          <DragIcon className="icon-md" />
        </div>
      </div>

      <VariableActionsMenu
        variableId={variableId}
        isSecret={!!variable.secret}
        className={CssClass.VARIABLE_ACTIONS}
      />
    </div>
  );
});
