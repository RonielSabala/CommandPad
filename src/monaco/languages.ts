import { WrapPairs } from "@/common/config";
import { RunbookSchemaConfig } from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { jsonDefaults } from "monaco-editor/esm/vs/language/json/monaco.contribution.js";
import { RUNBOOK_JSON_SCHEMA } from "./runbookSchema";
import { monaco } from "./setup";

const SURROUNDING_PAIRS = Object.entries(WrapPairs).map(([open, close]) => ({
  open,
  close,
}));

let configured = false;

export function configureLanguages(): void {
  if (configured) {
    return;
  }

  configured = true;

  monaco.languages.setLanguageConfiguration(CodeLanguage.PLAIN, {
    surroundingPairs: SURROUNDING_PAIRS,
    autoClosingPairs: [],
  });

  monaco.languages.setLanguageConfiguration(CodeLanguage.JSON, {
    surroundingPairs: SURROUNDING_PAIRS,
  });

  jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    trailingCommas: "error",
    enableSchemaRequest: false,
    schemas: [
      {
        uri: RunbookSchemaConfig.SCHEMA_URI,
        fileMatch: [RunbookSchemaConfig.FILE_MATCH],
        schema: RUNBOOK_JSON_SCHEMA,
      },
    ],
  });
}
