import type { Variable } from "@/common/types";
import { DragImage } from "@/components/common/DragImage";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { memo, useRef } from "react";

import { VariableActionsMenu } from "./VariableActionsMenu";
import { VariableEditor } from "./VariableEditor";
import { VariableRowFrame } from "./VariableRowFrame";

interface Props {
  variable: Variable;
  completions: VariableCompletion[];
  unused?: boolean;
}

export const VariableItem = memo(function VariableItem({
  variable,
  completions,
  unused,
}: Props) {
  const t = useTranslation();
  const keyRef = useRef<HTMLInputElement>(null);

  return (
    <VariableRowFrame
      rowId={variable.id}
      menu={(className) => (
        <VariableActionsMenu
          variableId={variable.id}
          isSecret={!!variable.secret}
          isEnum={!!variable.options}
          sectioned
          className={className}
        />
      )}
    >
      <DragImage>{variable.key || t.variables.keyPlaceholder}</DragImage>
      <VariableEditor
        variable={variable}
        completions={completions}
        unused={unused}
        keyRef={keyRef}
      />
    </VariableRowFrame>
  );
});
