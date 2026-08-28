import {
  ContextMenu,
  ContextMenuItem,
  type ContextMenuAnchor,
} from "@/components/common/contextMenu/ContextMenu";
import { useTranslation } from "@/i18n";
import { useStore, useStoreApi } from "@/store/store";

interface Props {
  tabId: string;
  anchor: ContextMenuAnchor;
  onClose: () => void;
}

export function TabContextMenu({ tabId, anchor, onClose }: Props) {
  const t = useTranslation();
  const store = useStoreApi();
  const isOnlyTab = useStore((state) => state.tabs.length < 2);

  const closeTabs = (tabIds: string[]) => store.getState().closeTabs(tabIds);
  const allTabIds = () => store.getState().tabs.map((tab) => tab.id);
  const otherTabIds = () =>
    store
      .getState()
      .tabs.filter((tab) => tab.id !== tabId)
      .map((tab) => tab.id);

  return (
    <ContextMenu anchor={anchor} onClose={onClose}>
      <ContextMenuItem onSelect={() => closeTabs([tabId])}>
        {t.tabs.close}
      </ContextMenuItem>

      <ContextMenuItem
        disabled={isOnlyTab}
        onSelect={() => closeTabs(otherTabIds())}
      >
        {t.tabs.closeOthers}
      </ContextMenuItem>

      <ContextMenuItem onSelect={() => closeTabs(allTabIds())}>
        {t.tabs.closeAll}
      </ContextMenuItem>
    </ContextMenu>
  );
}
