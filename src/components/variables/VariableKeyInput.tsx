import { Key } from "@/common/constants/events";
import { VariableField } from "@/common/enums";
import { useDomScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { isConstantVariableKey } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useRef, type RefObject } from "react";

import "./VariableKeyInput.css";

interface Props {
  variableId: string;
  variableKey: string;
  className: string;
  unused?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  scrollable?: boolean;
}

export function VariableKeyInput({
  variableId,
  variableKey,
  className,
  unused,
  inputRef,
  scrollable,
}: Props) {
  const t = useTranslation();
  const updateVariable = useStore((state) => state.updateVariable);
  const handlePairWrap = usePairWrapping((value) =>
    updateVariable(variableId, VariableField.KEY, value),
  );
  const ownRef = useRef<HTMLInputElement>(null);
  const scrollTarget = useDomScrollTarget(ownRef);

  return (
    <div className="variable-key-wrap" data-value={variableKey}>
      <input
        ref={(node) => {
          ownRef.current = node;
          if (inputRef) {
            inputRef.current = node;
          }
        }}
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

      {scrollable && (
        <StickyScrollbar target={scrollTarget} deps={[variableKey]} />
      )}
    </div>
  );
}
