import { CssClass } from "@/common/constants/css";
import { classNames } from "@/utils/string";

import "./DividerBlock.css";

export function DividerLine({ className }: { className?: string }) {
  return (
    <div className={classNames("divider-block", className)}>
      <div className="divider-line" />
    </div>
  );
}

export function DividerBlock() {
  return <DividerLine className={CssClass.BLOCK_SURFACE} />;
}
