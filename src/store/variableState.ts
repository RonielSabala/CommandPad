import { DEFAULT_VARIABLE_LANGUAGE } from "@/common/editorConfig";
import { VariableKind } from "@/common/enums";
import type { Tab, Variable, VariableSection } from "@/common/types";
import { generateId } from "@/utils/id";
import { revealVariables } from "@/utils/variableSections";

import { withActiveTab } from "./tabState";
import type { StoreState } from "./types";

export function createVariable(kind: VariableKind): Variable {
  const variable = { id: generateId(), key: "", value: "" };

  return kind === VariableKind.ENUM
    ? { ...variable, options: [] }
    : { ...variable, language: DEFAULT_VARIABLE_LANGUAGE };
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
