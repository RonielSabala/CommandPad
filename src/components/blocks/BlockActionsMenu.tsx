import { BLOCK_TYPE_ORDER } from "@/blocks";
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
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";
import { getBlockIcon } from "./blockViews";

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
        const Icon = getBlockIcon(type);
        return (
          <ContextMenuItem
            key={type}
            icon={
              <Icon
                className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
              />
            }
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
    <ActionsMenu
      className={classNames(CssClass.ITEM_CONTROL, CssClass.ITEM_ACTIONS)}
      title={t.blocks.actions}
    >
      <ContextMenuItem
        icon={
          <DuplicateIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
        onSelect={() => duplicateBlock(blockId)}
      >
        {t.blocks.duplicate(selectionCount)}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <InsertSubmenu
        blockId={blockId}
        position={InsertPosition.ABOVE}
        label={t.blocks.insertAbove}
        icon={
          <InsertAboveIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
      />

      <InsertSubmenu
        blockId={blockId}
        position={InsertPosition.BELOW}
        label={t.blocks.insertBelow}
        icon={
          <InsertBelowIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
      />

      <ContextMenuSeparator />

      <ContextMenuItem
        icon={
          <TrashIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
        onSelect={() => removeBlock(blockId)}
        danger
      >
        {t.blocks.delete(selectionCount)}
      </ContextMenuItem>
    </ActionsMenu>
  );
}
