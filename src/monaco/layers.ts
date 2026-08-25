import { MonacoLayer } from "@/common/editorConfig";

function createLayer(className: string): HTMLElement {
  const layer = document.createElement("div");

  layer.classList.add(MonacoLayer.EDITOR_CLASS, className);
  document.body.appendChild(layer);

  return layer;
}

let overflowRoot: HTMLElement | null = null;
let hoverRoot: HTMLElement | null = null;

/** The one node every editor's overflow widgets are re-parented into. */
export function getOverflowWidgetsRoot(): HTMLElement {
  overflowRoot ??= createLayer(MonacoLayer.OVERFLOW_ROOT_CLASS);
  return overflowRoot;
}

/** The one node the tooltips Monaco's own widgets raise are rendered into. */
export function getHoverRoot(): HTMLElement {
  hoverRoot ??= createLayer(MonacoLayer.HOVER_ROOT_CLASS);
  return hoverRoot;
}
