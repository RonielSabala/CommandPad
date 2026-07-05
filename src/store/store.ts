import { create } from "zustand";

import {
  DEBOUNCE_SAVE_MS,
  DEFAULT_TAB_LABEL,
  RunbookConfig,
} from "@/common/config";
import {
  AppMode,
  BlockType,
  ExportFormat,
  MoveDirection,
  NoteStyle,
  SidebarPosition,
  Theme,
  VariableField,
} from "@/common/enums";
import type {
  Block,
  RunbookContent,
  RunbookEntry,
  Tab,
  Variable,
} from "@/common/types";
import { runExport } from "@/utils/export";
import { debounce, generateId } from "@/utils/id";
import { getRunbookLabel } from "@/utils/runbook";

import * as persistence from "./persistence";
import {
  deleteRunbookContent,
  deleteRunbookDb,
  getRunbookContent,
  putRunbookContent,
} from "./runbookDb";

interface Dialog<T> {
  message: string;
  resolve: (value: T) => void;
}

interface StoreState {
  // Data
  tabs: Tab[];
  activeTabId: string | null;
  runbookLibrary: RunbookEntry[];
  activeRunbookId: string | null;

  // UI
  mode: AppMode;
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarPosition: SidebarPosition;
  runbookSectionCollapsed: boolean;
  variablesSectionCollapsed: boolean;
  scrollTop: number;

  // Interaction / selection
  focusedRunbookId: string | null;
  selectedBlockIds: Set<string>;
  flashBlockIds: Set<string>;
  ctrlHeld: boolean;
  altHeld: boolean;
  pendingFocusBlockId: string | null;
  pendingFocusVariableId: string | null;

  // Search
  runbookSearchQuery: string;
  variableSearchQuery: string;

  // Modals / dialogs
  exportModalOpen: boolean;
  keybindingsModalOpen: boolean;
  confirmDialog: Dialog<boolean> | null;
  alertDialog: Dialog<void> | null;

  // Bootstrap
  initialized: boolean;

  // Actions
  bootstrap: () => Promise<void>;
  saveState: () => void;

  createNewTab: (
    label?: string,
    runbookId?: string | null,
  ) => Promise<Tab | undefined>;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  reorderTabs: (
    sourceId: string,
    targetId: string,
    insertAfter: boolean,
  ) => void;

  loadRunbookFromLibrary: (runbookId: string) => Promise<void>;
  removeRunbookFromLibrary: (id: string) => Promise<void>;
  importRunbooks: (files: File[]) => Promise<void>;
  reorderRunbooks: (sourceId: string, targetId: string) => void;
  setRunbookFocus: (id: string | null) => void;
  navigateRunbookList: (
    direction: typeof MoveDirection.UP | typeof MoveDirection.DOWN,
  ) => void;

  addVariable: () => Promise<void>;
  removeVariable: (variableId: string) => void;
  updateVariable: (
    variableId: string,
    field: typeof VariableField.KEY | typeof VariableField.VALUE,
    value: string,
  ) => void;
  toggleVariableSecret: (variableId: string) => void;
  reorderVariables: (sourceId: string, targetId: string) => void;
  consumeVariableFocus: () => void;

  addBlock: (blockType: BlockType) => Promise<void>;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  updateBlockText: (blockId: string, text: string) => void;
  updateBlockStyle: (blockId: string, style: NoteStyle) => void;
  toggleCommandEditor: (blockId: string) => void;
  toggleAllCommandEditors: () => void;
  reorderBlocks: (sourceId: string, targetId: string) => void;
  clearFlash: (blockId: string) => void;
  consumeBlockFocus: () => void;

  setBlockSelected: (blockId: string, selected: boolean) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;

  setAppMode: (mode: AppMode) => void;
  toggleAppMode: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleSidebarPosition: () => void;
  toggleRunbookSection: () => void;
  toggleVariablesSection: () => void;

  setRunbookSearchQuery: (query: string) => void;
  setVariableSearchQuery: (query: string) => void;

  setCtrlHeld: (held: boolean) => void;
  setAltHeld: (held: boolean) => void;
  setScrollTop: (scrollTop: number) => void;
  clearUserInteraction: () => void;

