import { LassoMode } from '@/common/enums';

/**
 * Transient multi-select "lasso" state. Kept outside React (it changes on every
 * mousedown/enter and must not trigger re-renders): `active` is set on ctrl+drag
 * start and read by each block's `onMouseEnter`.
 */
export const lasso: { active: boolean; mode: LassoMode } = {
  active: false,
  mode: LassoMode.SELECT,
};
