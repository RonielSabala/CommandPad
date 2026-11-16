import { CodeMetricProperty, TabWidth } from "@/common/editorConfig";

import { monaco } from "./setup";

let tabSize: number = TabWidth.DEFAULT;

export function getTabSize(): number {
  return tabSize;
}

export function applyTabSize(size: number): void {
  tabSize = size;
  document.documentElement.style.setProperty(
    CodeMetricProperty.TAB_SIZE,
    `${size}`,
  );

  for (const model of monaco.editor.getModels()) {
    model.updateOptions({ tabSize: size });
  }
}
