import { MarkdownSyntax } from "@/common/config";
import { BlockType } from "@/common/enums";
import type { BlockDefinition } from "./types";

export const dividerBlockDefinition: BlockDefinition<typeof BlockType.DIVIDER> =
  {
    type: BlockType.DIVIDER,
    create: (id) => ({ id, type: BlockType.DIVIDER }),
    normalize: (block) => block,
    toMarkdown: () => MarkdownSyntax.DIVIDER,
  };
