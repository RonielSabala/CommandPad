import { BlockType } from "@/common/enums";
import { CommandIcon, DividerIcon, NoteIcon } from "@/components/icons";
import type { ComponentType } from "react";

export type BlockTypeIcon = ComponentType<{ className?: string }>;

export const BLOCK_TYPE_ICONS: Record<BlockType, BlockTypeIcon> = {
  [BlockType.COMMAND]: CommandIcon,
  [BlockType.NOTE]: NoteIcon,
  [BlockType.DIVIDER]: DividerIcon,
};

export const BLOCK_TYPE_ORDER: BlockType[] = [
  BlockType.COMMAND,
  BlockType.NOTE,
  BlockType.DIVIDER,
];
