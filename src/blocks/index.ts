import { BlockType } from "@/common/enums";
import type { Block } from "@/common/types";
import { generateId } from "@/utils/id";
import { isObject } from "@/utils/typeGuards";

import { commandBlockDefinition } from "./command";
import { dividerBlockDefinition } from "./divider";
import { imageBlockDefinition } from "./image";
import { noteBlockDefinition } from "./note";
import type {
  AnyBlockDefinition,
  BlockDefinitions,
  BlockMarkdownContext,
} from "./types";
export type {
  BlockDefinition,
  BlockDefinitions,
  BlockMarkdownContext
} from "./types";

export const BLOCK_DEFINITIONS: BlockDefinitions = {
  [BlockType.COMMAND]: commandBlockDefinition,
  [BlockType.NOTE]: noteBlockDefinition,
  [BlockType.IMAGE]: imageBlockDefinition,
  [BlockType.DIVIDER]: dividerBlockDefinition,
};

export const BLOCK_TYPE_ORDER: readonly BlockType[] = [
  BlockType.COMMAND,
  BlockType.NOTE,
  BlockType.IMAGE,
  BlockType.DIVIDER,
];

export function isBlockType(value: unknown): value is BlockType {
  return Object.values(BlockType).includes(value as BlockType);
}

function definitionFor(block: Block): AnyBlockDefinition {
  return BLOCK_DEFINITIONS[block.type];
}

export function createBlock(type: BlockType): Block {
  return BLOCK_DEFINITIONS[type].create(generateId());
}

/** Coerce an untrusted block into a valid one */
export function normalizeBlock(raw: unknown): Block | null {
  if (!isObject(raw) || !isBlockType(raw.type)) {
    return null;
  }

  const block = { ...raw, id: raw.id || generateId() } as Block;
  return definitionFor(block).normalize(block);
}

export function blockToMarkdown(
  block: Block,
  context: BlockMarkdownContext,
): string | null {
  return definitionFor(block).toMarkdown(block, context);
}

export function getBlockCommandTexts(block: Block): string[] {
  return definitionFor(block).commandTexts?.get(block) ?? [];
}

export function mapBlockCommandTexts(
  block: Block,
  transform: (text: string) => string,
): Block {
  return definitionFor(block).commandTexts?.map(block, transform) ?? block;
}

export function getBlockLabelText(block: Block): string | null {
  return definitionFor(block).getLabelText?.(block) ?? null;
}
