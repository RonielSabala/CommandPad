import { getBlockJsonSchemas } from "@/blocks";
import {
  CODE_LANGUAGE_ORDER,
  JsonSchemaType,
  RunbookJsonField,
  VariableJsonField,
  VariableSectionJsonField,
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
  required: [VariableSectionJsonField.SECTION],
  additionalProperties: false,
  properties: {
    [VariableSectionJsonField.SECTION]: { type: JsonSchemaType.STRING },
    [VariableSectionJsonField.COLLAPSED]: { type: JsonSchemaType.BOOLEAN },
  },
};

export const RUNBOOK_JSON_SCHEMA = {
  type: JsonSchemaType.OBJECT,
  required: [RunbookJsonField.VARIABLES, RunbookJsonField.BLOCKS],
  properties: {
    [RunbookJsonField.VARIABLES]: {
      type: JsonSchemaType.ARRAY,
      items: {
        oneOf: [TEXT_VARIABLE_SCHEMA, ENUM_VARIABLE_SCHEMA, SECTION_SCHEMA],
      },
    },
    [RunbookJsonField.BLOCKS]: {
      type: JsonSchemaType.ARRAY,
      items: { oneOf: getBlockJsonSchemas() },
    },
  },
};
