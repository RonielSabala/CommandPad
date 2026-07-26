import {
  ContextMenu,
  ContextMenuAlign,
  ContextMenuItem,
  type ContextMenuAnchor,
} from "@/components/common/ContextMenu";
import { TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useRef, useState } from "react";
import { PencilSquare, ThreeDotsVertical } from "react-bootstrap-icons";

interface CloudRowMenuProps {
  onRename: () => void;
  onDelete: () => void;
  menuTitle: string;
}

export function CloudRowMenu({
  onRename,
  onDelete,
  menuTitle,
}: CloudRowMenuProps) {
  const t = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<ContextMenuAnchor | null>(null);

  const toggle = () => {
    const trigger = triggerRef.current;

    if (anchor !== null || !trigger) {
      setAnchor(null);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setAnchor({ x: rect.right, y: rect.bottom });
  };

  return (
    <div className="cloud-browser-row-actions">
      <button
        ref={triggerRef}
        className="btn btn-flat-icon"
        onClick={toggle}
        title={menuTitle}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
      >
        <ThreeDotsVertical className="icon-md" />
      </button>

      {anchor && (
        <ContextMenu
          anchor={anchor}
          align={ContextMenuAlign.END}
          triggerRef={triggerRef}
          onClose={() => setAnchor(null)}
        >
          <ContextMenuItem
            icon={<PencilSquare className="icon-md" />}
            onSelect={onRename}
          >
            {t.cloudModal.rename}
          </ContextMenuItem>

          <ContextMenuItem
            icon={<TrashIcon className="icon-md icon-bold" />}
            onSelect={onDelete}
            danger
          >
            {t.cloudModal.delete}
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  );
}
