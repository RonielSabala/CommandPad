import {
  ContextMenu,
  type ContextMenuAnchor,
} from "@/components/common/contextMenu/ContextMenu";

import "./LibraryContextMenu.css";
import {
  LibraryMenuItems,
  type LibraryMenuItemsProps,
} from "./LibraryMenuItems";

interface Props extends LibraryMenuItemsProps {
  anchor: ContextMenuAnchor;
  onClose: () => void;
}

export function LibraryContextMenu({ anchor, onClose, ...items }: Props) {
  return (
    <ContextMenu
      className="library-context-menu"
      anchor={anchor}
      onClose={onClose}
    >
      <LibraryMenuItems {...items} />
    </ContextMenu>
  );
}
