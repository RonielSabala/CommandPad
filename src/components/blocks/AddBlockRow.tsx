import { BlockType } from "@/common/enums";
import { CommandIcon, DividerIcon, NoteIcon } from "@/components/icons";
import { useStore } from "@/store/store";
import { toTitleCase } from "@/utils/string";
import type { ComponentType } from "react";
import "./AddBlockRow.css";

interface AddBlockButtonProps {
  type: BlockType;
  icon: ComponentType<{ className?: string }>;
}

export function AddBlockButton({ type, icon: Icon }: AddBlockButtonProps) {
  const addBlock = useStore((state) => state.addBlock);

  return (
    <button
      className="btn"
      onClick={() => void addBlock(type)}
      title={`${toTitleCase(type)} block`}
    >
      <Icon className="icon-md icon-bold" />
      {toTitleCase(type)}
    </button>
  );
}

export function AddBlockRow() {
  return (
    <div id="add-block-row">
      <p className="new-block-label section-title no-user-select">NEW BLOCK</p>
      <AddBlockButton type={BlockType.COMMAND} icon={CommandIcon} />
      <AddBlockButton type={BlockType.NOTE} icon={NoteIcon} />
      <AddBlockButton type={BlockType.DIVIDER} icon={DividerIcon} />
    </div>
  );
}
