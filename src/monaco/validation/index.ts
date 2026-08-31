import { MonacoMarker } from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import type { editor } from "monaco-editor";

import { monaco } from "../setup";
import type { CodeValidator } from "./types";
import { validateXml } from "./xml";

export type { CodeProblem, CodeValidator } from "./types";

const VALIDATORS: Record<CodeLanguage, CodeValidator | null> = {
  [CodeLanguage.PLAIN]: null,
  [CodeLanguage.BASH]: null,
  [CodeLanguage.POWERSHELL]: null,
  [CodeLanguage.JSON]: null,
  [CodeLanguage.XML]: validateXml,
  [CodeLanguage.YAML]: null,
};

export function validateModel(model: editor.ITextModel): void {
  const validate = VALIDATORS[model.getLanguageId() as CodeLanguage] ?? null;
  const problems = validate ? validate(model.getValue()) : [];

  monaco.editor.setModelMarkers(
    model,
    MonacoMarker.OWNER,
    problems.map((problem) => ({
      message: problem.message,
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: problem.line,
      startColumn: problem.column,
      endLineNumber: problem.endLine,
      endColumn: problem.endColumn,
    })),
  );
}
