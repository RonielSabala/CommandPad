import { BlockField, JsonSchemaType } from "@/common/config";
import { BlockType } from "@/common/enums";
import { MarkdownSyntax } from "@/common/markdownSyntax";
import { normalizeImageSrc } from "@/utils/image";
import { isString } from "@/utils/typeGuards";
import type { BlockDefinition } from "./types";

export const imageBlockDefinition: BlockDefinition<typeof BlockType.IMAGE> = {
  type: BlockType.IMAGE,
  jsonSchema: {
    properties: {
      [BlockField.SRC]: { type: JsonSchemaType.STRING },
      [BlockField.ALT]: { type: JsonSchemaType.STRING },
    },
    required: [BlockField.SRC],
  },

  create: (id) => ({ id, type: BlockType.IMAGE, src: "" }),

  normalize: (block) => ({
    ...block,
    src: normalizeImageSrc(block.src),
    alt: isString(block.alt) ? block.alt : undefined,
  }),

  toMarkdown: (block) =>
    block.src ? MarkdownSyntax.IMAGE(block.alt ?? "", block.src) : null,
};
