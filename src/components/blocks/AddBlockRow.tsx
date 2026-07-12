import { BlockType } from "@/common/enums";
import { CommandIcon, DividerIcon, NoteIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import type { ComponentType } from "react";
import "./AddBlockRow.css";

interface AddBlockButtonProps {
  type: BlockType;
  icon: ComponentType<{ className?: string }>;
}

export function AddBlockButton({ type, icon: Icon }: AddBlockButtonProps) {
  const t = useTranslation();
  const addBlock = useStore((state) => state.addBlock);
  const label = t.blocks.typeLabel[type];

  return (
    <button
      className="btn"
      onClick={() => void addBlock(type)}
      title={t.blocks.typeTitle(label)}
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
      <AddBlockButton type={BlockType.COMMAND} icon={CommandIcon} />
      <AddBlockButton type={BlockType.NOTE} icon={NoteIcon} />
      <AddBlockButton type={BlockType.DIVIDER} icon={DividerIcon} />
    </div>
  );
}
