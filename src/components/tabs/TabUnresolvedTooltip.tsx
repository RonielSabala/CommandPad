import { TabUnresolvedConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { AppMode, BlockType, UnresolvedCause } from "@/common/enums";
import type { Block, Tab } from "@/common/types";
import type { RichTooltipControls } from "@/components/common/tooltip/richTooltip";
import {
  LazyVariableTooltipEditor,
  preloadVariableTooltipEditor,
} from "@/components/variables/lazyVariableTooltipEditor";
import { getBlockLookupMap, getTabVariableMap } from "@/hooks/useTabUnresolved";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { isEmbedBlockUnresolved } from "@/utils/embeddedRunbook";
import {
  getSecretKeys,
  getVariableKey,
  sourceKey,
  unresolvedBlockParts,
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

const LINK_CLASS = classNames(
  CssClass.TOOLTIP_LINK,
  CssClass.TOOLTIP_LINK_PLAIN,
);

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
  const revealBlock = useStore((state) => state.revealBlock);
  const switchTab = useStore((state) => state.switchTab);
  const revealVariable = useStore((state) => state.revealVariable);
  const defineVariable = useStore((state) => state.defineVariable);

  const variableMap = getTabVariableMap(tab.variables);
  const secretKeys = useMemo(
    () => getSecretKeys(tab.variables),
    [tab.variables],
  );

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
      const lookupMap = getBlockLookupMap(block, variableMap, embedLookup);
      const parts = lookupMap
        ? unresolvedBlockParts(block, lookupMap, secretKeys)
        : [];

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
    revealVariable(variableId, false);
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
            type="button"
            className={LINK_CLASS}
            title={t.tabs.defineVariableTitle(key)}
            onClick={() => {
              hide();
              defineVariable(tab.id, key);
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
              type="button"
              className={LINK_CLASS}
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
            type="button"
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
              type="button"
              className={LINK_CLASS}
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
    <div className="tab-unresolved-tooltip">
      <p className="tab-unresolved-title">
        {t.tabs.unresolvedSummary(problemCount, blockCount)}
      </p>

      <div className="tab-unresolved-list">
        {groups.map(([cause, problems]) => (
          <section key={cause}>
            <p className="tab-unresolved-cause">
              {t.tabs.unresolvedCause[cause]}
            </p>

            <ul className="tab-unresolved-table">
              {problems.map((problem) => (
                <li key={problem.label} className="tab-unresolved-row">
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

                  <div className="tab-unresolved-blocks">
                    <span>{t.tabs.unresolvedIn(problem.blocks.length)}</span>
                    {problem.blocks.map(({ block, number }) => (
                      <button
                        key={block.id}
                        type="button"
                        className={CssClass.TOOLTIP_LINK}
                        title={t.tabs.unresolvedBlock(
                          number,
                          t.blocks.typeLabel[block.type],
                        )}
                        onClick={() => {
                          hide();
                          revealBlock(tab.id, block.id);
                        }}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
