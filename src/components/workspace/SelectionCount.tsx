import { useTranslation } from "@/i18n/useTranslation";
import { countSelectedSections, useStore } from "@/store/store";

import "./SelectionCount.css";

export function SelectionCount() {
  const t = useTranslation();
  const blockCount = useStore((state) => state.selectedBlockIds.size);
  const rowCount = useStore((state) => state.selectedVariableIds.size);
  const sectionCount = useStore(countSelectedSections);
  const variableCount = rowCount - sectionCount;

  let label = "";
  if (variableCount > 0 && sectionCount > 0) {
    label = t.variables.itemsSelected(rowCount);
  } else if (variableCount > 0) {
    label = t.variables.selected(variableCount);
  } else if (sectionCount > 0) {
    label = t.variables.sectionsSelected(sectionCount);
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
