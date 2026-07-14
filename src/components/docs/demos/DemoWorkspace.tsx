import { CssClass } from "@/common/constants/css";
import { DataAttr, InputSelector } from "@/common/constants/dom";
import { MouseButton } from "@/common/constants/events";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import type { Block, Variable } from "@/common/types";
import { RunbookRow } from "@/components/sidebar/runbooks/RunbookRow";
import "@/components/sidebar/shared/SidebarSectionList.css";
import { VariableRow } from "@/components/sidebar/variables/VariableRow";
import {
  createAppStore,
  getActiveTab,
  StoreProvider,
  useStore,
  useStoreApi,
} from "@/store/store";
import { getUsedVariableKeys } from "@/utils/resolution";
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { buildDemoSeed, type DemoContent } from "./demoSeeds";
import { DocsDemo } from "./DocsDemo";

const EMPTY_CONTENT: DemoContent[] = [];

interface DemoWorkspaceProps {
  /** Open tabs; the first one is active. Defaults to a single empty tab. */
  tabs?: DemoContent[];
  /** Additional library entries without an open tab */
  library?: DemoContent[];
  /** Extra class on the demo frame (e.g. to hide the secret toggle) */
  className?: string;
  children: ReactNode;
}

/**
 * A docs playground running the REAL app components against an isolated
 * demo store: same state shape and actions, but nothing is persisted and
 * nothing touches the user's actual workspace. Children (BlocksList,
 * TabsBar, VariableRow, RunbookRow, ...) resolve the store from context.
 */
export function DemoWorkspace({
  tabs = EMPTY_CONTENT,
  library = EMPTY_CONTENT,
  className,
  children,
}: DemoWorkspaceProps) {
  // The app store's language; sections remount per language, so reading it
  // at store creation keeps demo UI strings in sync with the switcher
  const language = useStore((state) => state.language);

  const buildStore = () => {
    const { state, contentSeed } = buildDemoSeed(tabs, library, language);
    const store = createAppStore({ isDemo: true, contentSeed });
    store.setState(state);
    return store;
  };

  const [store, setStore] = useState(buildStore);
  const [version, setVersion] = useState(0);

  const reset = () => {
    setStore(buildStore());
    setVersion((count) => count + 1);
  };

  return (
    <StoreProvider value={store}>
      <DocsDemo onReset={reset} className={className}>
        {/* Remount on reset so component-local state clears too */}
        <div key={version} className="docs-demo-content">
          {children}
        </div>
      </DocsDemo>
    </StoreProvider>
  );
}

const EMPTY_VARIABLES: Variable[] = [];
const EMPTY_BLOCKS: Block[] = [];

/** The active tab's variables as real sidebar rows (sans section chrome) */
export function DemoVariableRows() {
  const activeTab = useStore(getActiveTab);
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const usedKeys = useMemo(
    () => getUsedVariableKeys(blocks, variables),
    [blocks, variables],
  );

  if (variables.length === 0) {
    return null;
  }

  return (
    <div className="docs-demo-variables">
      {variables.map((variable) => (
        <VariableRow
          key={variable.id}
          variable={variable}
          unused={!!variable.key.trim() && !usedKeys.has(variable.key.trim())}
        />
      ))}
    </div>
  );
}

/** The demo store's library as real runbook rows (sans section chrome) */
export function DemoRunbookList() {
  const library = useStore((state) => state.runbookLibrary);

  return (
    <div className="docs-demo-sidebar-frame">
      {library.map((runbook) => (
        <RunbookRow key={runbook.id} runbook={runbook} />
      ))}
    </div>
  );
}

/**
 * Multi-select wiring for a demo: the workspace handles shift+click and the
 * selection shortcuts at the document level (workspace-only hooks), so the
 * playground scopes the same behaviors to its own container.
 */
export function DemoSelectionArea({ children }: { children: ReactNode }) {
  const store = useStoreApi();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Select on mousedown: a shift+click on text starts a browser text
  // selection, and the slightest drag swallows the click event
  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!event.shiftKey || event.button !== MouseButton.LEFT) {
      return;
    }

    const blockId = (event.target as Element)
      .closest(`.${CssClass.BLOCK_ITEM}`)
      ?.getAttribute(DataAttr.BLOCK_ID);
    if (!blockId) {
      return;
    }

    // preventDefault also skips the focus move; refocus so the
    // Ctrl+D / Del / Escape shortcuts keep working
    event.preventDefault();
    wrapperRef.current?.focus();
    store.getState().toggleBlockSelection(blockId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as Element).matches(InputSelector.EDITABLE)) {
      return;
    }

    const state = store.getState();
    const firstSelected = [...state.selectedBlockIds][0];

    if (matchesKeybinding(event.nativeEvent, KeyBinding.DUPLICATE_BLOCK)) {
      event.preventDefault();
      if (firstSelected) {
        state.duplicateBlock(firstSelected);
      }
    } else if (matchesKeybinding(event.nativeEvent, KeyBinding.DELETE_BLOCK)) {
      if (firstSelected) {
        event.preventDefault();
        state.removeBlock(firstSelected);
      }
    } else if (matchesKeybinding(event.nativeEvent, KeyBinding.ESCAPE)) {
      state.clearBlockSelection();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="docs-demo-multiselect"
      tabIndex={0}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}
