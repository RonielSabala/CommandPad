let trigger: (() => void) | null = null;

export function registerImportTrigger(fn: (() => void) | null): void {
  trigger = fn;
}

export function openImportDialog(): void {
  trigger?.();
}
