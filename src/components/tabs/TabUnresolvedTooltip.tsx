import { SECRET_MASK, TabUnresolvedConfig } from "@/common/config";
import { BlockType } from "@/common/enums";
import type { Tab } from "@/common/types";
import { getTabVariableMap } from "@/hooks/useTabUnresolved";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { isEmbedBlockUnresolved } from "@/utils/embeddedRunbook";
import {
  getSecretKeys,
  isMaskedSegment,
  resolveCommandSegments,
  unresolvedBlockText,
  type VariableMap,
} from "@/utils/resolution";
import { useMemo } from "react";

import "./TabUnresolvedTooltip.css";

const WHITESPACE = /\s/;

/** One line of what a block reads from where it stops resolving. */
function unresolvedExcerpt(
  text: string | null,
  variableMap: VariableMap,
  secretKeys: ReadonlySet<string>,
): string | undefined {
  if (!text) {
    return undefined;
  }

  let excerpt = "";
  let length = 0;
  let pendingSpace = false;

  for (const segment of resolveCommandSegments(text, variableMap)) {
    const shown = isMaskedSegment(segment, secretKeys)
      ? SECRET_MASK
      : segment.text;

    for (const character of shown) {
      if (WHITESPACE.test(character)) {
        pendingSpace = length > 0;
        continue;
      }

      if (length + Number(pendingSpace) >= TabUnresolvedConfig.EXCERPT_LENGTH) {
        return excerpt + TabUnresolvedConfig.ELLIPSIS;
      }

      if (pendingSpace) {
        excerpt += " ";
        length += 1;
        pendingSpace = false;
      }

      excerpt += character;
      length += 1;
    }
  }

  return excerpt;
}

interface Props {
  tab: Tab;
  hide: () => void;
}

export function TabUnresolvedTooltip({ tab, hide }: Props) {
  const t = useTranslation();
  const library = useStore((state) => state.runbookLibrary);
  const embeddedRunbooks = useStore((state) => state.embeddedRunbooks);
  const revealBlock = useStore((state) => state.revealBlock);

  const variableMap = getTabVariableMap(tab.variables);
  const secretKeys = useMemo(
    () => getSecretKeys(tab.variables),
    [tab.variables],
  );

  const unresolved = useMemo(
    () =>
      tab.blocks.flatMap((block, index) => {
        const text = unresolvedBlockText(block, variableMap);
        return text !== null ||
          (block.type === BlockType.RUNBOOK &&
            isEmbedBlockUnresolved(block, library, embeddedRunbooks))
          ? [
              {
                block,
                number: index + 1,
                excerpt: unresolvedExcerpt(text, variableMap, secretKeys),
              },
            ]
          : [];
      }),
    [tab.blocks, variableMap, secretKeys, library, embeddedRunbooks],
  );

  return (
    <div className="tab-unresolved-tooltip">
      <p className="tab-unresolved-title">{t.tabs.unresolvedTitle}</p>
      <ul className="tab-unresolved-list">
        {unresolved.map(({ block, number, excerpt }) => (
          <li key={block.id}>
            <button
              type="button"
              className="tab-unresolved-link"
              title={excerpt}
              onClick={() => {
                hide();
                revealBlock(tab.id, block.id);
              }}
            >
              {t.tabs.unresolvedBlock(number, t.blocks.typeLabel[block.type])}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
