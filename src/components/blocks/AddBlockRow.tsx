import { BlockType } from "@/common/enums";
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
      <AddBlockButton
        type={BlockType.NOTE}
        icon={
          <svg viewBox="0 0 16 16" width="13" height="13">
            <path d="M3 3h10v8l-3 3H3z" />
            <path d="M10 11v3" />
          </svg>
        }
      />
      <AddBlockButton
        type={BlockType.COMMAND}
        icon={
          <svg viewBox="0 0 16 16" width="13" height="13">
            <polyline points="2,4 5,4" />
            <polyline points="2,8 8,8" />
            <polyline points="8,4 14,8 8,12" />
          </svg>
        }
      />
      <AddBlockButton
        type={BlockType.DIVIDER}
        icon={
          <svg viewBox="0 0 16 16" width="13" height="13">
            <path d="M1 8 C3 5, 5 11, 7 8 S11 5, 13 8 S15 5, 15 8" />
          </svg>
        }
      />
    </div>
  );
}
