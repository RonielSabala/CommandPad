import { BLOCK_TYPE_ORDER } from "@/blocks";
import { AddRow } from "@/components/common/AddRow";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";

import { getBlockIcon } from "./blockViews";

export function AddBlockRow() {
  const t = useTranslation();
  const addBlock = useStore((state) => state.addBlock);

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
          onAdd: () => void addBlock(type),
        };
      })}
    />
  );
}
