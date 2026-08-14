import type { BlockType } from "@/common/enums";
import type { Block, BlockOfType } from "@/common/types";

export interface BlockJsonSchema {
  properties: Record<string, unknown>;
  required?: string[];
}

export interface BlockDefinition<T extends BlockType = BlockType> {
  type: T;
  jsonSchema: BlockJsonSchema;

  create(id: string): BlockOfType<T>;

  /** Coerce a block that came from storage or an import into a valid one. */
  normalize(block: BlockOfType<T>): BlockOfType<T> | null;

  toMarkdown(
    block: BlockOfType<T>,
    context: BlockMarkdownContext,
  ): string | null;

  commandTexts?: BlockCommandTexts<T>;
  getLabelText?(block: BlockOfType<T>): string | null;
}

export interface BlockMarkdownContext {
  /** Resolve variable references in command-grammar text. */
  resolve(text: string): string;
}

export interface BlockCommandTexts<T extends BlockType> {
  get(block: BlockOfType<T>): string[];
  map(
    block: BlockOfType<T>,
    transform: (text: string) => string,
  ): BlockOfType<T>;
}

export type BlockDefinitions = {
  [T in BlockType]: BlockDefinition<T>;
};

export interface AnyBlockDefinition {
  type: BlockType;
  create(id: string): Block;
  normalize(block: Block): Block | null;
  toMarkdown(block: Block, context: BlockMarkdownContext): string | null;
  commandTexts?: {
    get(block: Block): string[];
    map(block: Block, transform: (text: string) => string): Block;
  };
  getLabelText?(block: Block): string | null;
}
