import { JSON_EXTENSION } from "@/common/config";

type ImportTrigger = (accept: string) => void;

let trigger: ImportTrigger | null = null;

export function registerImportTrigger(fn: ImportTrigger | null): void {
  trigger = fn;
}

export function openImportDialog(accept: string = JSON_EXTENSION): void {
  trigger?.(accept);
}
