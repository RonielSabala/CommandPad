import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { classNames } from "@/utils/string";
import type { ComponentType, ReactNode, SVGProps } from "react";

import "./DragImage.css";

interface Props {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
}

export function DragImage({ icon: Icon, children }: Props) {
  return (
    <div
      className={CssClass.DRAG_IMAGE}
      aria-hidden
      {...{ [DataAttr.DRAG_IMAGE]: "" }}
    >
      <Icon className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)} />
      {children}
    </div>
  );
}
