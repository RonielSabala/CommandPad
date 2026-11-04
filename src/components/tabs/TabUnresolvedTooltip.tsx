import { TabUnresolvedConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { ButtonType } from "@/common/constants/dom";
import {
  AppMode,
  BlockType,
  RevealTone,
  UnresolvedCause,
} from "@/common/enums";
import type { Block, Tab } from "@/common/types";
import { FramedSection } from "@/components/common/FramedSection";
import { BlockLinks } from "@/components/common/tooltip/BlockLinks";
import type { RichTooltipControls } from "@/components/common/tooltip/richTooltip";
import { PLAIN_TOOLTIP_LINK } from "@/components/common/tooltip/tooltip";
import {
  LazyVariableTooltipEditor,
  preloadVariableTooltipEditor,
} from "@/components/variables/lazyVariableTooltipEditor";
import { getBlockUnresolvedParts } from "@/hooks/useTabUnresolved";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { isEmbedBlockUnresolved } from "@/utils/embeddedRunbook";
import {
  getTabSecretKeys,
  getTabVariableMap,
  getVariableKey,
  sourceKey,
  type UnresolvedPart,
} from "@/utils/resolution";
import { abbreviate, classNames } from "@/utils/string";
import { startTransition, Suspense, useMemo, useState } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";

import "./TabUnresolvedTooltip.css";

const CAUSE_ORDER = Object.values(UnresolvedCause);

const EDITABLE_CAUSES: ReadonlySet<UnresolvedCause> = new Set([
  UnresolvedCause.EMPTY,
  UnresolvedCause.BLANK,
]);

interface Problem {
  cause: UnresolvedCause;
  label: string;
  shortLabel: string;
  key?: string;
  blocks: { block: Block; number: number }[];
}

function partLabel(part: UnresolvedPart): string {
  return part.cause === UnresolvedCause.FAILED ? part.text : part.source;
}

interface Props {
  tab: Tab;
  tip: RichTooltipControls;
}

export function TabUnresolvedTooltip({ tab, tip }: Props) {
  const t = useTranslation();
  const { hide } = tip;
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const isActive = useStore((state) => getActiveTab(state)?.id === tab.id);
  const library = useStore((state) => state.runbookLibrary);
  const embeddedRunbooks = useStore((state) => state.embeddedRunbooks);
  const tabs = useStore((state) => state.tabs);
  const switchTab = useStore((state) => state.switchTab);
  const revealVariable = useStore((state) => state.revealVariable);
  const defineVariable = useStore((state) => state.defineVariable);

  const variableMap = getTabVariableMap(tab.variables);
  const secretKeys = getTabSecretKeys(tab.variables);

  const { groups, problemCount, blockCount } = useMemo(() => {
    const found = new Map<string, Problem>();
    const byCause = new Map<UnresolvedCause, Problem[]>();
    const embedLookup = { runbookLibrary: library, embeddedRunbooks, tabs };
    let blockCount = 0;

    const report = (
      block: Block,
      number: number,
      cause: UnresolvedCause,
      label: string,
      key?: string,
    ) => {
      const id = `${cause}\n${label}`;
      let problem = found.get(id);

      if (!problem) {
        problem = {
          cause,
          label,
          shortLabel: abbreviate(label, TabUnresolvedConfig.MAX_LABEL_LENGTH),
          key,
          blocks: [],
        };
        found.set(id, problem);

        const group = byCause.get(cause) ?? [];
        byCause.set(cause, group);
        group.push(problem);
      }

      // A block breaking twice on the same thing is listed once
      if (problem.blocks.at(-1)?.block !== block) {
        problem.blocks.push({ block, number });
      }
    };

    tab.blocks.forEach((block, index) => {
      const number = index + 1;
      const parts = getBlockUnresolvedParts(
        block,
        variableMap,
        secretKeys,
        embedLookup,
      );

      for (const part of parts) {
        report(
          block,
          number,
          part.cause,
          partLabel(part),
          sourceKey(part.source) || undefined,
        );
      }

      const missing =
        block.type === BlockType.RUNBOOK &&
        isEmbedBlockUnresolved(block, library, embeddedRunbooks);

      if (missing) {
        report(
          block,
          number,
          UnresolvedCause.MISSING_RUNBOOK,
          block.cloud?.path || block.label,
        );
      }

      if (parts.length > 0 || missing) {
        blockCount += 1;
      }
    });

    const groups = [...byCause].sort(
      ([a], [b]) => CAUSE_ORDER.indexOf(a) - CAUSE_ORDER.indexOf(b),
    );

    return { groups, problemCount: found.size, blockCount };
  }, [tab.blocks, variableMap, secretKeys, library, embeddedRunbooks, tabs]);

  const variableIds = useMemo(
    () =>
      new Map(
        tab.variables.map((variable) => [
          getVariableKey(variable),
          variable.id,
        ]),
      ),
    [tab.variables],
  );

  // Pinned while editing
  const [editing, setEditing] = useState<{ id: string; key: string }>();
  const edited = tip.pinned ? editing : undefined;

  const goToVariable = (variableId: string) => {
    hide();
    switchTab(tab.id);
    revealVariable(variableId, RevealTone.UNRESOLVED);
  };

  const edit = (id: string, key: string) => {
    tip.pin();
    startTransition(() => setEditing({ id, key }));
  };

  const action = ({ cause, key }: Problem) => {
    if (!key) {
      return null;
    }

    if (cause === UnresolvedCause.UNDEFINED) {
      return (
        !readMode && (
          <button
            type={ButtonType.BUTTON}
            className={PLAIN_TOOLTIP_LINK}
            title={t.tabs.defineVariableTitle(key)}
            onPointerEnter={preloadVariableTooltipEditor}
            onFocus={preloadVariableTooltipEditor}
            onClick={() => {
              const variableId = defineVariable(tab.id, key);
              if (!variableId) {
                return;
              }

              if (isActive) {
                edit(variableId, key);
              } else {
                goToVariable(variableId);
              }
            }}
          >
            {t.tabs.defineVariable}
          </button>
        )
      );
    }

    const variableId = variableIds.get(key);
    return (
      variableId && (
        <>
          {isActive && EDITABLE_CAUSES.has(cause) && (
            <button
              type={ButtonType.BUTTON}
              className={PLAIN_TOOLTIP_LINK}
              title={
                readMode
                  ? t.command.editValueTitle(key)
                  : t.command.editVariableTitle(key)
              }
              onPointerEnter={preloadVariableTooltipEditor}
              onFocus={preloadVariableTooltipEditor}
              onClick={() => edit(variableId, key)}
            >
              {t.command.editVariable}
            </button>
          )}
          <button
            type={ButtonType.BUTTON}
            className={classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON)}
            aria-label={t.command.goToDefinition}
            title={t.command.goToDefinitionTitle(key)}
            onClick={() => goToVariable(variableId)}
          >
            <BoxArrowUpRight className={CssClass.ICON_SM} />
          </button>
        </>
      )
    );
  };

  if (edited) {
    return (
      <Suspense>
        <LazyVariableTooltipEditor
          variableId={edited.id}
          header={
            <button
              type={ButtonType.BUTTON}
              className={PLAIN_TOOLTIP_LINK}
              title={t.command.goToDefinitionTitle(edited.key)}
              onClick={() => goToVariable(edited.id)}
            >
              {t.command.goToDefinition}
              <BoxArrowUpRight className={CssClass.ICON_SM} />
            </button>
          }
        />
      </Suspense>
    );
  }

  return (
    <div
      className={classNames(CssClass.TOOLTIP_PANEL, "tab-unresolved-tooltip")}
    >
      <p className={CssClass.TOOLTIP_TITLE}>
        {t.tabs.unresolvedSummary(problemCount, blockCount)}
      </p>

      <div
        className={classNames(
          "tab-unresolved-list",
          CssClass.FRAMED_SECTIONS,
          CssClass.TOOLTIP_SCROLL,
        )}
      >
        {groups.map(([cause, problems]) => (
          <FramedSection
            key={cause}
            title={t.tabs.unresolvedCause[cause]}
            striped
          >
            <ul className="tab-unresolved-table">
              {problems.map((problem) => (
                <li
                  key={problem.label}
                  className={classNames(
                    "tab-unresolved-row",
                    CssClass.FRAMED_ROW,
                  )}
                >
                  <div className="tab-unresolved-problem">
                    <code
                      className="tab-unresolved-label"
                      title={
                        problem.shortLabel === problem.label
                          ? undefined
                          : problem.label
                      }
                    >
                      {problem.shortLabel}
                    </code>
                    {action(problem)}
                  </div>

                  <BlockLinks
                    tabId={tab.id}
                    blocks={problem.blocks}
                    tone={RevealTone.UNRESOLVED}
                    onReveal={hide}
                  />
                </li>
              ))}
            </ul>
          </FramedSection>
        ))}
      </div>
    </div>
  );
}
