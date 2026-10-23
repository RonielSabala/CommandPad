import { AppMode, VariableEntryKind, VariableKind } from "@/common/enums";
import type { VariableSection } from "@/common/types";
import { generateId } from "@/utils/id";
import {
  entryId,
  fromVariableEntries,
  insertVariableEntry,
  mapVariableEntries,
  revealVariables,
  sectionVariables,
  toVariableEntries,
  type VariableEntry,
} from "@/utils/variableSections";

import type { StoreKit } from "@/store/kit";
import { getActiveTab, targetVariableIds } from "@/store/selectors";
import { withActiveTab } from "@/store/tabState";
import type { StoreState } from "@/store/types";
import { createVariable, withVariableSection } from "@/store/variableState";

type VariableSectionsActions = Pick<
  StoreState,
  | "addVariableSection"
  | "insertVariableRow"
  | "renameVariableSection"
  | "toggleVariableSection"
  | "consumeSectionFocus"
>;

export function createVariableSectionsSlice(
  kit: StoreKit,
): VariableSectionsActions {
  const { set, get, debouncedSaveState } = kit;

  return {
    addVariableSection: (variableId) => {
      const state = get();
      const active = getActiveTab(state);
      if (state.mode === AppMode.READ || !active) {
        return;
      }

      const targets = variableId
        ? targetVariableIds(state, variableId)
        : new Set<string>();

      const section: VariableSection = {
        id: generateId(),
        name: "",
        start: active.variables.length,
      };

      // A new section goes last, taking the target variables with it

      const kept: VariableEntry[] = [];
      const moved: VariableEntry[] = [];

      for (const entry of toVariableEntries(
        active.variables,
        active.variableSections,
      )) {
        const moves =
          entry.kind === VariableEntryKind.VARIABLE &&
          targets.has(entry.variable.id);

        (moves ? moved : kept).push(entry);
      }

      kept.push({ kind: VariableEntryKind.SECTION, section }, ...moved);
      const layout = fromVariableEntries(kept, active);

      set((s) => ({
        ...withActiveTab(s, (tab) => ({ ...tab, ...layout })),
        pendingFocusSectionId: section.id,
        selectedVariableIds:
          moved.length > 1 ? new Set<string>() : s.selectedVariableIds,
      }));

      get().saveState();
    },

    insertVariableRow: (
      targetId,
      kind,
      position,
      variableKind = VariableKind.TEXT,
    ) => {
      const state = get();
      if (state.mode === AppMode.READ || !getActiveTab(state)) {
        return;
      }

      const entry: VariableEntry =
        kind === VariableEntryKind.SECTION
          ? {
              kind: VariableEntryKind.SECTION,
              section: { id: generateId(), name: "", start: 0 },
            }
          : {
              kind: VariableEntryKind.VARIABLE,
              variable: createVariable(variableKind),
            };

      const id = entryId(entry);
      set((s) => ({
        ...withActiveTab(s, (tab) => {
          const layout = mapVariableEntries(tab, (entries) =>
            insertVariableEntry(entries, entry, targetId, position),
          );

          return {
            ...tab,
            ...layout,
            variableSections: revealVariables(layout, new Set([id])),
          };
        }),
        pendingFocusVariableId:
          kind === VariableEntryKind.VARIABLE ? id : s.pendingFocusVariableId,
        pendingFocusSectionId:
          kind === VariableEntryKind.SECTION ? id : s.pendingFocusSectionId,
      }));

      get().saveState();
    },

    renameVariableSection: (sectionId, name) => {
      if (get().mode === AppMode.READ) {
        return;
      }

      set((s) =>
        withVariableSection(s, sectionId, (section) => ({
          ...section,
          name,
        })),
      );

      debouncedSaveState();
    },

    toggleVariableSection: (sectionId) => {
      set((s) => {
        const tab = getActiveTab(s);
        const at =
          tab?.variableSections.findIndex(
            (section) => section.id === sectionId,
          ) ?? -1;

        if (!tab || at < 0) {
          return {};
        }

        const section = tab.variableSections[at];
        const collapsed = !section.collapsed;
        const variableSections = tab.variableSections.slice();
        variableSections[at] = { ...section, collapsed };

        // Only the rows this section now hides can leave the selection
        const hidden = collapsed
          ? sectionVariables(tab, at).filter((v) =>
              s.selectedVariableIds.has(v.id),
            )
          : [];

        let selectedVariableIds = s.selectedVariableIds;
        if (hidden.length > 0) {
          selectedVariableIds = new Set(selectedVariableIds);

          for (const variable of hidden) {
            selectedVariableIds.delete(variable.id);
          }
        }

        return {
          ...withActiveTab(s, (t) => ({ ...t, variableSections })),
          selectedVariableIds,
        };
      });

      get().saveState();
    },

    consumeSectionFocus: () => set({ pendingFocusSectionId: null }),
  };
}
