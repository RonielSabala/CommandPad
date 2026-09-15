import { getBlockJsonSchemas } from "@/blocks";
import {
  COMMAND_LANGUAGE_ORDER,
  JsonSchemaType,
  RunbookField,
  VariableField,
} from "@/common/editorConfig";

export const RUNBOOK_JSON_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [RunbookField.VARIABLES, RunbookField.BLOCKS],
  properties: {
    [RunbookField.VARIABLES]: {
      type: JsonSchemaType.ARRAY,
      items: {
        type: JsonSchemaType.OBJECT,
        required: [VariableField.KEY, VariableField.VALUE],
        properties: {
          [VariableField.KEY]: { type: JsonSchemaType.STRING },
          [VariableField.VALUE]: { type: JsonSchemaType.STRING },
          [VariableField.SECRET]: { type: JsonSchemaType.BOOLEAN },
          [VariableField.LANGUAGE]: { enum: [...COMMAND_LANGUAGE_ORDER] },
          [VariableField.OPTIONS]: {
            type: JsonSchemaType.ARRAY,
            items: { type: JsonSchemaType.STRING },
          },
        },
      },
    },
    [RunbookField.BLOCKS]: {
      type: JsonSchemaType.ARRAY,
      items: { oneOf: getBlockJsonSchemas() },
    },
  },
};
