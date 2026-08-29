import {
  BlockField,
  COMMAND_LANGUAGE_ORDER,
  DEFAULT_COMMAND_LANGUAGE,
  JsonSchemaType,
} from "@/common/editorConfig";
import { BlockType, CodeLanguage } from "@/common/enums";
import { MarkdownSyntax } from "@/common/markdownSyntax";
import { joinLines } from "@/utils/string";
import { isBoolean, isString } from "@/utils/typeGuards";
import type { BlockDefinition } from "./types";

const isCommandLanguage = (value: unknown): value is CodeLanguage =>
  COMMAND_LANGUAGE_ORDER.includes(value as CodeLanguage);

export const commandBlockDefinition: BlockDefinition<typeof BlockType.COMMAND> =
  {
    type: BlockType.COMMAND,
    jsonSchema: {
      properties: {
        [BlockField.TEXT]: { type: JsonSchemaType.STRING },
        [BlockField.LANGUAGE]: { enum: [...COMMAND_LANGUAGE_ORDER] },
        [BlockField.EDITOR_COLLAPSED]: { type: JsonSchemaType.BOOLEAN },
      },
      required: [BlockField.TEXT],
    },

    create: (id) => ({
      id,
      type: BlockType.COMMAND,
      text: "",
      language: DEFAULT_COMMAND_LANGUAGE,
    }),

    normalize: (block) => ({
      ...block,
      text: isString(block.text) ? block.text : "",
      language: isCommandLanguage(block.language)
        ? block.language
        : DEFAULT_COMMAND_LANGUAGE,
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
