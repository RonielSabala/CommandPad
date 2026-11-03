import type { DefinedKeys } from "@/utils/resolution";

import { InfoReferences } from "./InfoReferences";
import type { InfoRow } from "./InfoTable";
import type { InfoFormat } from "./useInfoFormat";

export function keyReferencesRow(
  label: string,
  { variables, missing }: DefinedKeys,
  format: InfoFormat,
): InfoRow {
  const count = variables.length + missing.length;

  return {
    label,
    value:
      count > 0 ? (
        <InfoReferences
          summary={format.count(count)}
          variables={variables}
          missingKeys={missing}
        />
      ) : null,
  };
}
