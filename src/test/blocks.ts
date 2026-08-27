import { BlockType } from "@/common/enums";
import type { CommandBlock, DividerBlock, NoteBlock } from "@/common/types";

let counter = 0;

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function commandBlock(text: string): CommandBlock {
  return { id: nextId(BlockType.COMMAND), type: BlockType.COMMAND, text };
}

export function noteBlock(text: string): NoteBlock {
  return { id: nextId(BlockType.NOTE), type: BlockType.NOTE, text };
}

export function dividerBlock(): DividerBlock {
  return { id: nextId(BlockType.DIVIDER), type: BlockType.DIVIDER };
}
