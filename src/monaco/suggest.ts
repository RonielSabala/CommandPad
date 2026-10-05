import { MonacoSuggest } from "@/common/editorConfig";
import type { editor } from "monaco-editor";

interface SuggestController extends editor.IEditorContribution {
  readonly model: { readonly state: number };
}

/** Whether a suggestion session is running. */
export function isSuggesting(instance: editor.ICodeEditor): boolean {
  const controller = instance.getContribution<SuggestController>(
    MonacoSuggest.CONTROLLER_ID,
  );

  return (
    (controller?.model.state ?? MonacoSuggest.IDLE_STATE) !==
    MonacoSuggest.IDLE_STATE
  );
}

export function triggerSuggest(instance: editor.ICodeEditor): void {
  instance.trigger(undefined, MonacoSuggest.TRIGGER_ACTION_ID, {});
}
