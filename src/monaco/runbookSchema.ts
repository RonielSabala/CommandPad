import { getBlockJsonSchemas } from "@/blocks";
import {
  CODE_LANGUAGE_ORDER,
  JsonSchemaType,
  RunbookField,
  VariableJsonField,
  VariableSectionField,
} from "@/common/editorConfig";

const VARIABLE_PROPERTIES = {
  [VariableJsonField.KEY]: { type: JsonSchemaType.STRING },
  [VariableJsonField.VALUE]: { type: JsonSchemaType.STRING },
};

const TEXT_VARIABLE_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [VariableJsonField.KEY, VariableJsonField.VALUE],
  properties: {
    ...VARIABLE_PROPERTIES,
    [VariableJsonField.SECRET]: { type: JsonSchemaType.BOOLEAN },
    [VariableJsonField.LANGUAGE]: { enum: [...CODE_LANGUAGE_ORDER] },
    [VariableJsonField.OPTIONS]: false,
  },
};

const ENUM_VARIABLE_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [
    VariableJsonField.KEY,
    VariableJsonField.VALUE,
    VariableJsonField.OPTIONS,
  ],
  properties: {
    ...VARIABLE_PROPERTIES,
    [VariableJsonField.OPTIONS]: {
      type: JsonSchemaType.ARRAY,
      items: { type: JsonSchemaType.STRING },
    },
    [VariableJsonField.SECRET]: false,
    [VariableJsonField.LANGUAGE]: false,
  },
};

const SECTION_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [VariableSectionField.SECTION],
  additionalProperties: false,
  properties: {
    [VariableSectionField.SECTION]: { type: JsonSchemaType.STRING },
    [VariableSectionField.COLLAPSED]: { type: JsonSchemaType.BOOLEAN },
  },
};

export const RUNBOOK_JSON_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [RunbookField.VARIABLES, RunbookField.BLOCKS],
  properties: {
    [RunbookField.VARIABLES]: {
      type: JsonSchemaType.ARRAY,
      items: {
        oneOf: [TEXT_VARIABLE_SCHEMA, ENUM_VARIABLE_SCHEMA, SECTION_SCHEMA],
      },
    },
    [RunbookField.BLOCKS]: {
      type: JsonSchemaType.ARRAY,
      items: { oneOf: getBlockJsonSchemas() },
    },
  },
};
