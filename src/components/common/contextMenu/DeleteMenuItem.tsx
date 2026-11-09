import { CssClass } from "@/common/constants/css";
import { TrashIcon } from "@/components/icons";
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";

import { ContextMenuItem } from "./ContextMenu";

interface Props {
  children: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
}

export function DeleteMenuItem({ children, onSelect, disabled }: Props) {
  return (
    <ContextMenuItem
      icon={
        <TrashIcon
          className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
        />
      }
      onSelect={onSelect}
      disabled={disabled}
      danger
    >
      {children}
    </ContextMenuItem>
  );
}
