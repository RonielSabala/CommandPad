import { InputSelector } from "@/common/constants/dom";
import { SelectionGroup } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import type { Block, Variable } from "@/common/types";
import { ImageLightbox } from "@/components/blocks/image/ImageLightbox";
import { RunbookRow } from "@/components/sidebar/runbooks/RunbookRow";
import "@/components/sidebar/shared/SidebarSectionList.css";
import { VariableRow } from "@/components/sidebar/variables/VariableRow";
import { useSelectModeBodyClass } from "@/hooks/useBodyClasses";
import { useLassoSelection } from "@/hooks/useLassoSelection";
import {
  createAppStore,
  getActiveTab,
  StoreProvider,
  useStore,
  useStoreApi,
} from "@/store/store";
import { getUsedVariableKeys, isVariableUnused } from "@/utils/resolution";
import {
  useLayoutEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  buildDemoSeed,
  demoSeedSignature,
  type DemoContent,
  type DemoSeed,
} from "./demoSeeds";
import "./DemoWorkspace.css";
import { DocsDemo } from "./DocsDemo";

const EMPTY_CONTENT: DemoContent[] = [];

interface DemoWorkspaceProps {
  tabs?: DemoContent[];
  library?: DemoContent[];
  className?: string;
  children: ReactNode;
}

/**
 * A docs playground running the real app components against an isolated demo store.
 */
export function DemoWorkspace({
  tabs = EMPTY_CONTENT,
  library = EMPTY_CONTENT,
  className,
  children,
}: DemoWorkspaceProps) {
  const language = useStore((state) => state.language);
  const theme = useStore((state) => state.theme);

  const buildDemo = (
    previous?: DemoSeed,
    signature = demoSeedSignature(tabs, library),
  ) => {
    const seed = buildDemoSeed(tabs, library, language, previous);
    const store = createAppStore({
      isDemo: true,
      contentSeed: seed.contentSeed,
    });

    store.setState({ ...seed.state, theme });
    return { store, seed, language, signature };
  };

  const [demo, setDemo] = useState(() => buildDemo());
  const [version, setVersion] = useState(0);
  const { store } = demo;

  const reset = () => {
    setDemo(buildDemo());
    setVersion((count) => count + 1);
  };

  // A language switch reseeds only a demo whose content is translated
  if (demo.language !== language) {
    const signature = demoSeedSignature(tabs, library);
    setDemo(
      signature === demo.signature
        ? { ...demo, language }
        : buildDemo(demo.seed, signature),
    );
  }

  useLayoutEffect(() => {
    store.setState({ theme, language });
  }, [store, theme, language]);

  return (
    <StoreProvider value={store}>
      <DocsDemo onReset={reset} className={className}>
        <div key={version} className="docs-demo-content">
          {children}
        </div>
      </DocsDemo>
      <ImageLightbox />
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

  const showSecretColumn = variables.some((variable) => variable.secret);

  return (
    <div className="docs-demo-variables">
      {variables.map((variable) => (
        <VariableRow
          key={variable.id}
          variable={variable}
          unused={isVariableUnused(variable, usedKeys)}
          showSecretColumn={showSecretColumn}
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

/** Multi-select for a demo. */
export function DemoSelectionArea({ children }: { children: ReactNode }) {
  const store = useStoreApi();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useLassoSelection(root, SelectionGroup.BLOCK);
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
