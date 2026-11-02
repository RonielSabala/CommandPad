import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";
import { InfoCodeList, InfoTable } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import {
  countReferencesTo,
  getVariableKey,
  hasReferencedKeys,
} from "@/utils/resolution";
import { countCharacters, utf8ByteLength } from "@/utils/string";
import { useMemo } from "react";

import { useUsedByLabel } from "./useUsedByLabel";
import type { VariableInfoScope } from "./useVariableInfoScope";

interface Props {
  variable: Variable;
  scope: VariableInfoScope;
}

export function EnumInfo({ variable, scope }: Props) {
  const t = useTranslation();
  const format = useInfoFormat();
  const usedBy = useUsedByLabel();
  const { tab } = scope;

  const stats = useMemo(() => {
    const key = getVariableKey(variable);
    const options = variable.options ?? [];

    let longest = 0;
    let bytes = 0;
    let withReferences = 0;

    for (const option of options) {
      longest = Math.max(longest, countCharacters(option));
      bytes += utf8ByteLength(option);

      if (hasReferencedKeys(option, ReferenceSurface.VALUE)) {
        withReferences++;
      }
    }

    return {
      key,
      options: options.length,
      selected: options.indexOf(variable.value),
      longest,
      bytes,
      withReferences,
      usedBy: key ? countReferencesTo(key, tab.blocks, tab.variables) : null,
    };
  }, [variable, tab]);

  const { rows } = t.info;

  return (
    <InfoTable
      title={t.info.enumTitle}
      rows={[
        {
          label: rows.key,
          value: stats.key ? <InfoCodeList items={[stats.key]} /> : null,
        },
        { label: rows.options, value: format.count(stats.options) },
        {
          label: rows.selected,
          value:
            stats.selected === -1
              ? null
              : t.info.position(stats.selected + 1, stats.options),
        },
        { label: rows.longestOption, value: format.count(stats.longest) },
        { label: rows.optionsSize, value: format.size(stats.bytes) },
        {
          label: rows.optionsWithReferences,
          value: format.count(stats.withReferences),
        },
        { label: rows.usedBy, value: stats.usedBy && usedBy(stats.usedBy) },
      ]}
    />
  );
}
