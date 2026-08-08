import { PanelSide } from "@/common/enums";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  type ContextMenuAnchor,
} from "@/components/common/contextMenu/ContextMenu";
import { CopyIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";

interface Props {
  anchor: ContextMenuAnchor;
  onClose: () => void;
}

export function WorkspaceContextMenu({ anchor, onClose }: Props) {
  const t = useTranslation();
  const isEmpty = useStore((state) => !getActiveTab(state)?.blocks.length);
  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapOnLeft = useStore(
    (state) => state.minimapPosition === PanelSide.LEFT,
  );
  const spellcheckEnabled = useStore((state) => state.spellcheckEnabled);

  const copyRunbookMarkdown = useStore((state) => state.copyRunbookMarkdown);
  const toggleMinimap = useStore((state) => state.toggleMinimap);
  const toggleMinimapPosition = useStore(
    (state) => state.toggleMinimapPosition,
  );
  const toggleSpellcheck = useStore((state) => state.toggleSpellcheck);

  return (
    <ContextMenu anchor={anchor} onClose={onClose}>
      <ContextMenuItem
        icon={<CopyIcon className="icon-md icon-bold" />}
        disabled={isEmpty}
        onSelect={() => void copyRunbookMarkdown()}
      >
        {t.contextMenu.copyMarkdown}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem checked={spellcheckEnabled} onSelect={toggleSpellcheck}>
        {t.contextMenu.spellcheck}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem checked={minimapEnabled} onSelect={toggleMinimap}>
        {t.contextMenu.minimap}
      </ContextMenuItem>

      {minimapEnabled && (
        <ContextMenuItem onSelect={toggleMinimapPosition}>
          {minimapOnLeft
            ? t.contextMenu.moveMinimapRight
            : t.contextMenu.moveMinimapLeft}
        </ContextMenuItem>
      )}
    </ContextMenu>
  );
}
