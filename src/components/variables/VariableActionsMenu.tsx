import { VariableKind } from "@/common/enums";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import { DuplicateIcon, EyeIcon, TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { countVariableTargets, useStore } from "@/store/store";
import { getCaseOperationKeywords } from "@/utils/resolution";
import {
  AlphabetUppercase,
  Collection,
  CursorText,
  ListUl,
} from "react-bootstrap-icons";

import {
  MixedSelectionItems,
  VariableInsertItems,
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
  const duplicateVariable = useStore((state) => state.duplicateVariable);
  const applyVariableKeyCase = useStore((state) => state.applyVariableKeyCase);
  const addVariableSection = useStore((state) => state.addVariableSection);
  const removeVariable = useStore((state) => state.removeVariable);

  const count = useStore(
    (state) => countVariableTargets(state, variableId).variables,
  );
  const mixed = useStore(
    (state) => countVariableTargets(state, variableId).sections > 0,
  );

  if (mixed) {
    return (
      <ActionsMenu className={className} title={t.variables.actions}>
        <MixedSelectionItems targetId={variableId} sectioned={sectioned} />
      </ActionsMenu>
    );
  }

  return (
    <ActionsMenu className={className} title={t.variables.actions}>
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
          icon={<EyeIcon slashed={!isSecret} className="icon-md icon-bold" />}
          onSelect={() => toggleVariableSecret(variableId)}
        >
          {isSecret ? t.variables.reveal(count) : t.variables.mask(count)}
        </ContextMenuItem>
      )}

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

      {sectioned && (
        <ContextMenuItem
          icon={<Collection className="icon-md" />}
          onSelect={() => addVariableSection(variableId)}
        >
          {t.variables.moveToNewSection(count)}
        </ContextMenuItem>
      )}

      {sectioned && <VariableInsertItems targetId={variableId} />}

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
