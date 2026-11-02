import { VariableEntryKind } from "@/common/enums";

import { EnumInfo } from "./EnumInfo";
import { SectionInfo } from "./SectionInfo";
import { useVariableInfoScope } from "./useVariableInfoScope";
import { VariableInfo } from "./VariableInfo";

interface Props {
  targetId: string;
  kind: VariableEntryKind;
}

export function VariableRowInfo({ targetId, kind }: Props) {
  const scope = useVariableInfoScope();
  if (!scope) {
    return null;
  }

  const { tab } = scope;
  if (kind === VariableEntryKind.SECTION) {
    const section = tab.variableSections.find(({ id }) => id === targetId);
    return section ? <SectionInfo section={section} scope={scope} /> : null;
  }

  const variable = tab.variables.find(({ id }) => id === targetId);
  if (!variable) {
    return null;
  }

  return variable.options ? (
    <EnumInfo variable={variable} scope={scope} />
  ) : (
    <VariableInfo variable={variable} scope={scope} />
  );
}
