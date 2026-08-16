import type { IRange, editor } from "monaco-editor";

export function trackInlineRename(
  instance: editor.ICodeEditor,
  range: IRange,
  onChange: (text: string) => void,
): void {
  const model = instance.getModel();
  if (!model) {
    return;
  }

  const tracked = instance.createDecorationsCollection([
    { range, options: {} },
  ]);
  instance.setSelection(range);

  const stop = () => {
    contentSub.dispose();
    cursorSub.dispose();
    blurSub.dispose();
    tracked.clear();
  };

  const contentSub = instance.onDidChangeModelContent(() => {
    const current = tracked.getRange(0);
    if (!current) {
      stop();
      return;
    }

    onChange(model.getValueInRange(current));
  });

  const cursorSub = instance.onDidChangeCursorSelection((event) => {
    const current = tracked.getRange(0);
    if (!current || !current.containsRange(event.selection)) {
      stop();
    }
  });

  const blurSub = instance.onDidBlurEditorText(stop);
}
