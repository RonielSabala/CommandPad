import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import type { ReactNode } from "react";

import "./DragImage.css";

interface Props {
  icon: ReactNode;
  children: ReactNode;
}

export function DragImage({ icon, children }: Props) {
  return (
    <div
      className={CssClass.DRAG_IMAGE}
      aria-hidden
      {...{ [DataAttr.DRAG_IMAGE]: "" }}
    >
      {icon}
      {children}
    </div>
  );
}
