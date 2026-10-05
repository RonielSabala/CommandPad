import { BlockType } from "@/common/enums";
import type { Block, BlockOfType } from "@/common/types";
import {
  CommandIcon,
  DividerIcon,
  ImageIcon,
  NoteIcon,
  RunbookIcon,
} from "@/components/icons";
import type { VariableMap } from "@/utils/resolution";
import { memo, type ComponentType } from "react";

import { CommandBlock } from "./command/CommandBlock";
import { DividerBlock } from "./divider/DividerBlock";
import { ImageBlock } from "./image/ImageBlock";
import { NoteBlock } from "./note/NoteBlock";
import { RunbookBlock } from "./runbook/RunbookBlock";

export interface BlockViewProps<T extends Block = Block> {
  block: T;
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

export type BlockIcon = ComponentType<{ className?: string }>;

interface BlockView<T extends BlockType> {
  icon: BlockIcon;
  Component: ComponentType<BlockViewProps<BlockOfType<T>>>;
}

export const BLOCK_VIEWS: { [T in BlockType]: BlockView<T> } = {
  [BlockType.COMMAND]: { icon: CommandIcon, Component: memo(CommandBlock) },
  [BlockType.NOTE]: { icon: NoteIcon, Component: memo(NoteBlock) },
  [BlockType.IMAGE]: { icon: ImageIcon, Component: memo(ImageBlock) },
  [BlockType.RUNBOOK]: { icon: RunbookIcon, Component: memo(RunbookBlock) },
  [BlockType.DIVIDER]: { icon: DividerIcon, Component: memo(DividerBlock) },
};

export function getBlockIcon(type: BlockType): BlockIcon {
  return BLOCK_VIEWS[type].icon;
}

export function getBlockComponent(
  type: BlockType,
): ComponentType<BlockViewProps> {
  return BLOCK_VIEWS[type].Component as ComponentType<BlockViewProps>;
}
