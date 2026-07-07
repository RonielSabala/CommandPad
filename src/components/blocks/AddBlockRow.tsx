import { BlockType } from "@/common/enums";
import { CommandIcon, DividerIcon, NoteIcon } from "@/components/icons";
import { useStore } from "@/store/store";
import { toTitleCase } from "@/utils/string";
import type { ReactNode } from "react";
import "./AddBlockRow.css";

interface AddBlockButtonProps {
  type: BlockType;
  icon: ReactNode;
}

export function AddBlockButton({ type, icon }: AddBlockButtonProps) {
  const addBlock = useStore((state) => state.addBlock);

  return (
    <button
      className="btn"
      onClick={() => void addBlock(type)}
      title={`${toTitleCase(type)} block`}
    >
      {icon}
      {toTitleCase(type)}
    </button>
  );
}

export function AddBlockRow() {
  return (
    <div id="add-block-row">
      <p className="new-block-label section-title no-user-select">NEW BLOCK</p>
      <AddBlockButton type={BlockType.NOTE} icon={<NoteIcon />} />
      <AddBlockButton type={BlockType.COMMAND} icon={<CommandIcon />} />
      <AddBlockButton type={BlockType.DIVIDER} icon={<DividerIcon />} />
    </div>
  );
}
