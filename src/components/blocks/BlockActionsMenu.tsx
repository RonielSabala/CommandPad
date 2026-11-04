import { BLOCK_TYPE_ORDER } from "@/blocks";
import { CssClass } from "@/common/constants/css";
import { BlockType, type InsertPosition } from "@/common/enums";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { InsertSubmenus } from "@/components/common/contextMenu/InsertSubmenus";
import { SelectionActionsContext } from "@/components/common/contextMenu/selectionActionsContext";
import { SelectionToggleItem } from "@/components/common/contextMenu/SelectionToggleItem";
import { InfoMenuItem } from "@/components/common/info/InfoMenuItem";
import { useInfoTooltip } from "@/components/common/info/useInfoTooltip";
import { CopyIcon, DuplicateIcon, TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useContext } from "react";

import { getBlockIcon, getBlockInfo, type BlockViewProps } from "./blockViews";

type Props = BlockViewProps;

interface InsertItemsProps {
  blockId: string;
  position: InsertPosition;
}

function InsertItems({ blockId, position }: InsertItemsProps) {
  const t = useTranslation();
  const addBlock = useStore((state) => state.addBlock);

  return BLOCK_TYPE_ORDER.map((type) => {
    const Icon = getBlockIcon(type);
    return (
      <ContextMenuItem
        key={type}
        icon={
          <Icon className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)} />
        }
        onSelect={() => void addBlock(type, { blockId, position })}
      >
        {t.blocks.typeLabel[type]}
      </ContextMenuItem>
    );
  });
}

export function BlockActionsMenu({ block, variableMap, secretKeys }: Props) {
  const t = useTranslation();
  const info = useInfoTooltip();
  const Info = getBlockInfo(block.type);
  const blockId = block.id;
  const isNote = block.type === BlockType.NOTE;
  const duplicateBlock = useStore((state) => state.duplicateBlock);
  const removeBlock = useStore((state) => state.removeBlock);
  const toggleBlockSelection = useStore((state) => state.toggleBlockSelection);
  const isSelected = useStore((state) => state.selectedBlockIds.has(blockId));
  const canSelect = useContext(SelectionActionsContext);
  const selectionCount = useStore((state) =>
    state.selectedBlockIds.has(blockId) ? state.selectedBlockIds.size : 1,
  );

  return (
    <>
      <ActionsMenu
        className={classNames(
          CssClass.ITEM_CONTROL,
          CssClass.ITEM_ACTIONS,
          info.menuClassName,
        )}
        title={t.blocks.actions}
        triggerRef={info.triggerRef}
      >
        <InfoMenuItem onSelect={info.open} />

        {isNote && (
          <ContextMenuItem
            icon={
              <CopyIcon
                className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
              />
            }
            onSelect={() => void navigator.clipboard.writeText(block.text)}
            disabled={!block.text.trim()}
          >
            {t.blocks.copyNote}
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {canSelect && (
          <SelectionToggleItem
            selected={isSelected}
            onToggle={() => toggleBlockSelection(blockId)}
            selectLabel={t.blocks.select}
            deselectLabel={t.blocks.deselect}
          />
        )}

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

        <InsertSubmenus
          aboveLabel={t.blocks.insertAbove}
          belowLabel={t.blocks.insertBelow}
        >
          {(position) => <InsertItems blockId={blockId} position={position} />}
        </InsertSubmenus>

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

      {info.render(() => (
        <Info block={block} variableMap={variableMap} secretKeys={secretKeys} />
      ))}
    </>
  );
}
