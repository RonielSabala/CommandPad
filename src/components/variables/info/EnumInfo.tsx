import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";
import { InfoTable } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import { hasReferencedKeys } from "@/utils/resolution";
import { countCharacters, utf8ByteLength } from "@/utils/string";
import { useMemo } from "react";

import type { VariableInfoScope } from "./useVariableInfoScope";
import { useVariableKeyRows } from "./useVariableKeyRows";

interface Props {
  variable: Variable;
  scope: VariableInfoScope;
}

export function EnumInfo({ variable, scope }: Props) {
  const t = useTranslation();
  const format = useInfoFormat();
  const { keyRow, usedByRow } = useVariableKeyRows(variable, scope.tab);

  const stats = useMemo(() => {
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
      options: options.length,
      selected: options.indexOf(variable.value),
      longest,
      bytes,
      withReferences,
    };
  }, [variable]);

  const { rows, sections } = t.info;

  return (
    <InfoTable
      title={t.info.enumTitle}
      sections={[
        {
          title: sections.overview,
          rows: [
            keyRow,
            {
              label: rows.selected,
              value:
                stats.selected === -1
                  ? null
                  : t.info.position(stats.selected + 1, stats.options),
            },
            usedByRow,
          ],
        },
        {
          title: sections.options,
          rows: [
            { label: rows.options, value: format.count(stats.options) },
            { label: rows.longestOption, value: format.count(stats.longest) },
            { label: rows.optionsSize, value: format.size(stats.bytes) },
            {
              label: rows.optionsWithReferences,
              value: format.count(stats.withReferences),
            },
          ],
        },
      ]}
    />
  );
}
