import { CssClass } from "@/common/constants/css";
import { AppMode, BlockType, UnresolvedCause } from "@/common/enums";
import type { Block, Tab } from "@/common/types";
import { getTabVariableMap } from "@/hooks/useTabUnresolved";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { isEmbedBlockUnresolved } from "@/utils/embeddedRunbook";
import {
  getSecretKeys,
  getVariableKey,
  sourceKey,
  unresolvedBlockParts,
  type UnresolvedPart,
} from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useMemo } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";

import "./TabUnresolvedTooltip.css";

const CAUSE_ORDER = Object.values(UnresolvedCause);

interface Problem {
  cause: UnresolvedCause;
  label: string;
  key?: string;
  blocks: { block: Block; number: number }[];
}

function partLabel(part: UnresolvedPart): string {
  return part.cause === UnresolvedCause.FAILED ? part.text : part.source;
}

interface Props {
  tab: Tab;
  hide: () => void;
}

export function TabUnresolvedTooltip({ tab, hide }: Props) {
  const t = useTranslation();
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const library = useStore((state) => state.runbookLibrary);
  const embeddedRunbooks = useStore((state) => state.embeddedRunbooks);
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
        problem = { cause, label, key, blocks: [] };
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
      const parts = unresolvedBlockParts(block, variableMap, secretKeys);

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
  }, [tab.blocks, variableMap, secretKeys, library, embeddedRunbooks]);

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

  const goToVariable = (variableId: string) => {
    hide();
    switchTab(tab.id);
    revealVariable(variableId, false);
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
            className={classNames(
              CssClass.TOOLTIP_LINK,
              CssClass.TOOLTIP_LINK_PLAIN,
            )}
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
        <button
          type="button"
          className={classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON)}
          aria-label={t.command.goToDefinition}
          title={t.command.goToDefinitionTitle(key)}
          onClick={() => goToVariable(variableId)}
        >
          <BoxArrowUpRight className={CssClass.ICON_SM} />
        </button>
      )
    );
  };

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
                    <code className="tab-unresolved-label">
                      {problem.label}
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
