import { CssClass } from "@/common/constants/css";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { ContextMenuItem } from "@/components/common/ContextMenu";
import { DuplicateIcon, TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";

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

  return (
    <ActionsMenu className={CssClass.BLOCK_ACTIONS} title={t.blocks.actions}>
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
    </ActionsMenu>
  );
}
