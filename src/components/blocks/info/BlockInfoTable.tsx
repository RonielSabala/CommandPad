import type { Block } from "@/common/types";
import { InfoTable, type InfoRow } from "@/components/common/info/InfoTable";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";

const NO_BLOCKS: Block[] = [];

interface Props {
  block: Block;
  rows: InfoRow[];
}

export function BlockInfoTable({ block, rows }: Props) {
  const t = useTranslation();
  const blocks = useStore((state) => getActiveTab(state)?.blocks ?? NO_BLOCKS);
  const blockId = block.id;
  const type = t.blocks.typeLabel[block.type];

  const index = blocks.findIndex(({ id }) => id === blockId);

  return (
    <InfoTable
      title={t.info.blockTitle(type)}
      rows={[
        { label: t.info.rows.type, value: type },
        {
          label: t.info.rows.position,
          value:
            index === -1 ? null : t.info.position(index + 1, blocks.length),
        },
        ...rows,
      ]}
    />
  );
}
