import { MonacoWorkerLabel } from "@/common/config";
import { loader } from "@monaco-editor/react";
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

/** Settle the loader at import time. */
export const monacoReady = loader.init();

export { monaco };
