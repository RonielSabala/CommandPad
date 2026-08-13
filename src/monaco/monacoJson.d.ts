/**
 * Types for the JSON language contribution.
 */

type JsonSeverity = "error" | "warning" | "ignore";

interface JsonSchemaAssociation {
  uri: string;
  fileMatch?: string[];
  schema?: unknown;
}

export interface JsonDiagnosticsOptions {
  validate?: boolean;
  allowComments?: boolean;
  schemas?: JsonSchemaAssociation[];
  enableSchemaRequest?: boolean;
  schemaRequest?: JsonSeverity;
  schemaValidation?: JsonSeverity;
  comments?: JsonSeverity;
  trailingCommas?: JsonSeverity;
}

declare module "monaco-editor/esm/vs/language/json/monaco.contribution.js" {
  export const jsonDefaults: {
    readonly diagnosticsOptions: JsonDiagnosticsOptions;
    setDiagnosticsOptions(options: JsonDiagnosticsOptions): void;
  };
}
