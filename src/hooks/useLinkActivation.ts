import { CssClass } from "@/common/constants/css";
import { Anchor, Cursor } from "@/common/constants/dom";
import { EventType } from "@/common/constants/events";
import { AppMode } from "@/common/enums";
import { isModifierPressed, ModifierAction } from "@/common/keybindings";
import { useStoreApi } from "@/store/store";
import { useEffect } from "react";

export function useLinkActivation(root: Document | HTMLElement | null): void {
  const store = useStoreApi();

  useEffect(() => {
    if (!root) {
      return;
    }

    // A scoped (element) root only arms while the pointer is over it
    const scoped = root !== document;
    let pointerInside = !scoped;

    const setLinkMode = (held: boolean) =>
      store.getState().setLinkKeyHeld(held);

    const linkAt = (x: number, y: number): HTMLAnchorElement | undefined =>
      document
        .elementsFromPoint(x, y)
        .find((element): element is HTMLAnchorElement =>
          element.matches(`.${CssClass.NOTE_LINK}`),
        );

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (pointerInside && isModifierPressed(event, ModifierAction.OPEN_LINK)) {
        setLinkMode(true);
      }
    };

    const onKeyUp = (event: globalThis.KeyboardEvent) => {
      if (!isModifierPressed(event, ModifierAction.OPEN_LINK)) {
        setLinkMode(false);
      }
    };

    const onWindowBlur = () => setLinkMode(false);

    const onPointerEnter = () => {
      pointerInside = true;
    };

    const onPointerLeave = () => {
      pointerInside = false;
      setLinkMode(false);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (
        !pointerInside ||
        !isModifierPressed(event, ModifierAction.OPEN_LINK)
      ) {
        return;
      }

      document.body.style.cursor = linkAt(event.clientX, event.clientY)
        ? Cursor.POINTER
        : Cursor.DEFAULT;
    };

    const onClick = (event: MouseEvent) => {
      if (store.getState().mode === AppMode.READ) {
        return;
      }

      const link = linkAt(event.clientX, event.clientY);
      if (!link) {
        return;
      }

      event.preventDefault();
      if (isModifierPressed(event, ModifierAction.OPEN_LINK)) {
        window.open(link.href, Anchor.TARGET_BLANK, Anchor.REL);
        return;
      }

      // Focus the note
      const control = (link.closest("label") as HTMLLabelElement | null)
        ?.control;
      control?.focus();
    };

    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    document.addEventListener(EventType.KEY_UP, onKeyUp);
    document.addEventListener(EventType.MOUSE_MOVE, onMouseMove);
    window.addEventListener(EventType.BLUR, onWindowBlur);
    root.addEventListener(EventType.CLICK, onClick as EventListener);
    if (scoped) {
      root.addEventListener(EventType.MOUSE_ENTER, onPointerEnter);
      root.addEventListener(EventType.MOUSE_LEAVE, onPointerLeave);
    }

    return () => {
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      document.removeEventListener(EventType.KEY_UP, onKeyUp);
      document.removeEventListener(EventType.MOUSE_MOVE, onMouseMove);
      window.removeEventListener(EventType.BLUR, onWindowBlur);
      root.removeEventListener(EventType.CLICK, onClick as EventListener);
      if (scoped) {
        root.removeEventListener(EventType.MOUSE_ENTER, onPointerEnter);
        root.removeEventListener(EventType.MOUSE_LEAVE, onPointerLeave);
      }
      setLinkMode(false);
    };
  }, [store, root]);
}
