import { BlockType } from "@/common/enums";
import { MarkdownSyntax } from "@/common/markdownSyntax";
import type { BlockDefinition } from "./types";

export const dividerBlockDefinition: BlockDefinition<typeof BlockType.DIVIDER> =
  {
    type: BlockType.DIVIDER,
    jsonSchema: { properties: {} },

    create: (id) => ({ id, type: BlockType.DIVIDER }),
    normalize: (block) => block,
    toMarkdown: () => MarkdownSyntax.DIVIDER,
  };
