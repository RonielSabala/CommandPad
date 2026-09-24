import { VariableEntryKind, VariableKind } from "@/common/enums";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import { EyeIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { getCaseOperationKeywords } from "@/utils/resolution";
import {
  AlphabetUppercase,
  Collection,
  CursorText,
  ListUl,
} from "react-bootstrap-icons";

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
  const setVariableKind = useStore((state) => state.setVariableKind);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const applyVariableKeyCase = useStore((state) => state.applyVariableKeyCase);
  const addVariableSection = useStore((state) => state.addVariableSection);

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
          <ContextMenuItem
            icon={
              isEnum ? (
                <CursorText className="icon-md" />
              ) : (
                <ListUl className="icon-md" />
              )
            }
            onSelect={() =>
              setVariableKind(
                variableId,
                isEnum ? VariableKind.TEXT : VariableKind.ENUM,
              )
            }
          >
            {isEnum ? t.variables.makeText(count) : t.variables.makeEnum(count)}
          </ContextMenuItem>

          {!isEnum && (
            <ContextMenuItem
              icon={
                <EyeIcon slashed={!isSecret} className="icon-md icon-bold" />
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

          {sectioned && (
            <ContextMenuItem
              icon={<Collection className="icon-md" />}
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
