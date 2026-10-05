import { BlockField, JsonSchemaType } from "@/common/editorConfig";
import { BlockType, NoteStyle } from "@/common/enums";
import { MarkdownSyntax } from "@/common/markdownSyntax";
import { isEnumValue, isString } from "@/utils/typeGuards";
import type { BlockDefinition } from "./types";

const MARKDOWN_PREFIX: Record<NoteStyle, string> = {
  [NoteStyle.HEADING]: `${MarkdownSyntax.HEADING} `,
  [NoteStyle.SUBHEADING]: `${MarkdownSyntax.SUBHEADING} `,
  [NoteStyle.BODY]: "",
};

export const noteBlockDefinition: BlockDefinition<typeof BlockType.NOTE> = {
  type: BlockType.NOTE,
  jsonSchema: {
    properties: {
      [BlockField.TEXT]: { type: JsonSchemaType.STRING },
      [BlockField.STYLE]: { enum: Object.values(NoteStyle) },
    },
    required: [BlockField.TEXT],
  },

  create: (id) => ({
    id,
    type: BlockType.NOTE,
    text: "",
    style: NoteStyle.BODY,
  }),

  normalize: (block) => ({
    ...block,
    text: isString(block.text) ? block.text : "",
    style: isEnumValue(NoteStyle, block.style) ? block.style : NoteStyle.BODY,
  }),

  toMarkdown: (block) =>
    `${MARKDOWN_PREFIX[block.style ?? NoteStyle.BODY]}${block.text}`,

  getLabelText: (block) => block.text,
};
