import { BlockType } from "@/common/enums";
import type { Block, BlockOfType } from "@/common/types";
import {
  CommandIcon,
  DividerIcon,
  ImageIcon,
  NoteIcon,
} from "@/components/icons";
import type { VariableMap } from "@/utils/resolution";
import type { ComponentType } from "react";

import { CommandBlock } from "./command/CommandBlock";
import { DividerBlock } from "./divider/DividerBlock";
import { ImageBlock } from "./image/ImageBlock";
import { NoteBlock } from "./note/NoteBlock";

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
  [BlockType.COMMAND]: { icon: CommandIcon, Component: CommandBlock },
  [BlockType.NOTE]: { icon: NoteIcon, Component: NoteBlock },
  [BlockType.IMAGE]: { icon: ImageIcon, Component: ImageBlock },
  [BlockType.DIVIDER]: { icon: DividerIcon, Component: DividerBlock },
};

export function getBlockIcon(type: BlockType): BlockIcon {
  return BLOCK_VIEWS[type].icon;
}

export function getBlockComponent(
  type: BlockType,
): ComponentType<BlockViewProps> {
  return BLOCK_VIEWS[type].Component as ComponentType<BlockViewProps>;
}
