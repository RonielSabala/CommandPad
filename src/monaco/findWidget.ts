import { MonacoFind } from "@/common/editorConfig";
import type { IDisposable, editor } from "monaco-editor";

export interface FindController extends editor.IEditorContribution {
  getState(): {
    readonly isRevealed: boolean;
    onFindReplaceStateChange(listener: () => void): IDisposable;
  };
}

export function getFindController(
  instance: editor.ICodeEditor,
): FindController | null {
  return instance.getContribution<FindController>(MonacoFind.CONTROLLER_ID);
}

/** Whether the find/replace widget is open on this editor. */
export function isFindRevealed(instance: editor.ICodeEditor): boolean {
  return getFindController(instance)?.getState().isRevealed ?? false;
}
