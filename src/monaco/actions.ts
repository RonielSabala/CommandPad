import { MonacoContextMenu } from "@/common/editorConfig";
import type { IDisposable, IRange, editor } from "monaco-editor";
import { trackInlineRename } from "./inlineRename";
import { monaco } from "./setup";

interface EditorActionContext {
  text: string;
  replace: (value: string) => void;
  rename: (
    value: string,
    inner: { start: number; length: number },
    onRename: (text: string) => void,
  ) => void;
}

/** One entry a surface adds to the editor's context menu. */
export interface EditorAction {
  id: string;
  label: string;
  order: number;
  caretRange?: (
    line: string,
    offset: number,
  ) => { start: number; end: number } | null;
  run: (context: EditorActionContext) => void;
}

function actionRange(
  action: EditorAction,
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
  const { lineNumber } = position;

  if (action.caretRange) {
    const range = action.caretRange(
      model.getLineContent(lineNumber),
      position.column - 1,
    );

    return range
      ? new monaco.Range(lineNumber, range.start + 1, lineNumber, range.end + 1)
      : null;
  }

  const word = model.getWordAtPosition(position);
  return word
    ? new monaco.Range(lineNumber, word.startColumn, lineNumber, word.endColumn)
    : null;
}

function runAction(action: EditorAction, instance: editor.ICodeEditor): void {
  const model = instance.getModel();
  const range = model && actionRange(action, instance, model);
  if (!model || !range) {
    return;
  }

  action.run({
    text: model.getValueInRange(range),
    replace: (value) =>
      instance.executeEdits(action.id, [{ range, text: value }]),
    rename: (value, inner, onRename) => {
      instance.executeEdits(action.id, [{ range, text: value }]);
      trackInlineRename(
        instance,
        new monaco.Range(
          range.startLineNumber,
          range.startColumn + inner.start,
          range.startLineNumber,
          range.startColumn + inner.start + inner.length,
        ),
        onRename,
      );
    },
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
