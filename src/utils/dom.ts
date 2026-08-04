import { DataAttr } from "@/common/constants/dom";

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
