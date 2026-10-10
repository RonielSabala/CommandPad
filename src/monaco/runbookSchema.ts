import { getBlockJsonSchemas } from "@/blocks";
import {
  COMMAND_LANGUAGE_ORDER,
  JsonSchemaType,
  RunbookField,
  VariableField,
  VariableSectionField,
} from "@/common/editorConfig";

const VARIABLE_PROPERTIES = {
  [VariableField.KEY]: { type: JsonSchemaType.STRING },
  [VariableField.VALUE]: { type: JsonSchemaType.STRING },
};

const TEXT_VARIABLE_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [VariableField.KEY, VariableField.VALUE],
  properties: {
    ...VARIABLE_PROPERTIES,
    [VariableField.SECRET]: { type: JsonSchemaType.BOOLEAN },
    [VariableField.LANGUAGE]: { enum: [...COMMAND_LANGUAGE_ORDER] },
    [VariableField.OPTIONS]: false,
  },
};

const ENUM_VARIABLE_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [VariableField.KEY, VariableField.VALUE, VariableField.OPTIONS],
  properties: {
    ...VARIABLE_PROPERTIES,
    [VariableField.OPTIONS]: {
      type: JsonSchemaType.ARRAY,
      items: { type: JsonSchemaType.STRING },
    },
    [VariableField.SECRET]: false,
    [VariableField.LANGUAGE]: false,
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
