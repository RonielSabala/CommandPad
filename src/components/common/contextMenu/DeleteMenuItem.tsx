import { STANDARD_ICON_CLASS } from "@/common/constants/css";
import { TrashIcon } from "@/components/icons";
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
      icon={<TrashIcon className={STANDARD_ICON_CLASS} />}
      onSelect={onSelect}
      disabled={disabled}
      danger
    >
      {children}
    </ContextMenuItem>
  );
}
