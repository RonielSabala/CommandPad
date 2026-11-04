import type { Block } from "@/common/types";
import {
  InfoTable,
  type InfoSection,
} from "@/components/common/info/InfoTable";
import { useTranslation } from "@/i18n";
import { getActiveBlocks, useStore } from "@/store/store";

interface Props {
  block: Block;
  sections: InfoSection[];
}

export function BlockInfoTable({ block, sections }: Props) {
  const t = useTranslation();
  const blocks = useStore(getActiveBlocks);
  const blockId = block.id;

  const index = blocks.findIndex(({ id }) => id === blockId);

  return (
    <InfoTable
      title={t.info.blockTitle(t.blocks.typeLabel[block.type])}
      meta={index === -1 ? null : t.info.position(index + 1, blocks.length)}
      sections={sections}
    />
  );
}
