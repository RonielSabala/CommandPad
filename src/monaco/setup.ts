import { MonacoCommand, MonacoWorkerLabel } from "@/common/editorConfig";
import { loader } from "@monaco-editor/react";
import "monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js";
import "monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js";
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js";
import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import "monaco-editor/esm/vs/language/json/monaco.contribution.js";

declare global {
  var MonacoEnvironment: monaco.Environment | undefined;
}

self.MonacoEnvironment = {
  getWorker: (_workerId: string, label: string) =>
    label === MonacoWorkerLabel.JSON ? new JsonWorker() : new EditorWorker(),
};

loader.config({ monaco });

monaco.editor.addKeybindingRule({
  keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL,
  command: MonacoCommand.REMOVE_EXPAND_LINE_SELECTION,
});

/** Settle the loader at import time. */
void loader.init();

export { monaco };
