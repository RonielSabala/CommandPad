import { AppMode } from "@/common/enums";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  type ContextMenuAnchor,
} from "@/components/common/contextMenu/ContextMenu";
import { useTranslation } from "@/i18n";
import {
  getLibraryRunbook,
  getTabById,
  useStore,
  useStoreApi,
} from "@/store/store";

interface Props {
  tabId: string;
  anchor: ContextMenuAnchor;
  onClose: () => void;
  onRename: (tabId: string) => void;
}

export function TabContextMenu({ tabId, anchor, onClose, onRename }: Props) {
  const t = useTranslation();
  const store = useStoreApi();
  const isOnlyTab = useStore((state) => state.tabs.length < 2);
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const runbookId = useStore(
    (state) => getTabById(state, tabId)?.runbookId ?? null,
  );
  const named = useStore(
    (state) => !!runbookId && !!getLibraryRunbook(state, runbookId)?.named,
  );

  const resetName = () => {
    if (runbookId) {
      void store.getState().resetRunbookName(runbookId);
    }
  };

  const closeTabs = (tabIds: string[]) => store.getState().closeTabs(tabIds);
  const allTabIds = () => store.getState().tabs.map((tab) => tab.id);
  const otherTabIds = () =>
    store
      .getState()
      .tabs.filter((tab) => tab.id !== tabId)
      .map((tab) => tab.id);

  return (
    <ContextMenu anchor={anchor} onClose={onClose}>
      {!readMode && runbookId && (
        <>
          <ContextMenuItem onSelect={() => onRename(tabId)}>
            {t.runbooks.rename}
          </ContextMenuItem>

          {named && (
            <ContextMenuItem onSelect={resetName}>
              {t.runbooks.resetName}
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />
        </>
      )}

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
