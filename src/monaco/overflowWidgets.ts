import { MonacoOverflowWidgets } from "@/common/editorConfig";

let root: HTMLElement | null = null;

/** The one node every editor's overflow widgets are re-parented into. */
export function getOverflowWidgetsRoot(): HTMLElement {
  if (!root) {
    root = document.createElement("div");
    root.classList.add(
      MonacoOverflowWidgets.EDITOR_CLASS,
      MonacoOverflowWidgets.ROOT_CLASS,
    );

    document.body.appendChild(root);
  }

  return root;
}
