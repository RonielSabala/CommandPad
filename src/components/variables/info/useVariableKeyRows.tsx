import type { Tab, Variable } from "@/common/types";
import { InfoReferences } from "@/components/common/info/InfoReferences";
import { InfoCodeList, type InfoRow } from "@/components/common/info/InfoTable";
import { useTranslation } from "@/i18n";
import { findReferencesTo, getVariableKey } from "@/utils/resolution";
import { useMemo } from "react";

interface VariableKeyRows {
  key: string;
  keyRow: InfoRow;
  usedByRow: InfoRow;
}

/** The key and "used by" rows of a variable's info. */
export function useVariableKeyRows(
  variable: Variable,
  { blocks, variables }: Tab,
): VariableKeyRows {
  const t = useTranslation();
  const key = getVariableKey(variable);
  const usedBy = useMemo(
    () => (key ? findReferencesTo(key, blocks, variables) : null),
    [key, blocks, variables],
  );

  const usedByBlocks = usedBy?.blocks;
  const usedByVariables = usedBy?.variables;

  return {
    key,
    keyRow: {
      label: t.info.rows.key,
      value: key ? <InfoCodeList items={[key]} /> : null,
    },
    usedByRow: {
      label: t.info.rows.usedBy,
      value:
        usedByBlocks &&
        usedByVariables &&
        usedByBlocks.length + usedByVariables.length > 0 ? (
          <InfoReferences
            summary={t.info.usedBy(usedByBlocks.length, usedByVariables.length)}
            blocks={usedByBlocks}
            variables={usedByVariables}
          />
        ) : (
          t.info.unused
        ),
    },
  };
}
