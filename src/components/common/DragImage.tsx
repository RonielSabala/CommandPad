import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import type { ReactNode } from "react";

import "./DragImage.css";

interface Props {
  children: ReactNode;
}

export function DragImage({ children }: Props) {
  return (
    <div
      className={CssClass.DRAG_IMAGE}
      aria-hidden
      {...{ [DataAttr.DRAG_IMAGE]: "" }}
    >
      {children}
    </div>
  );
}
