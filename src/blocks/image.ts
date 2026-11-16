import { BlockJsonField, JsonSchemaType } from "@/common/editorConfig";
import { BlockType } from "@/common/enums";
import { MarkdownSyntax } from "@/common/markdownSyntax";
import { normalizeImageSrc } from "@/utils/image";
import { isString } from "@/utils/typeGuards";
import type { BlockDefinition } from "./types";

export const imageBlockDefinition: BlockDefinition<typeof BlockType.IMAGE> = {
  type: BlockType.IMAGE,
  jsonSchema: {
    properties: {
      [BlockJsonField.SRC]: { type: JsonSchemaType.STRING },
      [BlockJsonField.ALT]: { type: JsonSchemaType.STRING },
    },
    required: [BlockJsonField.SRC],
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
