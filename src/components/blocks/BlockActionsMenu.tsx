import { CssClass } from "@/common/constants/css";
import { InsertPosition } from "@/common/enums";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import {
  DuplicateIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  TrashIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import type { ReactNode } from "react";
import { BLOCK_TYPE_ICONS, BLOCK_TYPE_ORDER } from "./blockTypes";

interface Props {
  blockId: string;
}

interface InsertSubmenuProps {
  blockId: string;
  position: InsertPosition;
  label: string;
  icon: ReactNode;
}

function InsertSubmenu({ blockId, position, label, icon }: InsertSubmenuProps) {
  const t = useTranslation();
  const addBlock = useStore((state) => state.addBlock);

  return (
    <ContextMenuSubmenu icon={icon} label={label}>
      {BLOCK_TYPE_ORDER.map((type) => {
        const Icon = BLOCK_TYPE_ICONS[type];
        return (
          <ContextMenuItem
            key={type}
            icon={<Icon className="icon-md icon-bold" />}
            onSelect={() => void addBlock(type, { blockId, position })}
          >
            {t.blocks.typeLabel[type]}
          </ContextMenuItem>
        );
      })}
    </ContextMenuSubmenu>
  );
}

export function BlockActionsMenu({ blockId }: Props) {
  const t = useTranslation();
  const duplicateBlock = useStore((state) => state.duplicateBlock);
  const removeBlock = useStore((state) => state.removeBlock);
  const selectionCount = useStore((state) =>
    state.selectedBlockIds.has(blockId) ? state.selectedBlockIds.size : 1,
  );

  return (
    <ActionsMenu className={CssClass.BLOCK_ACTIONS} title={t.blocks.actions}>
      <ContextMenuItem
        icon={<DuplicateIcon className="icon-md icon-bold" />}
        onSelect={() => duplicateBlock(blockId)}
      >
        {t.blocks.duplicate(selectionCount)}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <InsertSubmenu
        blockId={blockId}
        position={InsertPosition.ABOVE}
        label={t.blocks.insertAbove}
        icon={<InsertAboveIcon className="icon-md icon-bold" />}
      />

      <InsertSubmenu
        blockId={blockId}
        position={InsertPosition.BELOW}
        label={t.blocks.insertBelow}
        icon={<InsertBelowIcon className="icon-md icon-bold" />}
      />

      <ContextMenuSeparator />

      <ContextMenuItem
        icon={<TrashIcon className="icon-md icon-bold" />}
        onSelect={() => removeBlock(blockId)}
        danger
      >
        {t.blocks.delete(selectionCount)}
      </ContextMenuItem>
    </ActionsMenu>
  );
}
