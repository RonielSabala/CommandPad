import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";
import { InfoCodeList, InfoTable } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import {
  countReferencesTo,
  getReferencedKeys,
  getVariableKey,
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

    return {
      key,
      options: options.length,
      selected: options.indexOf(variable.value),
      longest: Math.max(0, ...options.map(countCharacters)),
      bytes: options.reduce((sum, option) => sum + utf8ByteLength(option), 0),
      withReferences: options.filter(
        (option) => getReferencedKeys(option, ReferenceSurface.VALUE).size > 0,
      ).length,
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
