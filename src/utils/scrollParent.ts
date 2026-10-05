const SCROLLABLE_OVERFLOW = ["auto", "scroll", "overlay"];

/** The nearest ancestor that actually scrolls the editor out of view. */
export function findScrollParent(element: HTMLElement): HTMLElement {
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

/** The band of the viewport that scroller actually shows, in client coordinates. */
export function scrollParentBox(scroller: HTMLElement): {
  top: number;
  bottom: number;
} {
  if (scroller === document.scrollingElement) {
    return { top: 0, bottom: window.innerHeight };
  }

  const { top, bottom } = scroller.getBoundingClientRect();
  return { top, bottom };
}
