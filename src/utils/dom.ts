import { CssClass } from "@/common/constants/css";
import {
  DataAttr,
  HtmlTag,
  ScrollIntoView,
  ScrollSettle,
} from "@/common/constants/dom";

export function toPx(pixels: number): string {
  return `${pixels}px`;
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

/**
 * Caret position in a note's **raw** text for a viewport point over its
 * rendered preview.
 */
export function getNoteCaretAtPoint(
  root: Element,
  x: number,
  y: number,
): number | undefined {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();

  let caret: number | undefined;
  let bestVertical = Infinity;
  let bestHorizontal = Infinity;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const start = segmentStart(node);
    if (start === undefined) {
      continue;
    }

    const length = node.textContent?.length ?? 0;

    for (let i = 0; i < length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);

      for (const rect of range.getClientRects()) {
        // Vertical distance decides first, so a click stays on the line it hit
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

/** Viewport boxes of `from`..`to` in a textarea. */
export function getTextareaRangeRects(
  textarea: HTMLTextAreaElement,
  from: number,
  to: number,
): DOMRect[] {
  const computed = getComputedStyle(textarea);
  const { top, left } = textarea.getBoundingClientRect();
  const { value } = textarea;

  const range = document.createElement(HtmlTag.SPAN);
  const mirror = document.createElement(HtmlTag.DIV);
  mirror.className = CssClass.TEXT_MIRROR;

  for (const property of TEXT_LAYOUT_STYLES) {
    mirror.style.setProperty(property, computed.getPropertyValue(property));
  }

  mirror.style.top = toPx(top);
  mirror.style.left = toPx(left);

  range.textContent = value.slice(from, to);
  mirror.append(value.slice(0, from), range, value.slice(to));
  document.body.appendChild(mirror);

  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0,
  );

  mirror.remove();
  return rects;
}
