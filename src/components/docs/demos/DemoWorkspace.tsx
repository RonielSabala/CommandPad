import { InputSelector } from "@/common/constants/dom";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import type { Block, Variable } from "@/common/types";
import { RunbookRow } from "@/components/sidebar/runbooks/RunbookRow";
import "@/components/sidebar/shared/SidebarSectionList.css";
import { VariableRow } from "@/components/sidebar/variables/VariableRow";
import { useBlockSelection } from "@/hooks/useBlockSelection";
import { useSelectModeBodyClass } from "@/hooks/useBodyClasses";
import {
  createAppStore,
  getActiveTab,
  StoreProvider,
  useStore,
  useStoreApi,
} from "@/store/store";
import { getUsedVariableKeys } from "@/utils/resolution";
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { buildDemoSeed, type DemoContent } from "./demoSeeds";
import { DocsDemo } from "./DocsDemo";

const EMPTY_CONTENT: DemoContent[] = [];

interface DemoWorkspaceProps {
  tabs?: DemoContent[];
  library?: DemoContent[];
  className?: string;
  children: ReactNode;
}

/**
 * A docs playground running the REAL app components against an isolated demo store.
 */
export function DemoWorkspace({
  tabs = EMPTY_CONTENT,
  library = EMPTY_CONTENT,
  className,
  children,
}: DemoWorkspaceProps) {
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
        <div key={version} className="docs-demo-content">
          {children}
        </div>
      </DocsDemo>
    </StoreProvider>
  );
}

const EMPTY_VARIABLES: Variable[] = [];
const EMPTY_BLOCKS: Block[] = [];

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

/** Multi-select for a demo */
export function DemoSelectionArea({ children }: { children: ReactNode }) {
  const store = useStoreApi();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useBlockSelection(root);
  useSelectModeBodyClass();

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
      ref={setRoot}
      className="docs-demo-multiselect"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}
