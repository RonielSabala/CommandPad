import { Key } from "@/common/constants/events";
import { VariableField } from "@/common/enums";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { isConstantVariableKey } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import type { RefObject } from "react";

interface Props {
  variableId: string;
  variableKey: string;
  className: string;
  unused?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function VariableKeyInput({
  variableId,
  variableKey,
  className,
  unused,
  inputRef,
}: Props) {
  const t = useTranslation();
  const updateVariable = useStore((state) => state.updateVariable);
  const handlePairWrap = usePairWrapping((value) =>
    updateVariable(variableId, VariableField.KEY, value),
  );

  return (
    <input
      ref={inputRef}
      className={classNames(
        className,
        "no-ligatures",
        isConstantVariableKey(variableKey) && "is-constant",
      )}
      type="text"
      placeholder={t.variables.keyPlaceholder}
      value={variableKey}
      spellCheck={false}
      autoComplete="off"
      onChange={(event) =>
        updateVariable(variableId, VariableField.KEY, event.target.value)
      }
      onKeyDown={(event) => {
        if (event.key === Key.ENTER || event.key === Key.ESCAPE) {
          event.currentTarget.blur();
          return;
        }

        handlePairWrap(event);
      }}
      title={unused ? t.variables.unusedTitle(variableKey) : variableKey}
    />
  );
}
