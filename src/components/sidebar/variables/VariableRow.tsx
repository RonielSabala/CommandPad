import { SECRET_MASK } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import {
  AppMode,
  DragGroup,
  RunbookView,
  TooltipVariant,
  VariableField,
} from "@/common/enums";
import type { Variable } from "@/common/types";
import { DragHandle } from "@/components/common/DragHandle";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { EyeIcon } from "@/components/icons";
import { VariableActionsMenu } from "@/components/variables/VariableActionsMenu";
import { VariableKeyInput } from "@/components/variables/VariableKeyInput";
import { VariableOptionsSelect } from "@/components/variables/VariableOptionsSelect";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useVariableSplitResize } from "@/hooks/useVariableSplitResize";
import { useTranslation } from "@/i18n";
import { getRunbookView, useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useEffect, useRef, type CSSProperties } from "react";

import "./VariableRow.css";

interface Props {
  variable: Variable;
  unused?: boolean;
  showSecretColumn?: boolean;
}

export const VariableRow = memo(function VariableRow({
  variable,
  unused,
  showSecretColumn,
}: Props) {
  const t = useTranslation();
  const variableId = variable.id;
  const variableKey = variable.key;
  const variableValue = variable.value;
  const isSecret = !!variable.secret;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const reorderVariables = useStore((state) => state.reorderVariables);

  const editorShowing = useStore(
    (state) => getRunbookView(state) === RunbookView.VARIABLES,
  );
  const pendingFocus = useStore(
    (state) => state.pendingFocusVariableId === variableId,
  );
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const keyRatio = useStore((state) => state.variableKeyRatio);
  const splitResize = useVariableSplitResize();
  const keyRef = useRef<HTMLInputElement>(null);

  const handleValuePairWrap = usePairWrapping((value) =>
    updateVariable(variableId, VariableField.VALUE, value),
  );

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    DragGroup.VARIABLE,
    variableId,
    reorderVariables,
    !readMode,
  );

  useEffect(() => {
    if (pendingFocus && !editorShowing) {
      keyRef.current?.focus();
      keyRef.current?.select();
      consumeVariableFocus();
    }
  }, [pendingFocus, editorShowing, consumeVariableFocus]);

  return (
    <div
      className={classNames(
        "variable-row",
        "sidebar-section-list-row",
        unused && CssClass.IS_UNUSED,
        isSecret && CssClass.IS_SECRET,
        isDragging && CssClass.DRAGGING,
      )}
      {...{ [DataAttr.VARIABLE_ID]: variableId }}
      {...rowProps}
    >
      <DragHandle handleProps={handleProps} />

      <div
        className={classNames(
          "variable-inputs",
          isSecret && CssClass.IS_SECRET,
          isDragOver && CssClass.DRAG_OVER,
        )}
        style={
          {
            "--variable-key-fr": `${keyRatio}fr`,
            "--variable-value-fr": `${1 - keyRatio}fr`,
          } as CSSProperties
        }
      >
        <VariableKeyInput
          variableId={variableId}
          variableKey={variableKey}
          className="variable-key-input"
          unused={unused}
          inputRef={keyRef}
        />

        <div
          className={classNames(
            "variable-split-handle",
            CssClass.NO_USER_SELECT,
          )}
          {...tooltip(t.variables.dragResizeSplit)}
          {...splitResize}
        />

        {variable.options ? (
          <VariableOptionsSelect
            variableId={variableId}
            value={variableValue}
            options={variable.options}
            triggerClassName="variable-value-input"
          />
        ) : (
          <div className="variable-value-wrap">
            <input
              className={classNames(
                "variable-value-input",
                CssClass.NO_LIGATURES,
              )}
              type="text"
              placeholder={t.variables.valuePlaceholder}
              value={variableValue}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) =>
                updateVariable(
                  variableId,
                  VariableField.VALUE,
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === Key.ENTER || event.key === Key.ESCAPE) {
                  event.currentTarget.blur();
                  return;
                }

                handleValuePairWrap(event);
              }}
              {...tooltip(isSecret ? "" : variableValue, TooltipVariant.CODE)}
            />

            {isSecret && variableValue && (
              <div className="variable-value-mask" aria-hidden="true">
                {SECRET_MASK}
              </div>
            )}
          </div>
        )}
      </div>

      {isSecret && (
        <button
          className="btn btn-icon variable-secret-btn"
          onClick={() => toggleVariableSecret(variableId)}
          aria-label={t.variables.reveal(1)}
          {...tooltip(t.variables.reveal(1))}
        >
          <EyeIcon
            slashed
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        </button>
      )}

      <VariableActionsMenu
        variableId={variableId}
        isSecret={isSecret}
        isEnum={!!variable.options}
        className={CssClass.ROW_ACTIONS}
      />

      {!isSecret && showSecretColumn && (
        <div
          className="btn btn-icon variable-secret-btn is-placeholder"
          aria-hidden="true"
        >
          <EyeIcon
            slashed
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        </div>
      )}
    </div>
  );
});
