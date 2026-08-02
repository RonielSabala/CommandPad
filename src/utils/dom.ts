/** Distance from `value` to the nearest edge of `[min, max]` (0 when inside). */
function distanceToRange(value: number, min: number, max: number): number {
  return Math.max(min - value, value - max, 0);
}

/**
 * Character offset inside `element`'s text closest to a viewport point, with
 * the same half-character rounding a browser uses to place a caret.
 */
export function getTextOffsetAtPoint(
  element: Element,
  x: number,
  y: number,
): number {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();

  let nodeStart = 0;
  let best = 0;
  let bestVertical = Infinity;
  let bestHorizontal = Infinity;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
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
        best = nodeStart + i + (x < (rect.left + rect.right) / 2 ? 0 : 1);
      }
    }

    nodeStart += length;
  }

  return best;
}
