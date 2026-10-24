import { mapBlockCommandTexts } from "@/blocks";
import {
  AppMode,
  RunbookView,
  VariableEntryKind,
  VariableField,
  VariableKind,
} from "@/common/enums";
import { generateId } from "@/utils/id";
import {
  applyOperations,
  extractedVariableKey,
  getVariableKey,
  renameCommandTokens,
  renameValueTokens,
  uniqueCopyKey,
} from "@/utils/resolution";
import {
  entryId,
  fromVariableEntries,
  mapVariableEntries,
  moveVariableEntries,
  revealVariables,
  toVariableEntries,
  type VariableEntry,
} from "@/utils/variableSections";

import type { StoreKit } from "@/store/kit";
import {
  getActiveTab,
  getRunbookView,
  targetVariableIds,
} from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import { withActiveTab } from "@/store/tabState";
import type { StoreState } from "@/store/types";
import { appendVariable, createVariable } from "@/store/variableState";

type VariablesActions = Pick<
  StoreState,
  | "addVariable"
  | "extractVariable"
  | "defineVariable"
  | "removeVariable"
  | "duplicateVariable"
  | "updateVariable"
  | "toggleVariableSecret"
  | "addVariableOption"
  | "removeVariableOption"
  | "applyVariableKeyCase"
  | "clearVariableValues"
  | "reorderVariables"
  | "clearVariableFlash"
  | "consumeVariableFocus"
>;

