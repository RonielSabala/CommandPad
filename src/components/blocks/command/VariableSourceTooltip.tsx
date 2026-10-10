import { CssClass } from "@/common/constants/css";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { getVariableKey, sourceKey } from "@/utils/resolution";
import { classNames } from "@/utils/string";

import "./VariableSourceTooltip.css";

interface Props {
  source: string;
  resolved: boolean;
  hide: () => void;
}

export function VariableSourceTooltip({ source, resolved, hide }: Props) {
  const t = useTranslation();
  const revealVariable = useStore((state) => state.revealVariable);

  const key = sourceKey(source);
  const variableId = useStore(
    (state) =>
      getActiveTab(state)?.variables.find((v) => getVariableKey(v) === key)?.id,
  );

  return (
    <div className="variable-source-tooltip">
      <span>{source}</span>

      {variableId && (
        <button
          type="button"
          className={classNames(
            CssClass.TOOLTIP_LINK,
            CssClass.TOOLTIP_LINK_PLAIN,
          )}
          onClick={() => {
            hide();
            revealVariable(variableId, resolved);
          }}
        >
          {t.command.goToDefinition}
        </button>
      )}
    </div>
  );
}
