import { BlockType } from "@/common/enums";
import type { Block, DividerBlock } from "@/common/types";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { useMemo } from "react";

import type { BlockViewProps } from "../blockViews";
import { BlockInfoTable } from "./BlockInfoTable";

const NO_BLOCKS: Block[] = [];

/** The blocks between `dividerId` and the next divider. */
function countSectionBlocks(blocks: Block[], dividerId: string): number | null {
  let count: number | null = null;

  for (const { id, type } of blocks) {
    if (count === null) {
      if (id === dividerId) {
        count = 0;
      }
    } else if (type === BlockType.DIVIDER) {
      return count;
    } else {
      count++;
    }
  }

  return null;
}

export function DividerInfo({ block }: BlockViewProps<DividerBlock>) {
  const t = useTranslation();
  const format = useInfoFormat();
  const blockId = block.id;

  const blocks = useStore((state) => getActiveTab(state)?.blocks ?? NO_BLOCKS);
  const sectionLength = useMemo(
    () => countSectionBlocks(blocks, blockId),
    [blocks, blockId],
  );

  return (
    <BlockInfoTable
      block={block}
      rows={[
        {
          label: t.info.rows.blocksInSection,
          value: sectionLength === null ? null : format.count(sectionLength),
        },
      ]}
    />
  );
}