  openExportModal: () => void;
  closeExportModal: () => void;
  openKeybindingsModal: () => void;
  closeKeybindingsModal: () => void;
  exportRunbook: (format: ExportFormat) => Promise<void>;

  confirm: (message: string) => Promise<boolean>;
  resolveConfirm: (result: boolean) => void;
  alert: (message: string) => Promise<void>;
  resolveAlert: () => void;
  clearAllData: () => Promise<void>;
}

/** Resolve the active tab, mirroring the original `activeTab()` fallback. */
export function getActiveTab(state: StoreState): Tab | null {
  return (
    state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0] ?? null
  );
}

function createTabObject(
  label = DEFAULT_TAB_LABEL,
  runbookId: string | null = null,
): Tab {
  return { id: generateId(), label, runbookId, variables: [], blocks: [] };
}

/** Immutably replace the active tab via `mutate`. */
function withActiveTab(
  state: StoreState,
  mutate: (tab: Tab) => Tab,
): { tabs: Tab[] } {
  const active = getActiveTab(state);
  if (!active) {
    return { tabs: state.tabs };
  }
  return { tabs: state.tabs.map((t) => (t.id === active.id ? mutate(t) : t)) };
}

/**
 * Recompute the active tab's label from its blocks and mirror it into the
 * runbook library entry. Returns the same references when nothing changed so
 * the tabs bar / runbook list don't re-render needlessly.
 */
function relabelActive(state: StoreState): {
  tabs: Tab[];
  runbookLibrary: RunbookEntry[];
} {
  const active = getActiveTab(state);
  if (!active?.runbookId) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  const entry = state.runbookLibrary.find(
    (item) => item.id === active.runbookId,
  );
  if (!entry) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  const newLabel = getRunbookLabel(
    active.blocks,
    entry.filename || RunbookConfig.DEFAULT_LABEL,
  );
  if (newLabel === entry.label && newLabel === active.label) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  return {
    tabs: state.tabs.map((t) =>
      t.id === active.id ? { ...t, label: newLabel } : t,
    ),
    runbookLibrary: state.runbookLibrary.map((item) =>
      item.id === entry.id ? { ...item, label: newLabel } : item,
    ),
  };
}

let bootstrapped = false;

