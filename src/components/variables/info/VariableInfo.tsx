import {
  CODE_LANGUAGE_LABEL,
  DEFAULT_VARIABLE_LANGUAGE,
} from "@/common/editorConfig";
import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";
import { keyReferencesRow } from "@/components/common/info/infoRows";
import { InfoCodeList, InfoTable } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import {
  getReferencedKeys,
  getTemplateParamNames,
  lookupVariables,
  unresolvedVariableParts,
} from "@/utils/resolution";
import { countCharacters, countLines, utf8ByteLength } from "@/utils/string";
import { useMemo } from "react";

import type { VariableInfoScope } from "./useVariableInfoScope";
import { useVariableKeyRows } from "./useVariableKeyRows";

interface Props {
  variable: Variable;
  scope: VariableInfoScope;
}

export function VariableInfo({ variable, scope }: Props) {
  const t = useTranslation();
  const format = useInfoFormat();
  const { variableMap, secretKeys } = scope;
  const { key, keyRow, usedByRow } = useVariableKeyRows(variable, scope.tab);

  const stats = useMemo(() => {
    const { value } = variable;
    const resolved = key ? variableMap[key] : undefined;

    return {
      bytes: utf8ByteLength(value),
      characters: countCharacters(value),
      lines: countLines(value),
      resolvedBytes: resolved ? utf8ByteLength(resolved.text) : null,
      references: lookupVariables(
        getReferencedKeys(value, ReferenceSurface.VALUE),
        scope.tab.variables,
      ),
      blanks: getTemplateParamNames(value),
      unresolved: key
        ? unresolvedVariableParts(key, variableMap, secretKeys).length
        : null,
    };
  }, [variable, key, variableMap, secretKeys, scope.tab.variables]);

  const { rows } = t.info;

  return (
    <InfoTable
      title={t.info.variableTitle}
      rows={[
        keyRow,
        {
          label: rows.kind,
          value: variable.secret ? t.info.secretKind : t.info.textKind,
        },
        {
          label: rows.language,
          value:
            CODE_LANGUAGE_LABEL[variable.language ?? DEFAULT_VARIABLE_LANGUAGE],
        },
        { label: rows.valueSize, value: format.size(stats.bytes) },
        {
          label: rows.resolvedSize,
          value: format.size(stats.resolvedBytes),
        },
        { label: rows.characters, value: format.count(stats.characters) },
        { label: rows.lines, value: format.count(stats.lines) },
        keyReferencesRow(rows.references, stats.references, format),
        {
          label: rows.blanks,
          value: <InfoCodeList items={stats.blanks} />,
        },
        usedByRow,
        {
          label: rows.unresolved,
          value: format.exactCount(stats.unresolved),
        },
      ]}
    />
  );
}
