import { MonacoContextMenu } from "@/common/editorConfig";
import type { IDisposable, IRange, editor } from "monaco-editor";
import { monaco } from "./setup";

interface EditorActionContext {
  text: string;
  replace: (value: string) => void;
}

/** One entry a surface adds to the editor's context menu. */
export interface EditorAction {
  id: string;
  label: string;
  order: number;
  run: (context: EditorActionContext) => void;
}

function actionRange(
  instance: editor.ICodeEditor,
  model: editor.ITextModel,
): IRange | null {
  const selection = instance.getSelection();
  if (!selection) {
    return null;
  }

  if (!selection.isEmpty()) {
    return selection;
  }

  const position = selection.getPosition();
  const word = model.getWordAtPosition(position);

  return word
    ? new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      )
    : null;
}

function runAction(action: EditorAction, instance: editor.ICodeEditor): void {
  const model = instance.getModel();
  const range = model && actionRange(instance, model);
  if (!model || !range) {
    return;
  }

  action.run({
    text: model.getValueInRange(range),
    replace: (value) =>
      instance.executeEdits(action.id, [{ range, text: value }]),
  });
}

export function registerEditorActions(
  instance: editor.IStandaloneCodeEditor,
  actions: EditorAction[],
): IDisposable[] {
  return actions.map((action) =>
    instance.addAction({
      id: action.id,
      label: action.label,
      contextMenuGroupId: MonacoContextMenu.GROUP,
      contextMenuOrder: action.order,
      run: (target) => runAction(action, target),
    }),
  );
}
