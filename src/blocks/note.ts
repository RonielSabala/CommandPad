import { MarkdownSyntax } from "@/common/config";
import { BlockType, NoteStyle } from "@/common/enums";
import { isString } from "@/utils/typeGuards";
import type { BlockDefinition } from "./types";

const MARKDOWN_PREFIX: Record<NoteStyle, string> = {
  [NoteStyle.HEADING]: `${MarkdownSyntax.HEADING} `,
  [NoteStyle.SUBHEADING]: `${MarkdownSyntax.SUBHEADING} `,
  [NoteStyle.BODY]: "",
};

const isNoteStyle = (value: unknown): value is NoteStyle =>
  Object.values(NoteStyle).includes(value as NoteStyle);

export const noteBlockDefinition: BlockDefinition<typeof BlockType.NOTE> = {
  type: BlockType.NOTE,

  create: (id) => ({
    id,
    type: BlockType.NOTE,
    text: "",
    style: NoteStyle.BODY,
  }),

  normalize: (block) => ({
    ...block,
    text: isString(block.text) ? block.text : "",
    style: isNoteStyle(block.style) ? block.style : NoteStyle.BODY,
  }),

  toMarkdown: (block) =>
    `${MARKDOWN_PREFIX[block.style ?? NoteStyle.BODY]}${block.text}`,

  getLabelText: (block) => block.text,
};
