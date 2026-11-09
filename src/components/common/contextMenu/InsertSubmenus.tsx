import { STANDARD_ICON_CLASS } from "@/common/constants/css";
import { InsertPosition } from "@/common/enums";
import { ArrowBarDown, ArrowBarUp } from "@/components/icons";
import type { ReactNode } from "react";

import { ContextMenuSubmenu } from "./ContextMenuSubmenu";

interface Props {
  aboveLabel: string;
  belowLabel: string;
  children: (position: InsertPosition) => ReactNode;
}

/** The Insert above / Insert below submenu pair. */
export function InsertSubmenus({ aboveLabel, belowLabel, children }: Props) {
  return (
    <>
      <ContextMenuSubmenu
        icon={<ArrowBarUp className={STANDARD_ICON_CLASS} />}
        label={aboveLabel}
      >
        {children(InsertPosition.ABOVE)}
      </ContextMenuSubmenu>

      <ContextMenuSubmenu
        icon={<ArrowBarDown className={STANDARD_ICON_CLASS} />}
        label={belowLabel}
      >
        {children(InsertPosition.BELOW)}
      </ContextMenuSubmenu>
    </>
  );
}
