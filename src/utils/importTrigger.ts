// Bridge so the global keybinding and the sidebar "Import" button can both open
// the hidden file input, wherever it lives in the tree.

let trigger: (() => void) | null = null;

export function registerImportTrigger(fn: (() => void) | null): void {
  trigger = fn;
}

export function openImportDialog(): void {
  trigger?.();
}