export const useStore = create<StoreState>()((set, get) => ({
  tabs: [],
  activeTabId: null,
  runbookLibrary: [],
  activeRunbookId: null,

  mode: AppMode.EDIT,
  theme: Theme.DARK,
  sidebarCollapsed: false,
  sidebarPosition: SidebarPosition.LEFT,
  runbookSectionCollapsed: false,
  variablesSectionCollapsed: false,
  scrollTop: 0,

  focusedRunbookId: null,
  selectedBlockIds: new Set(),
  flashBlockIds: new Set(),
  ctrlHeld: false,
  altHeld: false,
  pendingFocusBlockId: null,
  pendingFocusVariableId: null,

  runbookSearchQuery: "",
  variableSearchQuery: "",

  exportModalOpen: false,
  keybindingsModalOpen: false,
  confirmDialog: null,
  alertDialog: null,

  initialized: false,

  // --- Persistence ---

  saveState: () => {
    const state = get();
    if (!state.initialized) {
      return;
    }

    persistence.saveTabsMeta(state.tabs, state.activeTabId);
    persistence.saveRunbookLibrary(state.runbookLibrary, state.activeRunbookId);
    persistence.saveUiState({
      mode: state.mode,
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarPosition: state.sidebarPosition,
      scrollTop: state.scrollTop,
      theme: state.theme,
    });

    const active = getActiveTab(state);
    if (active?.runbookId) {
      putRunbookContent(active.runbookId, {
        variables: active.variables,
        blocks: active.blocks,
      }).catch((error) =>
        console.warn("Failed to persist runbook content:", error),
      );
    }
  },

  bootstrap: async () => {
    if (bootstrapped) {
      return;
    }
    bootstrapped = true;

    const ui = persistence.loadUiState();
    const library = persistence.loadRunbookLibrary();
    const sections = persistence.loadSidebarSections();

    set({
      ...(ui ?? {}),
      ...(library
        ? { runbookLibrary: library.items, activeRunbookId: library.activeId }
        : {}),
      ...(sections ?? {}),
    });

    // Rehydrate tab content from IndexedDB. Guarded so a storage failure still
    // lets the app finish booting (otherwise the body stays hidden).
    try {
      const meta = persistence.loadTabsMeta();
      if (meta) {
        const currentLibrary = get().runbookLibrary;
        const loadedTabs: Tab[] = [];

        for (const { tabId, runbookId } of meta.tabOrder) {
          const entry = currentLibrary.find((r) => r.id === runbookId);
          if (!entry || runbookId === null) {
            continue;
          }
          const content = await getRunbookContent(runbookId);
          if (!content) {
            continue;
          }
          loadedTabs.push({
            id: tabId,
            label: entry.label,
            runbookId,
            variables: content.variables ?? [],
            blocks: content.blocks ?? [],
          });
        }

        if (loadedTabs.length > 0) {
          const activeId =
            meta.activeTabId &&
            loadedTabs.some((t) => t.id === meta.activeTabId)
              ? meta.activeTabId
              : loadedTabs[0].id;
          const activeTab = loadedTabs.find((t) => t.id === activeId);
          set({
            tabs: loadedTabs,
            activeTabId: activeId,
            activeRunbookId: activeTab?.runbookId ?? null,
          });
        }
      }
    } catch (error) {
      console.warn("Failed to rehydrate tabs:", error);
    }

    set({ initialized: true });
  },

  // --- Tabs ---

  createNewTab: async (label, runbookId) => {
    const state = get();
    if (state.mode === AppMode.READ) {
      return;
    }

    if (runbookId) {
      const existingTab = state.tabs.find((t) => t.runbookId === runbookId);
      if (existingTab) {
        get().switchTab(existingTab.id);
        return existingTab;
      }
    }

    const resolvedLabel = label ?? DEFAULT_TAB_LABEL;
    const tab = createTabObject(resolvedLabel, runbookId ?? null);

    if (!runbookId) {
      const newRunbookId = generateId();
      tab.runbookId = newRunbookId;
      const entry: RunbookEntry = {
        id: newRunbookId,
        label: resolvedLabel,
        filename: "",
      };

      set((s) => ({
        tabs: [...s.tabs, tab],
        activeTabId: tab.id,
        runbookLibrary: [...s.runbookLibrary, entry],
        activeRunbookId: newRunbookId,
        focusedRunbookId: null,
      }));

      await putRunbookContent(newRunbookId, { variables: [], blocks: [] });
      persistence.saveRunbookLibrary(
        get().runbookLibrary,
        get().activeRunbookId,
      );
    } else {
      set((s) => ({
        tabs: [...s.tabs, tab],
        activeTabId: tab.id,
        focusedRunbookId: null,
      }));
    }

    persistence.saveTabsMeta(get().tabs, get().activeTabId);
    return tab;
  },

  switchTab: (tabId) => {
    if (get().activeTabId === tabId) {
      return;
    }
    set((s) => ({
      activeTabId: tabId,
      activeRunbookId:
        getActiveTab({ ...s, activeTabId: tabId })?.runbookId ?? null,
      ctrlHeld: false,
    }));
    persistence.saveTabsMeta(get().tabs, get().activeTabId);
  },

  closeTab: (tabId) => {
    const state = get();
    let idx = state.tabs.findIndex((t) => t.id === tabId);
    if (idx < 0) {
      return;
    }

    const tabs = state.tabs.filter((t) => t.id !== tabId);
    let activeTabId = state.activeTabId;

    if (tabs.length === 0) {
      activeTabId = null;
    } else if (state.activeTabId === tabId) {
      idx = Math.min(idx, tabs.length - 1);
      activeTabId = tabs[idx].id;
    }

    const activeRunbookId =
      tabs.find((t) => t.id === activeTabId)?.runbookId ?? null;
    set({ tabs, activeTabId, activeRunbookId });
    persistence.saveTabsMeta(tabs, activeTabId);
  },

  reorderTabs: (sourceId, targetId, insertAfter) => {
    const tabs = [...get().tabs];
    const srcIdx = tabs.findIndex((t) => t.id === sourceId);
    if (srcIdx < 0) {
      return;
    }

    const [dragged] = tabs.splice(srcIdx, 1);
    let dstIdx = tabs.findIndex((t) => t.id === targetId);
    if (insertAfter) {
      dstIdx++;
    }
    tabs.splice(dstIdx, 0, dragged);

    set({ tabs });
    persistence.saveTabsMeta(tabs, get().activeTabId);
  },

  // --- Runbook library ---

  loadRunbookFromLibrary: async (runbookId) => {
    const content = await getRunbookContent(runbookId);
    if (!content) {
      return;
    }

    const state = get();
    const existingTab = state.tabs.find((t) => t.runbookId === runbookId);
    if (existingTab) {
      get().switchTab(existingTab.id);
      return;
    }

    const runbook = state.runbookLibrary.find((r) => r.id === runbookId);
    const label = runbook?.label ?? DEFAULT_TAB_LABEL;
    const tab = createTabObject(label, runbookId);
    tab.variables = content.variables ?? [];
    tab.blocks = content.blocks ?? [];

    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: tab.id,
      activeRunbookId: runbookId,
    }));

    persistence.saveTabsMeta(get().tabs, get().activeTabId);
    persistence.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
  },

  removeRunbookFromLibrary: async (id) => {
    const state = get();
    if (state.mode === AppMode.READ) {
      return;
    }

    await deleteRunbookContent(id);

    const runbookLibrary = state.runbookLibrary.filter(
      (item) => item.id !== id,
    );
    let tabs = state.tabs;
    let activeTabId = state.activeTabId;

    let tabIdx = state.tabs.findIndex((t) => t.runbookId === id);
    if (tabIdx >= 0) {
      tabs = state.tabs.filter((t) => t.runbookId !== id);
      if (tabs.length === 0) {
        activeTabId = null;
      } else if (
        state.activeTabId === state.tabs[tabIdx]?.id ||
        !tabs.find((t) => t.id === activeTabId)
      ) {
        tabIdx = Math.min(tabIdx, tabs.length - 1);
        activeTabId = tabs[tabIdx].id;
      }
    }

    const activeRunbookId =
      tabs.find((t) => t.id === activeTabId)?.runbookId ?? null;
    const focusedRunbookId =
      state.focusedRunbookId === id ? null : state.focusedRunbookId;

    set({
      tabs,
      activeTabId,
      activeRunbookId,
      runbookLibrary,
      focusedRunbookId,
    });
    persistence.saveTabsMeta(tabs, activeTabId);
    persistence.saveRunbookLibrary(runbookLibrary, activeRunbookId);
  },

  importRunbooks: async (files) => {
    let failedCount = 0;

    const addToLibrary = async (content: RunbookContent, filename: string) => {
      const label = getRunbookLabel(
        content.blocks,
        filename || RunbookConfig.DEFAULT_LABEL,
      );
      const state = get();
      const existing = state.runbookLibrary.find(
        (item) => item.label === label || item.filename === filename,
      );

      if (existing) {
        await putRunbookContent(existing.id, content);
        set((s) => ({
          runbookLibrary: s.runbookLibrary.map((item) =>
            item.id === existing.id
              ? { ...item, label, filename: filename || "" }
              : item,
          ),
          tabs: s.tabs.map((t) =>
            t.runbookId === existing.id
              ? {
                  ...t,
                  variables: content.variables ?? [],
                  blocks: content.blocks ?? [],
                }
              : t,
          ),
        }));
        persistence.saveRunbookLibrary(
          get().runbookLibrary,
          get().activeRunbookId,
        );
        if (existing.id === get().activeRunbookId) {
          persistence.saveTabsMeta(get().tabs, get().activeTabId);
        }
        return;
      }

      const newId = generateId();
      await putRunbookContent(newId, content);
      set((s) => ({
        runbookLibrary: [
          ...s.runbookLibrary,
          { id: newId, label, filename: filename || "" },
        ],
      }));

      if (get().activeRunbookId) {
        persistence.saveRunbookLibrary(
          get().runbookLibrary,
          get().activeRunbookId,
        );
        return;
      }
      await get().loadRunbookFromLibrary(newId);
    };

    const readFile = (file: File) =>
      new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = async (loadEvent) => {
          try {
            const parsed = JSON.parse(String(loadEvent.target?.result));
            if (!parsed.variables || !parsed.blocks) {
              throw new Error("Invalid format");
            }

            const content: RunbookContent = {
              variables: (parsed.variables as Variable[]).map((variable) => ({
                ...variable,
                id: variable.id || generateId(),
              })),
              blocks: (parsed.blocks as Block[]).map((block) => ({
                ...block,
                id: block.id || generateId(),
              })),
            };

            await addToLibrary(content, file.name.replace(/\.json$/i, ""));
          } catch {
            failedCount += 1;
          }
          resolve();
        };
        reader.onerror = () => {
          failedCount += 1;
          resolve();
        };
        reader.readAsText(file);
      });

    await Promise.all(files.map(readFile));

    if (failedCount > 0) {
      await get().alert(
        `${failedCount} file(s) could not be imported because their formats aren't recognized.`,
      );
    }
  },

  reorderRunbooks: (sourceId, targetId) => {
    const items = [...get().runbookLibrary];
    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const [removed] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, removed);

    set({ runbookLibrary: items });
    persistence.saveRunbookLibrary(items, get().activeRunbookId);
  },

  setRunbookFocus: (id) => set({ focusedRunbookId: id }),

  navigateRunbookList: (direction) => {
    const { runbookLibrary, focusedRunbookId } = get();
    if (runbookLibrary.length === 0) {
      return;
    }

    const count = runbookLibrary.length;
    const currentIndex = runbookLibrary.findIndex(
      (item) => item.id === focusedRunbookId,
    );

    let nextIndex: number;
    if (currentIndex < 0) {
      nextIndex = direction === MoveDirection.DOWN ? 0 : count - 1;
    } else {
      nextIndex =
        direction === MoveDirection.DOWN
          ? (currentIndex + 1) % count
          : (currentIndex - 1 + count) % count;
    }

    const nextId = runbookLibrary[nextIndex].id;
    set({ focusedRunbookId: nextId });
    void get().loadRunbookFromLibrary(nextId);
  },

  // --- Variables ---

  addVariable: async () => {
    const state = get();
    if (state.mode === AppMode.READ) {
      return;
    }
    if (state.tabs.length === 0) {
      await get().createNewTab();
    }

    const newVariable: Variable = { id: generateId(), key: "", value: "" };
    set((s) => ({
      ...withActiveTab(s, (tab) => ({
        ...tab,
        variables: [...tab.variables, newVariable],
      })),
      pendingFocusVariableId: newVariable.id,
    }));
    get().saveState();
  },

  removeVariable: (variableId) => {
    if (get().mode === AppMode.READ) {
      return;
    }
    set((s) =>
      withActiveTab(s, (tab) => ({
        ...tab,
        variables: tab.variables.filter((v) => v.id !== variableId),
      })),
    );
    get().saveState();
  },

  updateVariable: (variableId, field, value) => {
    set((s) =>
      withActiveTab(s, (tab) => {
        const target = tab.variables.find((v) => v.id === variableId);
        if (!target) {
          return tab;
        }

        let blocks = tab.blocks;
        let variables = tab.variables;

        if (field === VariableField.KEY) {
          const oldKey = target.key.trim();
          const newKey = value.trim();
          if (oldKey && newKey && oldKey !== newKey) {
            const oldToken = `{${oldKey}}`;
            const newToken = `{${newKey}}`;
            blocks = tab.blocks.map((b) =>
              b.type === BlockType.COMMAND && b.text.includes(oldToken)
                ? { ...b, text: b.text.split(oldToken).join(newToken) }
                : b,
            );
            variables = tab.variables.map((v) =>
              v.id !== variableId && v.value.includes(oldToken)
                ? { ...v, value: v.value.split(oldToken).join(newToken) }
                : v,
            );
          }
        }

        variables = variables.map((v) =>
          v.id === variableId ? { ...v, [field]: value } : v,
        );
        return { ...tab, blocks, variables };
      }),
    );
    debouncedSaveState();
  },

  toggleVariableSecret: (variableId) => {
    set((s) =>
      withActiveTab(s, (tab) => ({
        ...tab,
        variables: tab.variables.map((v) =>
          v.id === variableId ? { ...v, secret: !v.secret } : v,
        ),
      })),
    );
    get().saveState();
  },

  reorderVariables: (sourceId, targetId) => {
    set((s) =>
      withActiveTab(s, (tab) => {
        const variables = [...tab.variables];
        const sourceIndex = variables.findIndex((v) => v.id === sourceId);
        const targetIndex = variables.findIndex((v) => v.id === targetId);
        if (sourceIndex < 0 || targetIndex < 0) {
          return tab;
        }
        const [removed] = variables.splice(sourceIndex, 1);
        variables.splice(targetIndex, 0, removed);
        return { ...tab, variables };
      }),
    );
    get().saveState();
  },

  consumeVariableFocus: () => set({ pendingFocusVariableId: null }),

  // --- Blocks ---

  addBlock: async (blockType) => {
    const state = get();
    if (state.mode === AppMode.READ) {
      return;
    }
    if (state.tabs.length === 0) {
      await get().createNewTab();
    }

    let newBlock: Block;
    if (blockType === BlockType.COMMAND) {
      newBlock = { id: generateId(), type: BlockType.COMMAND, text: "" };
    } else if (blockType === BlockType.NOTE) {
      newBlock = {
        id: generateId(),
        type: BlockType.NOTE,
        text: "",
        style: NoteStyle.BODY,
      };
    } else {
      newBlock = { id: generateId(), type: BlockType.DIVIDER };
    }

    set((s) => ({
      ...withActiveTab(s, (tab) => ({
        ...tab,
        blocks: [...tab.blocks, newBlock],
      })),
      pendingFocusBlockId: newBlock.id,
    }));
    get().saveState();
  },

  removeBlock: (blockId) => {
    const state = get();
    if (state.mode === AppMode.READ) {
      return;
    }

    const idsToRemove =
      state.selectedBlockIds.size > 0 && state.selectedBlockIds.has(blockId)
        ? new Set(state.selectedBlockIds)
        : new Set([blockId]);

    set((s) => ({
      ...withActiveTab(s, (tab) => ({
        ...tab,
        blocks: tab.blocks.filter((b) => !idsToRemove.has(b.id)),
      })),
      selectedBlockIds: new Set(),
    }));
    get().saveState();
  },

  duplicateBlock: (blockId) => {
    const state = get();
    if (state.mode === AppMode.READ) {
      return;
    }

    const active = getActiveTab(state);
    if (!active) {
      return;
    }

    const idsToDuplicate =
      state.selectedBlockIds.size > 0 && state.selectedBlockIds.has(blockId)
        ? [...state.selectedBlockIds].sort(
            (a, b) =>
              active.blocks.findIndex((bl) => bl.id === a) -
              active.blocks.findIndex((bl) => bl.id === b),
          )
        : [blockId];

    const lastId = idsToDuplicate[idsToDuplicate.length - 1];
    const lastIndex = active.blocks.findIndex((b) => b.id === lastId);

    const duplicated = idsToDuplicate
      .map((id) => {
        const source = active.blocks.find((b) => b.id === id);
        return source ? { ...source, id: generateId() } : null;
      })
      .filter((b): b is Block => b !== null);

    set((s) => ({
      ...withActiveTab(s, (tab) => {
        const blocks = [...tab.blocks];
        blocks.splice(lastIndex + 1, 0, ...duplicated);
        return { ...tab, blocks };
      }),
      flashBlockIds: new Set(duplicated.map((b) => b.id)),
    }));
    get().saveState();
  },

  updateBlockText: (blockId, text) => {
    if (get().mode === AppMode.READ) {
      return;
    }
    set((s) => {
      const updated = withActiveTab(s, (tab) => ({
        ...tab,
        blocks: tab.blocks.map((b) => (b.id === blockId ? { ...b, text } : b)),
      }));
      return { ...updated, ...relabelActive({ ...s, ...updated }) };
    });
    debouncedSaveState();
  },

  updateBlockStyle: (blockId, style) => {
    if (get().mode === AppMode.READ) {
      return;
    }
    set((s) =>
      withActiveTab(s, (tab) => ({
        ...tab,
        blocks: tab.blocks.map((b) =>
          b.id === blockId && b.type === BlockType.NOTE ? { ...b, style } : b,
        ),
      })),
    );
    get().saveState();
  },

  toggleCommandEditor: (blockId) => {
    if (get().mode === AppMode.READ) {
      return;
    }
    set((s) =>
      withActiveTab(s, (tab) => ({
        ...tab,
        blocks: tab.blocks.map((b) =>
          b.id === blockId && b.type === BlockType.COMMAND
            ? { ...b, editorCollapsed: !b.editorCollapsed }
            : b,
        ),
      })),
    );
    get().saveState();
  },

  toggleAllCommandEditors: () => {
    const state = get();
    if (state.mode === AppMode.READ) {
      return;
    }
    const active = getActiveTab(state);
    if (!active) {
      return;
    }

    const allCollapsed = active.blocks
      .filter((b) => b.type === BlockType.COMMAND)
      .every(
        (b) => (b as { editorCollapsed?: boolean }).editorCollapsed === true,
      );
    const newState = !allCollapsed;

    set((s) =>
      withActiveTab(s, (tab) => ({
        ...tab,
        blocks: tab.blocks.map((b) =>
          b.type === BlockType.COMMAND
            ? { ...b, editorCollapsed: newState }
            : b,
        ),
      })),
    );
    get().saveState();
  },

  reorderBlocks: (sourceId, targetId) => {
    const state = get();
    if (state.mode === AppMode.READ || sourceId === targetId) {
      return;
    }
    const active = getActiveTab(state);
    if (!active) {
      return;
    }

    const movingIds =
      state.selectedBlockIds.size > 0 && state.selectedBlockIds.has(sourceId)
        ? [...state.selectedBlockIds]
        : [sourceId];

    const targetIndex = active.blocks.findIndex((b) => b.id === targetId);
    const sourceIndex = active.blocks.findIndex((b) => b.id === sourceId);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const movingBlocks = movingIds
      .map((id) => active.blocks.find((b) => b.id === id))
      .filter((b): b is Block => b !== undefined)
      .sort((a, b) => active.blocks.indexOf(a) - active.blocks.indexOf(b));

    set((s) =>
      withActiveTab(s, (tab) => {
        const remaining = tab.blocks.filter((b) => !movingIds.includes(b.id));
        const newTargetIndex = remaining.findIndex((b) => b.id === targetId);
        const insertIndex =
          sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex;
        remaining.splice(insertIndex, 0, ...movingBlocks);
        return { ...tab, blocks: remaining };
      }),
    );
    get().saveState();
  },

  clearFlash: (blockId) =>
    set((s) => {
      if (!s.flashBlockIds.has(blockId)) {
        return {};
      }
      const flashBlockIds = new Set(s.flashBlockIds);
      flashBlockIds.delete(blockId);
      return { flashBlockIds };
    }),

  consumeBlockFocus: () => set({ pendingFocusBlockId: null }),

  // --- Selection ---

  setBlockSelected: (blockId, selected) =>
    set((s) => {
      const selectedBlockIds = new Set(s.selectedBlockIds);
      if (selected) {
        selectedBlockIds.add(blockId);
      } else {
        selectedBlockIds.delete(blockId);
      }
      return { selectedBlockIds };
    }),

  toggleBlockSelection: (blockId) =>
    get().setBlockSelected(blockId, !get().selectedBlockIds.has(blockId)),

  clearBlockSelection: () => {
    if (get().selectedBlockIds.size === 0) {
      return;
    }
    set({ selectedBlockIds: new Set() });
  },

  // --- Mode / theme / sidebar ---

  setAppMode: (mode) => {
    set({ mode });
    get().saveState();
  },

  toggleAppMode: () => {
    const wasRead = get().mode === AppMode.READ;
    if (!wasRead) {
      get().clearUserInteraction();
    }
    get().setAppMode(wasRead ? AppMode.EDIT : AppMode.READ);
  },

  toggleTheme: () => {
    set((s) => ({ theme: s.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT }));
    const state = get();
    persistence.saveUiState({
      mode: state.mode,
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarPosition: state.sidebarPosition,
      scrollTop: state.scrollTop,
      theme: state.theme,
    });
  },

  toggleSidebar: () => {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
    get().saveState();
  },

  toggleSidebarPosition: () => {
    set((s) => ({
      sidebarPosition:
        s.sidebarPosition === SidebarPosition.RIGHT
          ? SidebarPosition.LEFT
          : SidebarPosition.RIGHT,
    }));
    get().saveState();
  },

  toggleRunbookSection: () => {
    set((s) => ({ runbookSectionCollapsed: !s.runbookSectionCollapsed }));
    const state = get();
    persistence.saveSidebarSections({
      runbookSectionCollapsed: state.runbookSectionCollapsed,
      variablesSectionCollapsed: state.variablesSectionCollapsed,
    });
  },

  toggleVariablesSection: () => {
    set((s) => ({ variablesSectionCollapsed: !s.variablesSectionCollapsed }));
    const state = get();
    persistence.saveSidebarSections({
      runbookSectionCollapsed: state.runbookSectionCollapsed,
      variablesSectionCollapsed: state.variablesSectionCollapsed,
    });
  },

  // --- Search ---

  setRunbookSearchQuery: (query) => set({ runbookSearchQuery: query }),
  setVariableSearchQuery: (query) => set({ variableSearchQuery: query }),

  // --- Interaction ---

  setCtrlHeld: (held) => set({ ctrlHeld: held }),
  setAltHeld: (held) => set({ altHeld: held }),
  setScrollTop: (scrollTop) => {
    set({ scrollTop });
    const state = get();
    persistence.saveUiState({
      mode: state.mode,
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarPosition: state.sidebarPosition,
      scrollTop,
      theme: state.theme,
    });
  },

  clearUserInteraction: () =>
    set({
      ctrlHeld: false,
      altHeld: false,
      selectedBlockIds: new Set(),
      focusedRunbookId: null,
    }),

  // --- Modals / export ---

  openExportModal: () => set({ exportModalOpen: true }),
  closeExportModal: () => set({ exportModalOpen: false }),
  openKeybindingsModal: () => set({ keybindingsModalOpen: true }),
  closeKeybindingsModal: () => set({ keybindingsModalOpen: false }),

  exportRunbook: async (format) => {
    set({ exportModalOpen: false });
    const active = getActiveTab(get());
    await runExport(format, {
      variables: active?.variables ?? [],
      blocks: active?.blocks ?? [],
    });
  },

  // --- Dialogs ---

  confirm: (message) =>
    new Promise<boolean>((resolve) =>
      set({ confirmDialog: { message, resolve } }),
    ),
  resolveConfirm: (result) => {
    get().confirmDialog?.resolve(result);
    set({ confirmDialog: null });
  },
  alert: (message) =>
    new Promise<void>((resolve) => set({ alertDialog: { message, resolve } })),
  resolveAlert: () => {
    get().alertDialog?.resolve();
    set({ alertDialog: null });
  },

  clearAllData: async () => {
    set({ ctrlHeld: false });
    const confirmed = await get().confirm(
      "Delete all variables, blocks, and runbooks? This action cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    await deleteRunbookDb();
    localStorage.clear();

    set({
      tabs: [],
      activeTabId: null,
      activeRunbookId: null,
      runbookLibrary: [],
      runbookSearchQuery: "",
      variableSearchQuery: "",
      selectedBlockIds: new Set(),
      focusedRunbookId: null,
    });
  },
}));

const debouncedSaveState = debounce(
  () => useStore.getState().saveState(),
  DEBOUNCE_SAVE_MS,
);
