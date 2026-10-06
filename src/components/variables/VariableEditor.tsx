import { CssClass } from "@/common/constants/css";
import { CodeModelScope } from "@/common/editorConfig";
import type { Variable } from "@/common/types";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { EyeIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { useStore } from "@/store/store";
import { getVariableKey } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useEffect, useMemo, type RefObject } from "react";

import "./VariableEditor.css";
import { VariableKeyInput } from "./VariableKeyInput";
import { VariableValueField } from "./VariableValueField";

interface Props {
  variable: Variable;
  completions: VariableCompletion[];
  unused?: boolean;
  keyRef: RefObject<HTMLInputElement | null>;
}

export function VariableEditor({
  variable,
  completions,
  unused,
  keyRef,
}: Props) {
  const t = useTranslation();
  const variableId = variable.id;
  const isSecret = !!variable.secret;

  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusVariableId === variableId,
  );

  // A variable resolving to itself can never fill in, so never offer it
  const ownKey = getVariableKey(variable);
  const valueCompletions = useMemo(
    () => completions.filter((entry) => entry.key !== ownKey),
    [completions, ownKey],
  );

  useEffect(() => {
    if (pendingFocus) {
      keyRef.current?.focus({ preventScroll: true });
      keyRef.current?.select();
      consumeVariableFocus();
    }
  }, [pendingFocus, consumeVariableFocus, keyRef]);

  return (
    <VariableValueField
      variable={variable}
      value={variable.value}
      scope={CodeModelScope.VARIABLE}
      surfaceId={variableId}
      completions={valueCompletions}
      className={classNames(
        CssClass.VARIABLE_SURFACE,
        unused && CssClass.IS_UNUSED,
      )}
      keyRow={
        <>
          <VariableKeyInput
            variableId={variableId}
            variableKey={variable.key}
            className={classNames(
              CssClass.VARIABLE_EDITOR_KEY,
              CssClass.SELECT_KEY_INERT,
            )}
            unused={unused}
            inputRef={keyRef}
            scrollable
          />

          {isSecret && (
            <button
              className={classNames(
                "variable-editor-secret-btn",
                CssClass.BTN,
                CssClass.BTN_ICON,
              )}
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
        </>
      }
    />
  );
}
