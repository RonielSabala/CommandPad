import { LINE_BREAK, LINE_FILLER } from "@/common/config";
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

interface CharacterBox {
  from: number;
  to: number;
  rect: DOMRect;
}

function* characterBoxes(
  texts: Iterable<[Node, number]>,
): Generator<CharacterBox> {
  const range = document.createRange();

  for (const [node, start] of texts) {
    const text = node.textContent ?? "";

    for (let i = 0; i < text.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);

      const from = start + i;
      const to =
        text[i] === LINE_BREAK || text[i] === LINE_FILLER ? from : from + 1;

      for (const rect of range.getClientRects()) {
        yield { from, to, rect };
      }
    }
  }
}

/** Offset of the character edge nearest the point. */
function nearestCaret(
  boxes: Iterable<CharacterBox>,
  x: number,
  y: number,
): number | undefined {
  let caret: number | undefined;
  let bestVertical = Infinity;
  let bestHorizontal = Infinity;

  for (const { from, to, rect } of boxes) {
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
    caret = x < (rect.left + rect.right) / 2 ? from : to;

    if (vertical === 0 && horizontal === 0) {
      break;
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
  return nearestCaret(characterBoxes(noteTexts(root)), x, y);
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

export type CaretLocator = (x: number, y: number) => number | undefined;

/** Finds carets in a textarea under viewport points. */
export function locateTextareaCarets(
  textarea: HTMLTextAreaElement,
): CaretLocator {
  const { value } = textarea;
  const text = document.createTextNode(value + LINE_FILLER);
  const mirror = mountTextareaMirror(textarea, text);
  const origin = textarea.getBoundingClientRect();
  const boxes = Array.from(characterBoxes([[text, 0]]));

  mirror.remove();
  return (x, y) => {
    const { top, left } = textarea.getBoundingClientRect();
    return nearestCaret(boxes, x - left + origin.left, y - top + origin.top);
  };
}
