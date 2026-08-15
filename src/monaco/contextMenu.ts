import { MonacoSelector } from "@/common/constants/dom";
import { MonacoContextMenu } from "@/common/editorConfig";
import type { editor } from "monaco-editor";
import { getOverflowWidgetsRoot } from "./overflowWidgets";
import { monaco } from "./setup";

export function bindContextMenuChord(
  instance: editor.IStandaloneCodeEditor,
): void {
  instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period, () =>
    instance.trigger(
      MonacoContextMenu.TRIGGER_SOURCE,
      MonacoContextMenu.SHOW_ACTION,
      null,
    ),
  );
}

export function isContextMenuOpen(): boolean {
  return Array.from(getOverflowWidgetsRoot().children).some((child) =>
    child.shadowRoot?.querySelector(MonacoSelector.CONTEXT_MENU),
  );
}

/** Runs `onClosed` once the menu is gone. */
export function whenContextMenuCloses(onClosed: () => void): void {
  let graceFrames: number = MonacoContextMenu.OPEN_WAIT_FRAMES;

  const watch = () => {
    if (isContextMenuOpen()) {
      graceFrames = 0;
      requestAnimationFrame(watch);
      return;
    }

    if (graceFrames > 0) {
      graceFrames -= 1;
      requestAnimationFrame(watch);
      return;
    }

    onClosed();
  };

  requestAnimationFrame(watch);
}
