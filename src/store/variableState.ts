import { mapBlockCommandTexts } from "@/blocks";
import { VariableKind } from "@/common/enums";
import type { Tab, Variable, VariableSection } from "@/common/types";
import { generateId } from "@/utils/id";
import {
  getVariableKey,
  renameAllCommandTokens,
  renameAllValueTokens,
} from "@/utils/resolution";
import { revealVariables } from "@/utils/variableSections";

import { withActiveTab } from "./tabState";
import type { StoreState } from "./types";

export function createVariable(
  state: Pick<StoreState, "defaultVariableLanguage">,
  kind: VariableKind,
): Variable {
  const variable = { id: generateId(), key: "", value: "" };

  return kind === VariableKind.ENUM
    ? { ...variable, options: [] }
    : { ...variable, language: state.defaultVariableLanguage };
}

function withRenamedReferences(
  variable: Variable,
  renames: ReadonlyMap<string, string>,
): Variable {
  const value = renameAllValueTokens(variable.value, renames);
  const options = variable.options?.map((option) =>
    renameAllValueTokens(option, renames),
  );

  const optionsChanged = options?.some(
    (option, index) => option !== variable.options?.[index],
  );

  return value === variable.value && !optionsChanged
    ? variable
    : { ...variable, value, options };
}

/**
 * Gives variables new keys (by id), rewriting every reference
 * to the old keys in one pass.
 */
export function withVariableKeys(
  tab: Tab,
  keys: ReadonlyMap<string, string>,
): Tab {
  const renames = new Map<string, string>();

  for (const variable of tab.variables) {
    const oldKey = getVariableKey(variable);
    const newKey = keys.get(variable.id)?.trim();

    if (oldKey && newKey && oldKey !== newKey) {
      renames.set(oldKey, newKey);
    }
  }

  const variables = tab.variables.map((variable) => {
    const renamed =
      renames.size > 0 ? withRenamedReferences(variable, renames) : variable;

    const key = keys.get(variable.id);
    return key === undefined ? renamed : { ...renamed, key };
  });

  const blocks =
    renames.size > 0
      ? tab.blocks.map((block) =>
          mapBlockCommandTexts(block, (text) =>
            renameAllCommandTokens(text, renames),
          ),
        )
      : tab.blocks;

  return { ...tab, blocks, variables };
}

function appendVariable(tab: Tab, variable: Variable): Tab {
  const variables = [...tab.variables, variable];
  return {
    ...tab,
    variables,
    variableSections: revealVariables(
      { variables, variableSections: tab.variableSections },
      new Set([variable.id]),
    ),
  };
}

/** Add a variable to the active tab. */
export function withNewVariable(
  state: StoreState,
  variable: Variable,
): Pick<StoreState, "tabs" | "variableSearchQuery"> {
  return {
    ...withActiveTab(state, (tab) => appendVariable(tab, variable)),
    variableSearchQuery: "",
  };
}

/** Replace one section of the active tab. */
export function withVariableSection(
  state: StoreState,
  sectionId: string,
  patch: (section: VariableSection) => VariableSection,
) {
  return withActiveTab(state, (tab) => ({
    ...tab,
    variableSections: tab.variableSections.map((section) =>
      section.id === sectionId ? patch(section) : section,
    ),
  }));
}
