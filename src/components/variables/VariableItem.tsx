import type { Variable } from "@/common/types";
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
  const keyRef = useRef<HTMLInputElement>(null);

  return (
    <VariableRowFrame
      rowId={variable.id}
      dragImageRef={keyRef}
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
      <VariableEditor
        variable={variable}
        completions={completions}
        unused={unused}
        keyRef={keyRef}
      />
    </VariableRowFrame>
  );
});
