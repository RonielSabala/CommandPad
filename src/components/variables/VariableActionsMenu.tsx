import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import { DuplicateIcon, EyeIcon, TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { getCaseOperationKeywords } from "@/utils/resolution";
import { AlphabetUppercase } from "react-bootstrap-icons";

const CASE_KEYWORDS = getCaseOperationKeywords();

interface Props {
  variableId: string;
  isSecret: boolean;
  className: string;
}

export function VariableActionsMenu({
  variableId,
  isSecret,
  className,
}: Props) {
  const t = useTranslation();
  const removeVariable = useStore((state) => state.removeVariable);
  const duplicateVariable = useStore((state) => state.duplicateVariable);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const applyVariableKeyCase = useStore((state) => state.applyVariableKeyCase);

  const count = useStore((state) =>
    state.selectedVariableIds.has(variableId)
      ? state.selectedVariableIds.size
      : 1,
  );

  return (
    <ActionsMenu className={className} title={t.variables.actions}>
      <ContextMenuItem
        icon={<EyeIcon slashed={!isSecret} className="icon-md icon-bold" />}
        onSelect={() => toggleVariableSecret(variableId)}
      >
        {isSecret ? t.variables.reveal(count) : t.variables.mask(count)}
      </ContextMenuItem>

      <ContextMenuItem
        icon={<DuplicateIcon className="icon-md icon-bold" />}
        onSelect={() => duplicateVariable(variableId)}
      >
        {t.variables.duplicate(count)}
      </ContextMenuItem>

      <ContextMenuSubmenu
        icon={<AlphabetUppercase className="icon-md" />}
        label={t.variables.renameCase}
        iconlessItems
      >
        {CASE_KEYWORDS.map((keyword) => (
          <ContextMenuItem
            key={keyword}
            onSelect={() => applyVariableKeyCase(variableId, keyword)}
          >
            {keyword}
          </ContextMenuItem>
        ))}
      </ContextMenuSubmenu>

      <ContextMenuItem
        icon={<TrashIcon className="icon-md icon-bold" />}
        onSelect={() => removeVariable(variableId)}
        danger
      >
        {t.variables.remove(count)}
      </ContextMenuItem>
    </ActionsMenu>
  );
}
