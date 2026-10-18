import { CssClass } from "@/common/constants/css";
import { ButtonType } from "@/common/constants/dom";
import { AppMode } from "@/common/enums";
import type { RichTooltipControls } from "@/components/common/tooltip/richTooltip";
import {
  LazyVariableTooltipEditor,
  preloadVariableTooltipEditor,
} from "@/components/variables/lazyVariableTooltipEditor";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { getVariableKey, sourceKey } from "@/utils/resolution";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { startTransition, Suspense, useContext, useState } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";

import { EmbedScopeContext } from "../runbook/embedContext";
import "./VariableSourceTooltip.css";

const LINK_CLASS = classNames(
  CssClass.TOOLTIP_LINK,
  CssClass.TOOLTIP_LINK_PLAIN,
);

interface Props {
  source: string;
  resolved: boolean;
  tip: RichTooltipControls;
}

export function VariableSourceTooltip({ source, resolved, tip }: Props) {
  const t = useTranslation();
  const embed = useContext(EmbedScopeContext);
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const revealVariable = useStore((state) => state.revealVariable);
  const revealEmbeddedVariable = useStore(
    (state) => state.revealEmbeddedVariable,
  );
  const activeTabId = useStore((state) => getActiveTab(state)?.id);
  const defineVariable = useStore((state) => state.defineVariable);

  // Pinned while editing
  const [editingId, setEditingId] = useState<string>();
  const editedId = tip.pinned ? editingId : undefined;
  const hostVariable = useStore((state) => {
    const variables = embed ? undefined : getActiveTab(state)?.variables;
    return editedId
      ? variables?.find((v) => v.id === editedId)
      : variables?.find((v) => getVariableKey(v) === sourceKey(source));
  });

  const key = hostVariable ? getVariableKey(hostVariable) : sourceKey(source);
  const defined = embed
    ? embed.variables.some((v) => getVariableKey(v) === key)
    : !!hostVariable;

  const title = embed
    ? t.command.goToEmbeddedDefinitionTitle(
        key,
        embed.source.local
          ? displayLabel(embed.source.local.label, t)
          : embed.source.cloud.path,
      )
    : t.command.goToDefinitionTitle(key);

  const goToDefinition = () => {
    tip.hide();
    if (embed) {
      void revealEmbeddedVariable(embed.source, key, resolved);
    } else if (hostVariable) {
      revealVariable(hostVariable.id, resolved);
    }
  };

  const edit = (variableId: string | undefined) => {
    tip.pin();
    startTransition(() => setEditingId(variableId));
  };

  const create = () => {
    const variableId = activeTabId && defineVariable(activeTabId, key);
    if (variableId) {
      edit(variableId);
    }
  };

  const goToText = defined && (
    <button
      type={ButtonType.BUTTON}
      className={LINK_CLASS}
      title={title}
      onClick={goToDefinition}
    >
      {t.command.goToDefinition}
      <BoxArrowUpRight className={CssClass.ICON_SM} />
    </button>
  );

  const goToLink = embed
    ? goToText
    : defined && (
        <button
          type={ButtonType.BUTTON}
          className={classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON)}
          aria-label={t.command.goToDefinition}
          title={title}
          onClick={goToDefinition}
        >
          <BoxArrowUpRight className={CssClass.ICON_SM} />
        </button>
      );

  return (
    <Suspense>
      {editedId ? (
        <LazyVariableTooltipEditor variableId={editedId} header={goToText} />
      ) : (
        <div className="variable-source-tooltip">
          <span>{source}</span>

          {hostVariable && (
            <button
              type={ButtonType.BUTTON}
              className={LINK_CLASS}
              title={
                readMode
                  ? t.command.editValueTitle(key)
                  : t.command.editVariableTitle(key)
              }
              onPointerEnter={preloadVariableTooltipEditor}
              onFocus={preloadVariableTooltipEditor}
              onClick={() => edit(hostVariable.id)}
            >
              {t.command.editVariable}
            </button>
          )}

          {!embed && !hostVariable && !readMode && (
            <button
              type={ButtonType.BUTTON}
              className={LINK_CLASS}
              title={t.tabs.defineVariableTitle(key)}
              onPointerEnter={preloadVariableTooltipEditor}
              onFocus={preloadVariableTooltipEditor}
              onClick={create}
            >
              {t.tabs.defineVariable}
            </button>
          )}

          {goToLink}
        </div>
      )}
    </Suspense>
  );
}