export function createVariablesSlice(
  kit: StoreKit,
  services: StoreServices,
): VariablesActions {
  const { set, get, debouncedSaveState } = kit;
  const { ensureVaultForSecrets } = services;

  return {
    addVariable: async (kind = VariableKind.TEXT) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      if (state.tabs.length === 0) {
        await get().createNewTab();
      }

      const newVariable = createVariable(kind);
      set((s) => ({
        ...withActiveTab(s, (tab) => appendVariable(tab, newVariable)),
        pendingFocusVariableId: newVariable.id,
        variableSearchQuery: "",
      }));
      get().saveState();
    },

    extractVariable: (value) => {
      const state = get();
      const tab = getActiveTab(state);

      if (state.mode === AppMode.READ || !tab || !value) {
        return null;
      }

      const key = extractedVariableKey(
        value,
        new Set(tab.variables.map((v) => getVariableKey(v))),
      );
      const newVariable = {
        ...createVariable(VariableKind.TEXT),
        key,
        value,
      };

      set((s) => ({
        ...withActiveTab(s, (t) => appendVariable(t, newVariable)),
        variableSearchQuery: "",
      }));

      if (
        get().variablesSectionCollapsed &&
        getRunbookView(get()) !== RunbookView.VARIABLES
      ) {
        get().toggleVariablesSection();
      }

      get().saveState();
      return { id: newVariable.id, key };
    },

    defineVariable: (tabId, key) => {
      if (get().mode === AppMode.READ) {
        return null;
      }

      get().switchTab(tabId);

      const newVariable = { ...createVariable(VariableKind.TEXT), key };
      set((s) => ({
        ...withActiveTab(s, (tab) => appendVariable(tab, newVariable)),
        variableSearchQuery: "",
      }));

      get().saveState();
      return newVariable.id;
    },

    removeVariable: (variableId) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const targets = targetVariableIds(state, variableId);
      const fromSelection = targets.size > 1;

      set((s) => ({
        ...withActiveTab(s, (tab) => ({
          ...tab,
          ...mapVariableEntries(tab, (entries) =>
            entries.filter((entry) => !targets.has(entryId(entry))),
          ),
        })),
        selectedVariableIds: fromSelection
          ? new Set<string>()
          : s.selectedVariableIds,
      }));
      get().saveState();
    },

    duplicateVariable: (variableId) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const active = getActiveTab(state);
      if (!active) {
        return;
      }

      // Duplicate in list order, sections included
      const targets = targetVariableIds(state, variableId);
      const entries = toVariableEntries(
        active.variables,
        active.variableSections,
      );

      const ordered: VariableEntry[] = [];
      let last = -1;

      entries.forEach((entry, i) => {
        if (targets.has(entryId(entry))) {
          ordered.push(entry);
          last = i;
        }
      });

      if (last < 0) {
        return;
      }

      const takenKeys = new Set(active.variables.map((v) => getVariableKey(v)));

      const copies = ordered.map((entry): VariableEntry => {
        if (entry.kind === VariableEntryKind.SECTION) {
          return {
            ...entry,
            section: { ...entry.section, id: generateId() },
          };
        }

        const source = entry.variable;
        const key = getVariableKey(source);
        const newKey = key ? uniqueCopyKey(key, takenKeys) : source.key;
        takenKeys.add(newKey);
        return {
          ...entry,
          variable: { ...source, id: generateId(), key: newKey },
        };
      });

      // Right after the last source, so the copies stay in its section
      entries.splice(last + 1, 0, ...copies);

      const layout = fromVariableEntries(entries, active);
      const copyIds = new Set(copies.map(entryId));
      const single = copies.length === 1 ? copies[0] : null;

      set((s) => ({
        ...withActiveTab(s, (tab) => ({
          ...tab,
          ...layout,
          variableSections: revealVariables(layout, copyIds),
        })),
        flashVariableIds: copyIds,
        pendingFocusVariableId:
          single?.kind === VariableEntryKind.VARIABLE
            ? single.variable.id
            : null,
        pendingFocusSectionId:
          single?.kind === VariableEntryKind.SECTION ? single.section.id : null,
      }));

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
            const oldKey = getVariableKey(target);
            const newKey = value.trim();

            if (oldKey && newKey && oldKey !== newKey) {
              blocks = tab.blocks.map((b) =>
                mapBlockCommandTexts(b, (text) =>
                  renameCommandTokens(text, oldKey, newKey),
                ),
              );

              variables = tab.variables.map((v) => {
                if (v.id === variableId) {
                  return v;
                }

                const value = renameValueTokens(v.value, oldKey, newKey);
                const options = v.options?.map((option) =>
                  renameValueTokens(option, oldKey, newKey),
                );

                const optionsChanged = options?.some(
                  (option, index) => option !== v.options?.[index],
                );

                return value === v.value && !optionsChanged
                  ? v
                  : { ...v, value, options };
              });
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
      const state = get();
      const active = getActiveTab(state);
      const marking = !active?.variables.find((v) => v.id === variableId)
        ?.secret;

      // The clicked row decides
      const targets = targetVariableIds(state, variableId);

      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          variables: tab.variables.map((v) =>
            targets.has(v.id) && !v.options ? { ...v, secret: marking } : v,
          ),
        })),
      );

      if (!marking) {
        get().saveState();
        return;
      }

      void ensureVaultForSecrets().then(() => get().saveState());
    },

    addVariableOption: (variableId, option) => {
      const trimmed = option.trim();
      if (get().mode === AppMode.READ || !trimmed) {
        return;
      }

      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          variables: tab.variables.map((v) =>
            v.id !== variableId || !v.options || v.options.includes(trimmed)
              ? v
              : {
                  ...v,
                  options: [...v.options, trimmed],
                  value: v.value || trimmed,
                },
          ),
        })),
      );

      get().saveState();
    },

    removeVariableOption: (variableId, option) => {
      if (get().mode === AppMode.READ) {
        return;
      }

      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          variables: tab.variables.map((v) => {
            if (v.id !== variableId || !v.options?.includes(option)) {
              return v;
            }

            const options = v.options.filter((entry) => entry !== option);
            const value = v.value === option ? (options[0] ?? "") : v.value;
            return { ...v, options, value };
          }),
        })),
      );

      get().saveState();
    },

    applyVariableKeyCase: (variableId, keyword) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      // Read the keys in one pass
      const targets = targetVariableIds(state, variableId);
      const variables = getActiveTab(state)?.variables ?? [];
      const renames = variables.flatMap((v) => {
        const key = targets.has(v.id) ? getVariableKey(v) : "";
        return key ? [{ id: v.id, key }] : [];
      });

      for (const { id, key } of renames) {
        get().updateVariable(
          id,
          VariableField.KEY,
          applyOperations(key, [{ text: keyword }], { key }).text,
        );
      }
    },

    clearVariableValues: (variableId) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const targets = targetVariableIds(state, variableId);

      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          variables: tab.variables.map((v) =>
            targets.has(v.id) && v.value ? { ...v, value: "" } : v,
          ),
        })),
      );

      get().saveState();
    },

    reorderVariables: (sourceId, targetId) => {
      const state = get();
      if (
        state.mode === AppMode.READ ||
        sourceId === targetId ||
        !getActiveTab(state)
      ) {
        return;
      }

      const movingIds = targetVariableIds(state, sourceId);

      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          ...mapVariableEntries(tab, (entries) =>
            moveVariableEntries(entries, movingIds, sourceId, targetId),
          ),
        })),
      );

      get().saveState();
    },

    clearVariableFlash: (variableId) =>
      set((s) => {
        if (!s.flashVariableIds.has(variableId)) {
          return {};
        }

        const flashVariableIds = new Set(s.flashVariableIds);
        flashVariableIds.delete(variableId);
        return { flashVariableIds };
      }),

    consumeVariableFocus: () => set({ pendingFocusVariableId: null }),
  };
}
