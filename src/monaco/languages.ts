import { WrapPairs } from "@/common/config";
import { RunbookSchemaConfig } from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { jsonDefaults } from "monaco-editor/esm/vs/language/json/monaco.contribution.js";

import { registerVariableCompletions } from "./completions";
import { RUNBOOK_JSON_SCHEMA } from "./runbookSchema";
import { monaco } from "./setup";

const PAIRS = Object.entries(WrapPairs).map(([open, close]) => ({
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
    surroundingPairs: PAIRS,
    autoClosingPairs: PAIRS,
  });

  registerVariableCompletions();

  monaco.languages.setLanguageConfiguration(CodeLanguage.JSON, {
    surroundingPairs: PAIRS,
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
