import {
  createBlock,
  getBlockLabelText,
  isBlockFoldable,
  isBlockFolded,
  mapBlockCommandTexts,
  setBlockFolded,
} from "@/blocks";
import {
  AppMode,
  BlockType,
  InsertPosition,
  RunbookView,
} from "@/common/enums";
import type { Block } from "@/common/types";
import { generateId } from "@/utils/id";
import { carryVariables, renameAllCommandTokens } from "@/utils/resolution";
import { toggleAllSections } from "@/utils/variableSections";

import type { StoreKit } from "@/store/kit";
import { getActiveTab, getRunbookView } from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import {
  tabContent,
  withActiveTab,
  relabelTab,
  relabelActive,
} from "@/store/tabState";
import type { StoreState } from "@/store/types";

type BlocksActions = Pick<
  StoreState,
  | "addBlock"
  | "removeBlock"
  | "duplicateBlock"
  | "copyBlocksToTab"
  | "updateBlock"
  | "setRunbookOverrides"
  | "toggleAllBlocksFolded"
  | "toggleCollapseAll"
  | "reorderBlocks"
  | "clearFlash"
  | "consumeBlockFocus"
>;

export function createBlocksSlice(
  kit: StoreKit,
  services: StoreServices,
): BlocksActions {
  const { set, get, debouncedSaveState } = kit;
  const { trackCloudChanges, writeRunbookContent } = services;

  return {
    addBlock: async (blockType, anchor) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }
      if (state.tabs.length === 0) {
        await get().createNewTab();
      }

      const newBlock = createBlock(blockType);

      set((s) => ({
        ...withActiveTab(s, (tab) => {
          const blocks = [...tab.blocks];
          const anchorIndex = anchor
            ? blocks.findIndex((b) => b.id === anchor.blockId)
            : -1;

          // An unknown anchor appends to the end
          if (anchorIndex < 0) {
            blocks.push(newBlock);
          } else {
            const offset = anchor?.position === InsertPosition.ABOVE ? 0 : 1;
            blocks.splice(anchorIndex + offset, 0, newBlock);
          }

          return { ...tab, blocks };
        }),
        pendingFocusBlockId: newBlock.id,
      }));
      get().saveState();
    },

    removeBlock: (blockId) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const isSelected =
        state.selectedBlockIds.size > 0 && state.selectedBlockIds.has(blockId);

      const idsToRemove = isSelected
        ? new Set(state.selectedBlockIds)
        : new Set([blockId]);

      set((s) => {
        const updated = withActiveTab(s, (tab) => ({
          ...tab,
          blocks: tab.blocks.filter((b) => !idsToRemove.has(b.id)),
        }));

        return {
          ...updated,
          ...relabelActive({ ...s, ...updated }),
          selectedBlockIds: isSelected ? new Set() : s.selectedBlockIds,
        };
      });
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

      const isFromSelection =
        state.selectedBlockIds.size > 0 && state.selectedBlockIds.has(blockId);

      const idsToDuplicate = isFromSelection
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
        pendingFocusBlockId: isFromSelection
          ? null
          : (duplicated[duplicated.length - 1]?.id ?? null),
      }));
      get().saveState();
    },

    copyBlocksToTab: (sourceTabId, targetTabId, blockIds, beforeBlockId) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const source = state.tabs.find((t) => t.id === sourceTabId);
      const target = state.tabs.find((t) => t.id === targetTabId);
      if (!source || !target || source.id === target.id) {
        return;
      }

      // Copy in source document order, regardless of selection order
      const ordered = source.blocks.filter((b) => blockIds.includes(b.id));
      if (ordered.length === 0) {
        return;
      }

      // Carry over referenced variables
      const { variables: carriedVariables, renames } = carryVariables(
        ordered,
        source.variables,
        target.variables,
      );

      const copies = ordered.map((b) => ({
        ...mapBlockCommandTexts(b, (text) =>
          renameAllCommandTokens(text, renames),
        ),
        id: generateId(),
      }));

      set((s) => {
        const tabs = s.tabs.map((t) => {
          if (t.id !== targetTabId) {
            return t;
          }

          // Insert before the given block, or append at the end
          const blocks = [...t.blocks];
          const beforeIndex = beforeBlockId
            ? blocks.findIndex((b) => b.id === beforeBlockId)
            : -1;

          blocks.splice(
            beforeIndex >= 0 ? beforeIndex : blocks.length,
            0,
            ...copies,
          );

          return {
            ...t,
            blocks,
            variables: [...t.variables, ...carriedVariables],
          };
        });

        const next = { ...s, tabs };
        return {
          ...relabelTab(next, tabs.find((t) => t.id === targetTabId) ?? null),
          flashBlockIds: new Set(copies.map((b) => b.id)),
        };
      });

      // saveState only persists the active tab, so another target is written here
      const updated = get().tabs.find((t) => t.id === targetTabId);
      if (updated?.runbookId && updated.id !== getActiveTab(get())?.id) {
        const content = tabContent(updated);
        writeRunbookContent(updated.runbookId, content).catch((error) =>
          console.warn("Failed to persist runbook content:", error),
        );

        trackCloudChanges(updated.runbookId, content);
      }

      get().saveState();
    },

    updateBlock: (blockId, type, patch) => {
      if (get().mode === AppMode.READ) {
        return;
      }

      set((s) => {
        const updated = withActiveTab(s, (tab) => ({
          ...tab,
          blocks: tab.blocks.map((b) =>
            b.id === blockId && b.type === type
              ? ({ ...b, ...patch } as Block)
              : b,
          ),
        }));

        // The label comes from the first block that can name a runbook
        const next = { ...s, ...updated };
        const first = getActiveTab(next)?.blocks[0];
        const namesRunbook =
          first?.id === blockId && getBlockLabelText(first) !== null;

        return namesRunbook ? { ...updated, ...relabelActive(next) } : updated;
      });

      debouncedSaveState();
    },

    setRunbookOverrides: (blockId, overrides) => {
      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          blocks: tab.blocks.map((b) =>
            b.id === blockId && b.type === BlockType.RUNBOOK
              ? { ...b, overrides }
              : b,
          ),
        })),
      );

      debouncedSaveState();
    },

    toggleAllBlocksFolded: () => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const active = getActiveTab(state);
      if (!active) {
        return;
      }

      const folded = !active.blocks
        .filter(isBlockFoldable)
        .every(isBlockFolded);

      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          blocks: tab.blocks.map((b) => setBlockFolded(b, folded)),
        })),
      );
      get().saveState();
    },

    toggleCollapseAll: () => {
      const state = get();
      const tab = getActiveTab(state);
      if (getRunbookView(state) !== RunbookView.VARIABLES) {
        state.toggleAllBlocksFolded();
        return;
      }

      if (!tab?.variableSections.length) {
        return;
      }

      const variableSections = toggleAllSections(tab);
      const hidden = variableSections.some((section) => section.collapsed)
        ? new Set(
            tab.variables
              .slice(variableSections[0].start)
              .map((variable) => variable.id),
          )
        : new Set<string>();

      set((s) => ({
        ...withActiveTab(s, (t) => ({ ...t, variableSections })),
        selectedVariableIds: new Set(
          [...s.selectedVariableIds].filter((id) => !hidden.has(id)),
        ),
      }));

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

      set((s) => {
        const updated = withActiveTab(s, (tab) => {
          const remaining = tab.blocks.filter((b) => !movingIds.includes(b.id));
          const newTargetIndex = remaining.findIndex((b) => b.id === targetId);

          const insertIndex =
            sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex;
          remaining.splice(insertIndex, 0, ...movingBlocks);

          return { ...tab, blocks: remaining };
        });

        // A different block may now be the first one, which names the runbook
        return { ...updated, ...relabelActive({ ...s, ...updated }) };
      });
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
  };
}
