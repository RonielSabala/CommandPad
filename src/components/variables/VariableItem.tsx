import { CssClass } from "@/common/constants/css";
import type { Variable } from "@/common/types";
import { DragImage } from "@/components/common/DragImage";
import { EnumIcon, VariableIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { classNames } from "@/utils/string";
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
  const KindIcon = variable.options ? EnumIcon : VariableIcon;

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
      <DragImage
        icon={
          <KindIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
      >
        {variable.key || t.variables.keyPlaceholder}
      </DragImage>

      <VariableEditor
        variable={variable}
        completions={completions}
        unused={unused}
        keyRef={keyRef}
      />
    </VariableRowFrame>
  );
});
