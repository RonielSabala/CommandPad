import {
  CODE_LANGUAGE_LABEL,
  DEFAULT_VARIABLE_LANGUAGE,
} from "@/common/editorConfig";
import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";
import { InfoCodeList, InfoTable } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import {
  countReferencesTo,
  getReferencedKeys,
  getTemplateParamNames,
  getVariableKey,
  unresolvedVariableParts,
} from "@/utils/resolution";
import { countCharacters, countLines, utf8ByteLength } from "@/utils/string";
import { useMemo } from "react";

import { useUsedByLabel } from "./useUsedByLabel";
import type { VariableInfoScope } from "./useVariableInfoScope";

interface Props {
  variable: Variable;
  scope: VariableInfoScope;
}

export function VariableInfo({ variable, scope }: Props) {
  const t = useTranslation();
  const format = useInfoFormat();
  const usedBy = useUsedByLabel();
  const { tab, variableMap, secretKeys } = scope;

  const stats = useMemo(() => {
    const key = getVariableKey(variable);
    const { value } = variable;
    const resolved = key ? variableMap[key] : undefined;

    return {
      key,
      bytes: utf8ByteLength(value),
      characters: countCharacters(value),
      lines: countLines(value),
      resolvedBytes: resolved ? utf8ByteLength(resolved.text) : null,
      references: getReferencedKeys(value, ReferenceSurface.VALUE).size,
      blanks: getTemplateParamNames(value),
      usedBy: key ? countReferencesTo(key, tab.blocks, tab.variables) : null,
      unresolved: key
        ? unresolvedVariableParts(key, variableMap, secretKeys).length
        : null,
    };
  }, [variable, variableMap, secretKeys, tab]);

  const { rows } = t.info;

  return (
    <InfoTable
      title={t.info.variableTitle}
      rows={[
        {
          label: rows.key,
          value: stats.key ? <InfoCodeList items={[stats.key]} /> : null,
        },
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
          value:
            stats.resolvedBytes === null
              ? null
              : format.size(stats.resolvedBytes),
        },
        { label: rows.characters, value: format.count(stats.characters) },
        { label: rows.lines, value: format.count(stats.lines) },
        { label: rows.references, value: format.count(stats.references) },
        {
          label: rows.blanks,
          value:
            stats.blanks.length > 0 ? (
              <InfoCodeList items={stats.blanks} />
            ) : (
              t.info.none
            ),
        },
        { label: rows.usedBy, value: stats.usedBy && usedBy(stats.usedBy) },
        {
          label: rows.unresolved,
          value:
            stats.unresolved === null ? null : format.count(stats.unresolved),
        },
      ]}
    />
  );
}
