import { MonacoSuggest } from "@/common/editorConfig";
import type { editor } from "monaco-editor";

interface SuggestController extends editor.IEditorContribution {
  readonly widget: {
    readonly isInitialized: boolean;
    readonly value: { getFocusedItem(): unknown };
  };
}

/** Whether Enter would accept a suggestion. */
export function hasFocusedSuggestion(instance: editor.ICodeEditor): boolean {
  const widget = instance.getContribution<SuggestController>(
    MonacoSuggest.CONTROLLER_ID,
  )?.widget;

  return !!widget?.isInitialized && !!widget.value.getFocusedItem();
}

export function triggerSuggest(instance: editor.ICodeEditor): void {
  instance.trigger(undefined, MonacoSuggest.TRIGGER_ACTION_ID, {});
}
