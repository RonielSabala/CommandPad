import { CssClass } from "@/common/constants/css";
import { classNames } from "@/utils/string";
import "./DividerBlock.css";

export function DividerBlock() {
  return (
    <div className={classNames("divider-block", CssClass.BLOCK_SURFACE)}>
      <div className="divider-line" />
    </div>
  );
}
