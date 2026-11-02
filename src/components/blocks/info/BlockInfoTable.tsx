import type { Block } from "@/common/types";
import { InfoTable, type InfoRow } from "@/components/common/info/InfoTable";
import { useTranslation } from "@/i18n";
import { getActiveBlocks, useStore } from "@/store/store";

interface Props {
  block: Block;
  rows: InfoRow[];
}

export function BlockInfoTable({ block, rows }: Props) {
  const t = useTranslation();
  const blocks = useStore(getActiveBlocks);
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
