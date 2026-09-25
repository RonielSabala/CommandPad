import { VariableEntryKind } from "@/common/enums";
import type { Variable, VariableSection } from "@/common/types";
import type { VariableCompletion } from "@/monaco/completions";
import { isVariableUnused } from "@/utils/resolution";
import { buildVariableLayout } from "@/utils/variableSections";
import { useMemo } from "react";

import { VariableItem } from "./VariableItem";
import { VariableSectionItem } from "./VariableSectionItem";

interface Props {
  variables: Variable[];
  sections: VariableSection[];
  usedKeys: Set<string>;
  completions: VariableCompletion[];
}

export function VariableRows({
  variables,
  sections,
  usedKeys,
  completions,
}: Props) {
  const rows = useMemo(
    () => buildVariableLayout(variables, sections),
    [variables, sections],
  );

  return rows.map((row) =>
    row.kind === VariableEntryKind.SECTION ? (
      <VariableSectionItem
        key={row.section.id}
        section={row.section}
        count={row.count}
      />
    ) : (
      <VariableItem
        key={row.variable.id}
        variable={row.variable}
        completions={completions}
        unused={isVariableUnused(row.variable, usedKeys)}
      />
    ),
  );
}
