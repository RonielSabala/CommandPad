import { RunbookView } from "@/common/enums";
import { getVariableKey } from "@/utils/resolution";
import { revealVariables } from "@/utils/variableSections";

import type { StoreKit } from "@/store/kit";
import { getActiveTab, getRunbookView } from "@/store/selectors";
import { withActiveTab } from "@/store/tabState";
import type { StoreState } from "@/store/types";

type InteractionActions = Pick<
  StoreState,
  | "revealBlock"
  | "finishBlockReveal"
  | "clearBlockReveal"
  | "revealVariable"
  | "revealEmbeddedVariable"
  | "finishVariableReveal"
  | "clearVariableReveal"
  | "toggleClampSurfaceExpanded"
  | "openImageViewer"
  | "closeImageViewer"
  | "setBlockSelected"
  | "toggleBlockSelection"
  | "clearBlockSelection"
  | "setVariableSelected"
  | "toggleVariableSelection"
  | "clearVariableSelection"
  | "setSelectKeyHeld"
  | "setLinkKeyHeld"
  | "setScrollTop"
  | "clearUserInteraction"
>;

export function createInteractionSlice(kit: StoreKit): InteractionActions {
  const { set, get, persist } = kit;

  return {
    revealBlock: (tabId, blockId) => {
      get().switchTab(tabId);

      const view = getRunbookView(get());
      if (view !== RunbookView.PREVIEW) {
        get().toggleRunbookView(view);
      }

      set({ pendingRevealBlockId: blockId });
    },

    finishBlockReveal: () =>
      set((s) =>
        s.pendingRevealBlockId
          ? {
              pendingRevealBlockId: null,
              revealedBlockId: s.pendingRevealBlockId,
            }
          : {},
      ),

    clearBlockReveal: () => set({ revealedBlockId: null }),

    revealVariable: (variableId, resolved) => {
      if (getRunbookView(get()) !== RunbookView.VARIABLES) {
        get().toggleRunbookView(RunbookView.VARIABLES);
      }

      // A folded section unfolds to show it
      set((s) => {
        const tab = getActiveTab(s);
        const sections = tab
          ? revealVariables(tab, new Set([variableId]))
          : undefined;

        const unfold =
          tab && sections && sections !== tab.variableSections
            ? withActiveTab(s, (active) => ({
                ...active,
                variableSections: sections,
              }))
            : {};

        return {
          ...unfold,
          pendingRevealVariable: { id: variableId, resolved },
        };
      });

      get().saveState();
    },

    revealEmbeddedVariable: async (source, key, resolved) => {
      const before = get().activeTabId;
      await get().openEmbeddedRunbook(source);

      const state = get();
      if (state.activeTabId === before) {
        return;
      }

      const variable = getActiveTab(state)?.variables.find(
        (v) => getVariableKey(v) === key,
      );
      if (variable) {
        state.revealVariable(variable.id, resolved);
      }
    },

    finishVariableReveal: () =>
      set((s) =>
        s.pendingRevealVariable
          ? {
              pendingRevealVariable: null,
              revealedVariable: s.pendingRevealVariable,
            }
          : {},
      ),

    clearVariableReveal: () => set({ revealedVariable: null }),

    toggleClampSurfaceExpanded: (id, surface) =>
      set((s) => {
        const ids = new Set(s.expandedClampSurfaces[surface]);
        if (ids.has(id)) {
          ids.delete(id);
        } else {
          ids.add(id);
        }

        return {
          expandedClampSurfaces: {
            ...s.expandedClampSurfaces,
            [surface]: ids,
          },
        };
      }),

    openImageViewer: (blockId, slides) =>
      set({ imageViewerBlockId: blockId, imageViewerSlides: slides ?? null }),

    closeImageViewer: () =>
      set({ imageViewerBlockId: null, imageViewerSlides: null }),

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

    setVariableSelected: (variableId, selected) =>
      set((s) => {
        const selectedVariableIds = new Set(s.selectedVariableIds);
        if (selected) {
          selectedVariableIds.add(variableId);
        } else {
          selectedVariableIds.delete(variableId);
        }

        return { selectedVariableIds };
      }),

    toggleVariableSelection: (variableId) =>
      get().setVariableSelected(
        variableId,
        !get().selectedVariableIds.has(variableId),
      ),

    clearVariableSelection: () => {
      if (get().selectedVariableIds.size === 0) {
        return;
      }

      set({ selectedVariableIds: new Set() });
    },

    setSelectKeyHeld: (held) => set({ selectKeyHeld: held }),
    setLinkKeyHeld: (held) => set({ linkKeyHeld: held }),
    setScrollTop: (view, scrollTop) => {
      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          scrollTop: { ...tab.scrollTop, [view]: scrollTop },
        })),
      );
      persist.saveTabsMeta(get().tabs, get().activeTabId);
    },

    clearUserInteraction: () =>
      set({
        selectKeyHeld: false,
        linkKeyHeld: false,
        selectedBlockIds: new Set(),
        selectedVariableIds: new Set(),
        focusedRunbookId: null,
      }),
  };
}
