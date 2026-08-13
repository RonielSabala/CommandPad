import { BlockField, JsonSchemaType } from "@/common/config";
import { BlockType } from "@/common/enums";
import { MarkdownSyntax } from "@/common/markdownSyntax";
import { joinLines } from "@/utils/string";
import { isBoolean, isString } from "@/utils/typeGuards";
import type { BlockDefinition } from "./types";

export const commandBlockDefinition: BlockDefinition<typeof BlockType.COMMAND> =
  {
    type: BlockType.COMMAND,
    jsonSchema: {
      properties: {
        [BlockField.TEXT]: { type: JsonSchemaType.STRING },
        [BlockField.EDITOR_COLLAPSED]: { type: JsonSchemaType.BOOLEAN },
      },
      required: [BlockField.TEXT],
    },

    create: (id) => ({ id, type: BlockType.COMMAND, text: "" }),

    normalize: (block) => ({
      ...block,
      text: isString(block.text) ? block.text : "",
      editorCollapsed: isBoolean(block.editorCollapsed)
        ? block.editorCollapsed
        : false,
    }),

    toMarkdown: (block, { resolve }) =>
      block.text
        ? joinLines([
            MarkdownSyntax.CODE_FENCE,
            resolve(block.text),
            MarkdownSyntax.CODE_FENCE_END,
          ])
        : null,

    commandTexts: {
      get: (block) => [block.text],
      map: (block, transform) => {
        const text = transform(block.text);
        return text === block.text ? block : { ...block, text };
      },
    },
  };
