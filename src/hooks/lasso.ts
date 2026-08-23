import { LassoMode, SelectionGroup } from "@/common/enums";

interface LassoState {
  active: boolean;
  mode: LassoMode;
}

export const lasso: Record<SelectionGroup, LassoState> = {
  [SelectionGroup.BLOCK]: { active: false, mode: LassoMode.SELECT },
  [SelectionGroup.VARIABLE]: { active: false, mode: LassoMode.SELECT },
};
