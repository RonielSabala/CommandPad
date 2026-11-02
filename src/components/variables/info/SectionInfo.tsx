import type { VariableSection } from "@/common/types";
import { InfoTable } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import { useTranslation } from "@/i18n";
import { noteToPlainText } from "@/utils/markdown";
import { getVariableKey, unresolvedVariableParts } from "@/utils/resolution";
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
    const counts = { enums: 0, secrets: 0, unused: 0, problems: 0, bytes: 0 };

    for (const variable of variables) {
      const key = getVariableKey(variable);
      counts.bytes += utf8ByteLength(variable.value);

      if (variable.options) {
        counts.enums++;
      }

      if (variable.secret) {
        counts.secrets++;
      }

      if (!key) {
        continue;
      }

      if (!usedKeys.has(key)) {
        counts.unused++;
      }

      if (unresolvedVariableParts(key, variableMap, secretKeys).length > 0) {
        counts.problems++;
      }
    }

    return {
      ...counts,
      name: noteToPlainText(section.name).trim(),
      position: at + 1,
      variables: variables.length,
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
