import { CssClass } from "@/common/constants/css";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { getVariableKey, sourceKey } from "@/utils/resolution";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { useContext } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";

import { EmbedScopeContext } from "../runbook/embedContext";
import "./VariableSourceTooltip.css";

interface Props {
  source: string;
  resolved: boolean;
  hide: () => void;
}

export function VariableSourceTooltip({ source, resolved, hide }: Props) {
  const t = useTranslation();
  const embed = useContext(EmbedScopeContext);
  const revealVariable = useStore((state) => state.revealVariable);
  const revealEmbeddedVariable = useStore(
    (state) => state.revealEmbeddedVariable,
  );

  const key = sourceKey(source);
  const hostVariableId = useStore((state) =>
    embed
      ? undefined
      : getActiveTab(state)?.variables.find((v) => getVariableKey(v) === key)
          ?.id,
  );

  const defined = embed
    ? embed.variables.some((v) => getVariableKey(v) === key)
    : !!hostVariableId;

  const title = embed
    ? t.command.goToEmbeddedDefinitionTitle(
        key,
        embed.source.local
          ? displayLabel(embed.source.local.label, t)
          : embed.source.cloud.path,
      )
    : t.command.goToDefinitionTitle(key);

  const goToDefinition = () => {
    hide();
    if (embed) {
      void revealEmbeddedVariable(embed.source, key, resolved);
    } else if (hostVariableId) {
      revealVariable(hostVariableId, resolved);
    }
  };

  return (
    <div className="variable-source-tooltip">
      <span>{source}</span>

      {defined && (
        <button
          type="button"
          className={classNames(
            CssClass.TOOLTIP_LINK,
            CssClass.TOOLTIP_LINK_PLAIN,
          )}
          title={title}
          onClick={goToDefinition}
        >
          {t.command.goToDefinition}
          {embed && <BoxArrowUpRight className={CssClass.ICON_SM} />}
        </button>
      )}
    </div>
  );
}
