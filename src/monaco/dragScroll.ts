import { MonacoSelector } from "@/common/constants/dom";
import {
  EventType,
  MouseButton,
  MouseButtons,
} from "@/common/constants/events";
import { DragScrollConfig } from "@/common/editorConfig";
import type { editor } from "monaco-editor";

const SCROLLABLE_OVERFLOW = ["auto", "scroll", "overlay"];

/** The nearest ancestor that actually scrolls the editor out of view. */
function findScrollParent(element: HTMLElement): HTMLElement {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (
      SCROLLABLE_OVERFLOW.includes(getComputedStyle(node).overflowY) &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }

  return document.scrollingElement as HTMLElement;
}

/** Pixels to scroll this frame */
function frameDelta(clientY: number, scroller: HTMLElement): number {
  const { top, bottom } =
    scroller === document.scrollingElement
      ? { top: 0, bottom: window.innerHeight }
      : scroller.getBoundingClientRect();

  const {
    EDGE_PX: EDGE,
    RAMP_PX: RAMP,
    MIN_SPEED,
    MAX_SPEED,
  } = DragScrollConfig;
  const past = Math.max(clientY - (bottom - EDGE), top + EDGE - clientY);
  if (past <= 0) {
    return 0;
  }

  const speed =
    MIN_SPEED + ((MAX_SPEED - MIN_SPEED) * Math.min(past, RAMP)) / RAMP;

  return clientY > (top + bottom) / 2 ? speed : -speed;
}

export function bindDragScrolling(
  instance: editor.IStandaloneCodeEditor,
): void {
  const node = instance.getDomNode();
  if (!node) {
    return;
  }

  let pointerId = -1;
  let clientX = 0;
  let clientY = 0;
  let frame = -1;

  const step = () => {
    frame = requestAnimationFrame(step);

    const scroller = findScrollParent(node);
    const delta = frameDelta(clientY, scroller);
    if (delta === 0) {
      return;
    }

    scroller.scrollTop += delta;
    node.querySelector(MonacoSelector.VIEW_LINES)?.dispatchEvent(
      new PointerEvent(EventType.POINTER_MOVE, {
        bubbles: true,
        pointerId,
        clientX,
        clientY,
        buttons: MouseButtons.LEFT,
      }),
    );
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener(EventType.POINTER_MOVE, handleMove);
    window.removeEventListener(EventType.POINTER_UP, stop);
  };

  function handleMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) {
      return;
    }

    if (!(event.buttons & MouseButtons.LEFT)) {
      stop();
      return;
    }

    clientX = event.clientX;
    clientY = event.clientY;
  }

  node.addEventListener(EventType.POINTER_DOWN, (event: PointerEvent) => {
    if (event.button !== MouseButton.LEFT) {
      return;
    }

    stop();
    pointerId = event.pointerId;
    clientX = event.clientX;
    clientY = event.clientY;
    frame = requestAnimationFrame(step);

    window.addEventListener(EventType.POINTER_MOVE, handleMove);
    window.addEventListener(EventType.POINTER_UP, stop);
  });

  instance.onDidDispose(stop);
}
