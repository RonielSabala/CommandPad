import { BLOCK_TYPE_ORDER } from "@/blocks";
import { BlockType } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import "./AddBlockRow.css";
import { getBlockIcon } from "./blockViews";

interface AddBlockButtonProps {
  type: BlockType;
}

export function AddBlockButton({ type }: AddBlockButtonProps) {
  const t = useTranslation();
  const addBlock = useStore((state) => state.addBlock);
  const label = t.blocks.typeLabel[type];
  const Icon = getBlockIcon(type);

  return (
    <button
      className="btn"
      onClick={() => void addBlock(type)}
      {...tooltip(t.blocks.typeTitle(label))}
    >
      <Icon className="icon-md icon-bold" />
      {label}
    </button>
  );
}

export function AddBlockRow() {
  const t = useTranslation();
  return (
    <div id="add-block-row">
      <p className="new-block-label section-title no-user-select">
        {t.blocks.newBlockLabel}
      </p>
      {BLOCK_TYPE_ORDER.map((type) => (
        <AddBlockButton key={type} type={type} />
      ))}
    </div>
  );
}
