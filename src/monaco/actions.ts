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
  isAvailable?: (text: string) => boolean;
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

interface ContextMenuController extends editor.IEditorContribution {
  showContextMenu(anchor?: unknown): void;
}

/** Runs `beforeShow` every time the editor's context menu is about to open. */
function beforeContextMenu(
  instance: editor.ICodeEditor,
  beforeShow: () => void,
): IDisposable {
  const controller = instance.getContribution<ContextMenuController>(
    MonacoContextMenu.CONTROLLER_ID,
  );

  if (!controller) {
    return { dispose: () => {} };
  }

  const show = controller.showContextMenu;
  controller.showContextMenu = (anchor) => {
    beforeShow();
    show.call(controller, anchor);
  };

  return { dispose: () => (controller.showContextMenu = show) };
}

function isActionAvailable(
  action: EditorAction,
  instance: editor.ICodeEditor,
): boolean {
  const model = instance.getModel();
  const range = model && actionRange(action, instance, model);
  return (
    !!range && (action.isAvailable?.(model.getValueInRange(range)) ?? true)
  );
}

export function registerEditorActions(
  instance: editor.IStandaloneCodeEditor,
  actions: EditorAction[],
): IDisposable[] {
  const refreshes: (() => void)[] = [];

  const disposables = actions.map((action) => {
    let precondition: string | undefined;

    if (action.isAvailable) {
      precondition = action.id + MonacoContextMenu.AVAILABLE_KEY_SUFFIX;
      const available = instance.createContextKey<boolean>(precondition, false);
      refreshes.push(() => available.set(isActionAvailable(action, instance)));
    }

    return instance.addAction({
      id: action.id,
      label: action.label,
      contextMenuGroupId: MonacoContextMenu.GROUP,
      contextMenuOrder: action.order,
      precondition,
      run: (target) => runAction(action, target),
    });
  });

  if (refreshes.length > 0) {
    disposables.push(
      beforeContextMenu(instance, () =>
        refreshes.forEach((refresh) => refresh()),
      ),
    );
  }

  return disposables;
}
