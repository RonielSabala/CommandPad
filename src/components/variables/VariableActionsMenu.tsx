import { CssClass } from "@/common/constants/css";
import { VariableEntryKind } from "@/common/enums";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import { EyeIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { getCaseOperationKeywords } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { AlphabetUppercase, Collection, Eraser } from "react-bootstrap-icons";

import {
  DuplicateItem,
  RemoveItem,
  VariableInsertItems,
  VariableRowMenu,
} from "./VariableRowMenuItems";

const CASE_KEYWORDS = getCaseOperationKeywords();

interface Props {
  variableId: string;
  isSecret: boolean;
  isEnum: boolean;
  className: string;
  /** Whether this surface shows sections. */
  sectioned?: boolean;
}

export function VariableActionsMenu({
  variableId,
  isSecret,
  isEnum,
  className,
  sectioned,
}: Props) {
  const t = useTranslation();
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const applyVariableKeyCase = useStore((state) => state.applyVariableKeyCase);
  const addVariableSection = useStore((state) => state.addVariableSection);
  const clearVariableValues = useStore((state) => state.clearVariableValues);

  return (
    <VariableRowMenu
      targetId={variableId}
      kind={VariableEntryKind.VARIABLE}
      title={t.variables.actions}
      className={className}
      sectioned={sectioned}
    >
      {(count) => (
        <>
          {!isEnum && (
            <ContextMenuItem
              icon={
                <EyeIcon
                  slashed={!isSecret}
                  className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
                />
              }
              onSelect={() => toggleVariableSecret(variableId)}
            >
              {isSecret ? t.variables.reveal(count) : t.variables.mask(count)}
            </ContextMenuItem>
          )}

          <DuplicateItem targetId={variableId}>
            {t.variables.duplicate(count)}
          </DuplicateItem>

          <ContextMenuSubmenu
            icon={<AlphabetUppercase className={CssClass.ICON_MD} />}
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
            icon={<Eraser className={CssClass.ICON_MD} />}
            onSelect={() => clearVariableValues(variableId)}
          >
            {t.variables.clearValues(count)}
          </ContextMenuItem>

          {sectioned && (
            <ContextMenuItem
              icon={<Collection className={CssClass.ICON_MD} />}
              onSelect={() => addVariableSection(variableId)}
            >
              {t.variables.moveToNewSection(count)}
            </ContextMenuItem>
          )}

          {sectioned && <VariableInsertItems targetId={variableId} />}

          <RemoveItem targetId={variableId}>
            {t.variables.remove(count)}
          </RemoveItem>
        </>
      )}
    </VariableRowMenu>
  );
}
