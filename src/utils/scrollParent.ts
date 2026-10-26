const SCROLLABLE_OVERFLOW = ["auto", "scroll", "overlay"];

function findScroller(
  element: HTMLElement,
  accepts: (node: HTMLElement) => boolean,
): HTMLElement {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (
      SCROLLABLE_OVERFLOW.includes(getComputedStyle(node).overflowY) &&
      accepts(node)
    ) {
      return node;
    }
  }

  return document.scrollingElement as HTMLElement;
}

/** The nearest ancestor that actually scrolls the editor out of view. */
export function findScrollParent(element: HTMLElement): HTMLElement {
  return findScroller(element, (node) => node.scrollHeight > node.clientHeight);
}

/** The nearest ancestor that may scroll, whether or not it overflows yet. */
export function findScrollContainer(element: HTMLElement): HTMLElement {
  return findScroller(element, () => true);
}

/** The band of the viewport that scroller actually shows, in client coordinates. */
export function scrollParentBox(scroller: HTMLElement): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  if (scroller === document.scrollingElement) {
    const { innerWidth: right, innerHeight: bottom } = window;
    return { top: 0, bottom, left: 0, right };
  }

  const { top, bottom, left, right } = scroller.getBoundingClientRect();
  return { top, bottom, left, right };
}
