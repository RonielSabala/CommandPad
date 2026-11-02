import type { VariableSection } from "@/common/types";
import { InfoTable } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import { useTranslation } from "@/i18n";
import { noteToPlainText } from "@/utils/markdown";
import {
  getVariableKey,
  isVariableUnused,
  unresolvedVariableParts,
} from "@/utils/resolution";
import { utf8ByteLength } from "@/utils/string";
import { sectionVariables } from "@/utils/variableSections";
import { useMemo } from "react";

import type { VariableInfoScope } from "./useVariableInfoScope";

interface Props {
  section: VariableSection;
  scope: VariableInfoScope;
}

export function SectionInfo({ section, scope }: Props) {
  const t = useTranslation();
  const format = useInfoFormat();

  const { tab, variableMap, secretKeys } = scope;
  const usedKeys = useUsedVariableKeys(tab.blocks, tab.variables);

  const stats = useMemo(() => {
    const at = tab.variableSections.indexOf(section);
    const variables = sectionVariables(tab, at);

    return {
      name: noteToPlainText(section.name).trim(),
      position: at + 1,
      variables: variables.length,
      enums: variables.filter(({ options }) => options).length,
      secrets: variables.filter(({ secret }) => secret).length,
      unused: variables.filter((variable) =>
        isVariableUnused(variable, usedKeys),
      ).length,
      problems: variables.filter((variable) => {
        const key = getVariableKey(variable);
        return (
          !!key &&
          unresolvedVariableParts(key, variableMap, secretKeys).length > 0
        );
      }).length,
      bytes: variables.reduce(
        (sum, { value }) => sum + utf8ByteLength(value),
        0,
      ),
    };
  }, [section, tab, usedKeys, variableMap, secretKeys]);

  const { rows } = t.info;

  return (
    <InfoTable
      title={t.info.sectionTitle}
      rows={[
        { label: rows.name, value: stats.name || null },
        {
          label: rows.position,
          value: t.info.position(stats.position, tab.variableSections.length),
        },
        { label: rows.variables, value: format.count(stats.variables) },
        { label: rows.enums, value: format.count(stats.enums) },
        { label: rows.secrets, value: format.count(stats.secrets) },
        { label: rows.unusedVariables, value: format.count(stats.unused) },
        { label: rows.emptyOrUnresolved, value: format.count(stats.problems) },
        { label: rows.valuesSize, value: format.size(stats.bytes) },
        {
          label: rows.collapsed,
          value: section.collapsed ? t.info.yes : t.info.no,
        },
      ]}
    />
  );
}
