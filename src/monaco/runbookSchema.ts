import { getBlockJsonSchemas } from "@/blocks";
import { JsonSchemaType, RunbookField, VariableField } from "@/common/config";

/** The import/export shape for validation inside the JSON editors. */
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
        },
      },
    },
    [RunbookField.BLOCKS]: {
      type: JsonSchemaType.ARRAY,
      items: { oneOf: getBlockJsonSchemas() },
    },
  },
};
