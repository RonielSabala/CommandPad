import { useTranslation } from "@/i18n/useTranslation";
import { useStore } from "@/store/store";

import "./SelectionCount.css";

export function SelectionCount() {
  const t = useTranslation();
  const blockCount = useStore((state) => state.selectedBlockIds.size);
  const variableCount = useStore((state) => state.selectedVariableIds.size);

  let label = "";
  if (variableCount > 0) {
    label = t.variables.selected(variableCount);
  } else if (blockCount > 0) {
    label = t.blocks.selected(blockCount);
  }

  if (label === "") {
    return null;
  }

  return (
    <div className="selection-count" role="status">
      {label}
    </div>
  );
}
