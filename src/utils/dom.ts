import { CssClass } from "@/common/constants/css";
import {
  DataAttr,
  EditCommand,
  HtmlTag,
  ScrollIntoView,
  ScrollSettle,
} from "@/common/constants/dom";

export function toPx(pixels: number): string {
  return `${pixels}px`;
}

/**
 * Replaces the field's selection with `text` through the editing command, so
 * the change joins the undo history.
 */
export function replaceSelection(
  field: HTMLTextAreaElement | HTMLInputElement,
  text: string,
  onChange: (value: string) => void,
): boolean {
  const { value } = field;
  const from = field.selectionStart ?? 0;
  const to = field.selectionEnd ?? from;

  if (document.execCommand(EditCommand.INSERT_TEXT, false, text)) {
    return true;
  }

  onChange(value.slice(0, from) + text + value.slice(to));
  return false;
}

/** Bring the row carrying `rowId` into view, scoped to the list it belongs to. */
export function scrollRowIntoView(
  list: HTMLElement | null,
  attribute: string,
  rowId: string | null,
  align: ScrollLogicalPosition,
): void {
  if (!rowId) {
    return;
  }

  list?.querySelector(`[${attribute}="${rowId}"]`)?.scrollIntoView({
    block: align,
    behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
  });
}

/** Run `callback` once `element` has stopped moving on screen */
export function whenElementSettles(
  element: HTMLElement,
  callback: () => void,
): () => void {
  let previous: number | undefined;
  let stable = 0;
  let frames = 0;
  let frame = 0;

  const watch = () => {
    const { top } = element.getBoundingClientRect();
    stable = top === previous ? stable + 1 : 0;
    previous = top;
    frames += 1;

    if (
      stable >= ScrollSettle.STABLE_FRAMES ||
      frames >= ScrollSettle.MAX_FRAMES
    ) {
      callback();
      return;
    }

    frame = requestAnimationFrame(watch);
  };

  frame = requestAnimationFrame(watch);
  return () => cancelAnimationFrame(frame);
}

/** Distance from `value` to the nearest edge of `[min, max]` (0 when inside). */
function distanceToRange(value: number, min: number, max: number): number {
  return Math.max(min - value, value - max, 0);
}

function segmentStart(node: Node): number | undefined {
  const segment = node.parentElement?.closest(`[${DataAttr.NOTE_OFFSET}]`);
  const start = segment?.getAttribute(DataAttr.NOTE_OFFSET);
  return start === null || start === undefined ? undefined : Number(start);
}

/** Offset of the character edge nearest the point, across `texts`. */
function nearestCaret(
  texts: Iterable<[Node, number]>,
  x: number,
  y: number,
): number | undefined {
  const range = document.createRange();

  let caret: number | undefined;
  let bestVertical = Infinity;
  let bestHorizontal = Infinity;

  for (const [node, start] of texts) {
    const length = node.textContent?.length ?? 0;

    for (let i = 0; i < length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);

      for (const rect of range.getClientRects()) {
        const vertical = distanceToRange(y, rect.top, rect.bottom);
        const horizontal = distanceToRange(x, rect.left, rect.right);
        if (
          vertical > bestVertical ||
          (vertical === bestVertical && horizontal >= bestHorizontal)
        ) {
          continue;
        }

        bestVertical = vertical;
        bestHorizontal = horizontal;
        caret = start + i + (x < (rect.left + rect.right) / 2 ? 0 : 1);
      }
    }
  }

  return caret;
}

function* noteTexts(root: Element): Generator<[Node, number]> {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const start = segmentStart(node);
    if (start !== undefined) {
      yield [node, start];
    }
  }
}

/** Caret position in a note's raw text for a viewport point. */
export function getNoteCaretAtPoint(
  root: Element,
  x: number,
  y: number,
): number | undefined {
  return nearestCaret(noteTexts(root), x, y);
}

const TEXT_LAYOUT_STYLES = [
  "box-sizing",
  "width",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-style",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "font-variant",
  "font-feature-settings",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "tab-size",
  "text-indent",
  "text-transform",
  "text-align",
  "white-space",
  "overflow-wrap",
  "word-break",
  "direction",
] as const;

/** An invisible copy of the textarea's text layout. */
function mountTextareaMirror(
  textarea: HTMLTextAreaElement,
  ...content: (string | Node)[]
): HTMLDivElement {
  const computed = getComputedStyle(textarea);
  const { top, left } = textarea.getBoundingClientRect();

  const mirror = document.createElement(HtmlTag.DIV);
  mirror.className = CssClass.TEXT_MIRROR;

  for (const property of TEXT_LAYOUT_STYLES) {
    mirror.style.setProperty(property, computed.getPropertyValue(property));
  }

  mirror.style.top = toPx(top);
  mirror.style.left = toPx(left);
  mirror.append(...content);

  document.body.appendChild(mirror);
  return mirror;
}

/** Viewport boxes of `from`..`to` in a textarea. */
export function getTextareaRangeRects(
  textarea: HTMLTextAreaElement,
  from: number,
  to: number,
): DOMRect[] {
  const { value } = textarea;
  const range = document.createElement(HtmlTag.SPAN);
  range.textContent = value.slice(from, to);

  const mirror = mountTextareaMirror(
    textarea,
    value.slice(0, from),
    range,
    value.slice(to),
  );

  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0,
  );

  mirror.remove();
  return rects;
}

export interface TextareaCaretLocator {
  caretAt: (x: number, y: number) => number | undefined;
  dispose: () => void;
}

/**
 * Finds carets in a textarea under viewport points through one mirror, kept
 * until `dispose`.
 */
export function locateTextareaCarets(
  textarea: HTMLTextAreaElement,
): TextareaCaretLocator {
  const { value } = textarea;
  const text = document.createTextNode(value + " ");
  const mirror = mountTextareaMirror(textarea, text);
  const origin = textarea.getBoundingClientRect();

  return {
    caretAt: (x, y) => {
      const { top, left } = textarea.getBoundingClientRect();
      const caret = nearestCaret(
        [[text, 0]],
        x - left + origin.left,
        y - top + origin.top,
      );

      return caret === undefined ? undefined : Math.min(caret, value.length);
    },
    dispose: () => mirror.remove(),
  };
}
