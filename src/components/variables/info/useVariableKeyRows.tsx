import type { Tab, Variable } from "@/common/types";
import { InfoCodeList, type InfoRow } from "@/components/common/info/InfoTable";
import { useTranslation } from "@/i18n";
import { countReferencesTo, getVariableKey } from "@/utils/resolution";
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
    () => (key ? countReferencesTo(key, blocks, variables) : null),
    [key, blocks, variables],
  );

  return {
    key,
    keyRow: {
      label: t.info.rows.key,
      value: key ? <InfoCodeList items={[key]} /> : null,
    },
    usedByRow: {
      label: t.info.rows.usedBy,
      value:
        usedBy &&
        (usedBy.blocks + usedBy.variables > 0
          ? t.info.usedBy(usedBy.blocks, usedBy.variables)
          : t.info.unused),
    },
  };
}
