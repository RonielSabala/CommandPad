import { MonacoSelector } from "@/common/constants/dom";
import { EventType } from "@/common/constants/events";
import { MonacoContextMenu } from "@/common/editorConfig";
import type { editor } from "monaco-editor";

import { getOverflowWidgetsRoot } from "./layers";
import { monaco } from "./setup";

export function bindContextMenuChord(
  instance: editor.IStandaloneCodeEditor,
): void {
  instance.onKeyDown((event) => {
    if (!event.equals(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    instance.trigger(
      MonacoContextMenu.TRIGGER_SOURCE,
      MonacoContextMenu.SHOW_ACTION,
      null,
    );

    focusFirstMenuItem();
  });
}

function findContextMenu(): HTMLElement | null {
  for (const child of getOverflowWidgetsRoot().children) {
    const menu = child.shadowRoot?.querySelector<HTMLElement>(
      MonacoSelector.CONTEXT_MENU,
    );

    if (menu) {
      return menu;
    }
  }

  return null;
}

export function isContextMenuOpen(): boolean {
  return findContextMenu() !== null;
}

function focusFirstMenuItem(): void {
  const item = findContextMenu()?.querySelector<HTMLElement>(
    MonacoSelector.MENU_ITEM,
  );

  item?.dispatchEvent(new MouseEvent(EventType.MOUSE_OVER, { bubbles: true }));
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
