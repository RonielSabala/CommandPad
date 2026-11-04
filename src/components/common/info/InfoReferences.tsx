import { CssClass } from "@/common/constants/css";
import { ButtonType } from "@/common/constants/dom";
import { RevealTone } from "@/common/enums";
import type { Block, Variable } from "@/common/types";
import { BlockLinks } from "@/components/common/tooltip/BlockLinks";
import { VariablesViewContext } from "@/components/variables/variablesViewContext";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { positionsIn } from "@/utils/collections";
import { getVariableKey } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useContext, useState, type ReactNode } from "react";

import "./InfoReferences.css";
import { InfoDismissContext } from "./infoTooltipContext";

interface Props {
  summary: ReactNode;
  blocks?: readonly Block[];
  variables?: readonly Variable[];
  missingKeys?: readonly string[];
}

/** A count that unfolds into links to the blocks and variables it counts. */
export function InfoReferences({
  summary,
  blocks = [],
  variables = [],
  missingKeys = [],
}: Props) {
  const t = useTranslation();
  const dismiss = useContext(InfoDismissContext);
  const canRevealVariables = useContext(VariablesViewContext);
  const tab = useStore(getActiveTab);
  const revealVariable = useStore((state) => state.revealVariable);
  const [expanded, setExpanded] = useState(false);

  if (!tab) {
    return summary;
  }

  const variableCount = variables.length + missingKeys.length;
  const blockNumbers = expanded ? positionsIn(tab.blocks) : null;
  const variableNumbers = expanded ? positionsIn(tab.variables) : null;

  return (
    <div className="info-references">
      <button
        type={ButtonType.BUTTON}
        className={classNames(
          CssClass.TOOLTIP_LINK,
          CssClass.TOOLTIP_LINK_PLAIN,
        )}
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        {summary}{" "}
        <span className="info-references-hint">
          {expanded ? t.info.seeLess : t.info.seeMore}
        </span>
      </button>

      {blockNumbers && blocks.length > 0 && (
        <BlockLinks
          className="info-references-line"
          tabId={tab.id}
          blocks={blocks.map((block) => ({
            block,
            number: blockNumbers.get(block) ?? 0,
          }))}
          tone={RevealTone.NEUTRAL}
          onReveal={dismiss}
        />
      )}

      {variableNumbers && variableCount > 0 && (
        <div
          className={classNames(CssClass.TOOLTIP_LINKS, "info-references-line")}
        >
          <span>{t.info.variablesIn(variableCount)}</span>

          {variables.map((variable) => {
            const number = variableNumbers.get(variable) ?? 0;
            const title = t.info.variableLink(number, getVariableKey(variable));

            return canRevealVariables ? (
              <button
                key={variable.id}
                type={ButtonType.BUTTON}
                className={CssClass.TOOLTIP_LINK}
                title={title}
                onClick={() => {
                  dismiss();
                  revealVariable(variable.id, RevealTone.NEUTRAL);
                }}
              >
                {number}
              </button>
            ) : (
              <span key={variable.id} title={title}>
                {number}
              </span>
            );
          })}

          {missingKeys.map((key) => (
            <span key={key}>
              <code className={CssClass.NOTE_CODE} title={t.info.undefinedKey}>
                {key}
              </code>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
