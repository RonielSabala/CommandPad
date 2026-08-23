import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { SelectionGroup } from "@/common/enums";
import type { StoreState } from "@/store/store";

export interface SelectionGroupDefinition {
  /** The class every selectable item of this group carries. */
  itemClass: string;
  /** The attribute that item holds its id in. */
  idAttr: string;
  /** A click on one of these must not clear the selection. */
  keepSelectionSelector: string;
  getSelected: (state: StoreState) => Set<string>;
  setSelected: (state: StoreState, id: string, selected: boolean) => void;
  clearSelection: (state: StoreState) => void;
}

export const SELECTION_GROUPS: Record<
  SelectionGroup,
  SelectionGroupDefinition
> = {
  [SelectionGroup.BLOCK]: {
    itemClass: CssClass.BLOCK_ITEM,
    idAttr: DataAttr.BLOCK_ID,
    keepSelectionSelector: `.${CssClass.BLOCK_ACTIONS}, .${CssClass.BLOCK_DRAG_HANDLE}`,
    getSelected: (state) => state.selectedBlockIds,
    setSelected: (state, id, selected) => state.setBlockSelected(id, selected),
    clearSelection: (state) => state.clearBlockSelection(),
  },
  [SelectionGroup.VARIABLE]: {
    itemClass: CssClass.VARIABLE_ITEM,
    idAttr: DataAttr.VARIABLE_ID,
    keepSelectionSelector: `.${CssClass.VARIABLE_ACTIONS}, .${CssClass.VARIABLE_DRAG_HANDLE}`,
    getSelected: (state) => state.selectedVariableIds,
    setSelected: (state, id, selected) =>
      state.setVariableSelected(id, selected),
    clearSelection: (state) => state.clearVariableSelection(),
  },
};
