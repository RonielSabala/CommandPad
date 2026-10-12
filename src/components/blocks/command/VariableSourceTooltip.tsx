import { CssClass } from "@/common/constants/css";
import { AppMode } from "@/common/enums";
import type { RichTooltipControls } from "@/components/common/tooltip/richTooltip";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { getVariableKey, sourceKey } from "@/utils/resolution";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { lazy, startTransition, Suspense, useContext, useState } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";

import { EmbedScopeContext } from "../runbook/embedContext";
import "./VariableSourceTooltip.css";

const loadEditor = () => import("./VariableTooltipEditor");

const VariableTooltipEditor = lazy(async () => ({
  default: (await loadEditor()).VariableTooltipEditor,
}));

const preloadEditor = () => void loadEditor();

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

  const edit = () => {
    tip.pin();
    startTransition(() => setEditingId(hostVariable?.id));
  };

  const goToText = defined && (
    <button
      type="button"
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
          type="button"
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
        <div className="variable-source-tooltip is-editing">
          {goToText}
          <VariableTooltipEditor variableId={editedId} />
        </div>
      ) : (
        <div className="variable-source-tooltip">
          <span>{source}</span>

          {hostVariable && (
            <button
              type="button"
              className={LINK_CLASS}
              title={
                readMode
                  ? t.command.editValueTitle(key)
                  : t.command.editVariableTitle(key)
              }
              onPointerEnter={preloadEditor}
              onFocus={preloadEditor}
              onClick={edit}
            >
              {t.command.editVariable}
            </button>
          )}

          {goToLink}
        </div>
      )}
    </Suspense>
  );
}
