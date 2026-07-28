import { CssClass } from "@/common/constants/css";
import {
  ContextMenu,
  ContextMenuAlign,
  ContextMenuItem,
  type ContextMenuAnchor,
} from "@/components/common/ContextMenu";
import { DuplicateIcon, TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useRef, useState } from "react";
import { ThreeDotsVertical } from "react-bootstrap-icons";

interface Props {
  blockId: string;
}

export function BlockActionsMenu({ blockId }: Props) {
  const t = useTranslation();
  const duplicateBlock = useStore((state) => state.duplicateBlock);
  const removeBlock = useStore((state) => state.removeBlock);
  const selectionCount = useStore((state) =>
    state.selectedBlockIds.has(blockId) ? state.selectedBlockIds.size : 1,
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<ContextMenuAnchor | null>(null);

  const toggle = () => {
    const trigger = triggerRef.current;

    if (anchor !== null || !trigger) {
      setAnchor(null);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setAnchor({ x: rect.left, y: rect.bottom });
  };

  return (
    <div
      className={classNames(CssClass.BLOCK_ACTIONS, anchor && "menu-open")}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        ref={triggerRef}
        className="btn btn-flat-icon"
        onClick={toggle}
        title={t.blocks.actions}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
      >
        <ThreeDotsVertical className="icon-md" />
      </button>

      {anchor && (
        <ContextMenu
          anchor={anchor}
          align={ContextMenuAlign.START}
          triggerRef={triggerRef}
          onClose={() => setAnchor(null)}
        >
          <ContextMenuItem
            icon={<DuplicateIcon className="icon-md icon-bold" />}
            onSelect={() => duplicateBlock(blockId)}
          >
            {t.blocks.duplicate(selectionCount)}
          </ContextMenuItem>

          <ContextMenuItem
            icon={<TrashIcon className="icon-md icon-bold" />}
            onSelect={() => removeBlock(blockId)}
            danger
          >
            {t.blocks.delete(selectionCount)}
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  );
}
