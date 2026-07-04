import { ElementId } from "@/common/constants/dom";
import { BlockType } from "@/common/enums";
import { useStore } from "@/store/store";

export function AddBlockRow() {
  const addBlock = useStore((s) => s.addBlock);

  return (
    <div id={ElementId.ADD_BLOCK_ROW}>
      <p className="section-title new-block-row-label no-user-select">
        NEW BLOCK
      </p>
      <button
        className="btn"
        onClick={() => void addBlock(BlockType.COMMAND)}
        title="Command block"
      >
        <svg viewBox="0 0 16 16" width="13" height="13">
          <polyline points="2,4 5,4" />
          <polyline points="2,8 8,8" />
          <polyline points="8,4 14,8 8,12" />
        </svg>
        Command
      </button>
      <button
        className="btn"
        onClick={() => void addBlock(BlockType.NOTE)}
        title="Note block"
      >
        <svg viewBox="0 0 16 16" width="13" height="13">
          <path d="M3 3h10v8l-3 3H3z" />
          <path d="M10 11v3" />
        </svg>
        Note
      </button>
      <button
        className="btn"
        onClick={() => void addBlock(BlockType.DIVIDER)}
        title="Divider block"
      >
        <svg viewBox="0 0 16 16">
          <path d="M1 8 C3 5, 5 11, 7 8 S11 5, 13 8 S15 5, 15 8" />
        </svg>
        Divider
      </button>
    </div>
  );
}
