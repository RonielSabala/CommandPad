import { BLOCK_TYPE_ORDER } from "@/blocks";
import { AddRow } from "@/components/common/addRow/AddRow";
import { useTranslation } from "@/i18n";
import { useStoreActions } from "@/store/store";

import { getBlockIcon } from "./blockViews";

export function AddBlockRow() {
  const t = useTranslation();
  const { addBlock } = useStoreActions();

  return (
    <AddRow
      label={t.blocks.newBlockLabel}
      items={BLOCK_TYPE_ORDER.map((type) => {
        const label = t.blocks.typeLabel[type];
        return {
          key: type,
          icon: getBlockIcon(type),
          label,
          title: t.blocks.typeTitle(label),
          info: t.blocks.typeInfo[type],
          onAdd: () => void addBlock(type),
        };
      })}
    />
  );
}
