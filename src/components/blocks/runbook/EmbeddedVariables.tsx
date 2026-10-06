import { CssClass } from "@/common/constants/css";
import { CodeModelScope } from "@/common/editorConfig";
import { TooltipVariant, VariableEntryKind } from "@/common/enums";
import type { RunbookBlock, Variable, VariableSection } from "@/common/types";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { VariableSectionHeader } from "@/components/variables/VariableSectionHeader";
import { VariableValueField } from "@/components/variables/VariableValueField";
import { useTranslation } from "@/i18n";
import {
  buildVariableCompletions,
  type VariableCompletion,
} from "@/monaco/completions";
import { useStore } from "@/store/store";
import { embedScopeId } from "@/utils/embeddedRunbook";
import {
  getUsedVariableKeys,
  getVariableKey,
  isConstantVariableKey,
  isVariableUnused,
  withOverride,
  type OverrideHost,
} from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { buildVariableLayout } from "@/utils/variableSections";
import { useCallback, useMemo } from "react";
import { ArrowCounterclockwise } from "react-bootstrap-icons";

import "@/components/variables/VariablesList.css";
import { NotePreview } from "../note/NotePreview";
import "./EmbeddedVariables.css";
import { EmbedNotice } from "./RunbookEmbed";
import type { EmbeddedRunbookState } from "./useEmbeddedRunbook";

interface Props {
  block: RunbookBlock;
  embed: EmbeddedRunbookState;
  /** The embedding runbook's own variables. */
  host: OverrideHost;
}

export function EmbeddedVariables({ block, embed, host }: Props) {
  const t = useTranslation();
  const { id: blockId, overrides } = block;
  const { variableMap, secretKeys } = host;

  const folds = useStore((state) => state.embeddedSectionFolds);
  const setRunbookOverrides = useStore((state) => state.setRunbookOverrides);
  const setEmbeddedSectionFolded = useStore(
    (state) => state.setEmbeddedSectionFolded,
  );

  const variables = embed.content?.variables;
  const variableSections = embed.content?.variableSections;

  const rows = useMemo(() => {
    const sections = (variableSections ?? []).map((section) => {
      const folded = folds[embedScopeId(blockId, section.id)];
      return folded === undefined ? section : { ...section, collapsed: folded };
    });

    return buildVariableLayout(variables ?? [], sections);
  }, [variables, variableSections, folds, blockId]);

  const usedKeys = useMemo(
    () => getUsedVariableKeys(embed.content?.blocks, embed.variables),
    [embed.content, embed.variables],
  );

  // Completions
  const hostCompletions = useMemo(
    () => buildVariableCompletions(variableMap, secretKeys),
    [variableMap, secretKeys],
  );
  const embeddedCompletions = useMemo(
    () =>
      buildVariableCompletions(embed.variableMap, embed.secretKeys).filter(
        (entry) => !(entry.key in variableMap),
      ),
    [embed.variableMap, embed.secretKeys, variableMap],
  );

  const setOverride = useCallback(
    (variable: Variable, value: string) =>
      setRunbookOverrides(
        blockId,
        withOverride(
          overrides,
          getVariableKey(variable),
          value,
          variable.value,
        ),
      ),
    [setRunbookOverrides, blockId, overrides],
  );

  if (rows.length === 0) {
    return <EmbedNotice>{t.runbookBlock.noVariables}</EmbedNotice>;
  }

  return (
    <div
      className={classNames(CssClass.VARIABLES_LIST, "runbook-embed-variables")}
    >
      {rows.map((row) => {
        if (row.kind === VariableEntryKind.SECTION) {
          const { section } = row;
          return (
            <EmbeddedSection
              key={section.id}
              section={section}
              count={row.count}
              onToggle={() =>
                setEmbeddedSectionFolded(
                  embedScopeId(blockId, section.id),
                  !section.collapsed,
                )
              }
            />
          );
        }

        const { variable } = row;
        const key = getVariableKey(variable);
        return (
          <EmbeddedVariable
            key={variable.id}
            variable={variable}
            override={
              overrides && Object.hasOwn(overrides, key)
                ? overrides[key]
                : undefined
            }
            scopedId={embedScopeId(blockId, variable.id)}
            unused={isVariableUnused(variable, usedKeys)}
            hostCompletions={hostCompletions}
            embeddedCompletions={embeddedCompletions}
            onChange={setOverride}
          />
        );
      })}
    </div>
  );
}

interface SectionProps {
  section: VariableSection;
  count: number;
  onToggle: () => void;
}

function EmbeddedSection({ section, count, onToggle }: SectionProps) {
  const t = useTranslation();
  const collapsed = !!section.collapsed && count > 0;

  return (
    <div
      className={classNames(
        CssClass.VARIABLE_SECTION,
        collapsed && CssClass.COLLAPSED,
      )}
    >
      <VariableSectionHeader
        collapsed={collapsed}
        count={count}
        onToggle={onToggle}
      >
        <NotePreview
          text={section.name}
          placeholder={t.variables.sectionPlaceholder}
          className={CssClass.VARIABLE_SECTION_NAME}
          standalone
        />
      </VariableSectionHeader>
    </div>
  );
}

interface VariableProps {
  variable: Variable;
  override: string | undefined;
  scopedId: string;
  unused: boolean;
  hostCompletions: VariableCompletion[];
  embeddedCompletions: VariableCompletion[];
  onChange: (variable: Variable, value: string) => void;
}

function EmbeddedVariable({
  variable,
  override,
  scopedId,
  unused,
  hostCompletions,
  embeddedCompletions,
  onChange,
}: VariableProps) {
  const t = useTranslation();
  const key = getVariableKey(variable);
  const value = override ?? variable.value;
  const overridden = override !== undefined;

  const completions = useMemo(
    () => [
      ...hostCompletions,
      ...embeddedCompletions.filter((entry) => entry.key !== key),
    ],
    [hostCompletions, embeddedCompletions, key],
  );
  const handleChange = useCallback(
    (next: string) => onChange(variable, next),
    [onChange, variable],
  );

  return (
    <VariableValueField
      variable={variable}
      value={value}
      scope={CodeModelScope.RUNBOOK_OVERRIDE}
      surfaceId={scopedId}
      completions={completions}
      className={classNames(
        "embedded-variable",
        overridden && "is-overridden",
        unused && CssClass.IS_UNUSED,
      )}
      onChange={handleChange}
      keyRow={
        <>
          <div
            className={classNames(
              "embedded-variable-key",
              !key && "is-empty",
              CssClass.NO_LIGATURES,
              CssClass.VARIABLE_EDITOR_KEY,
              isConstantVariableKey(key) && CssClass.IS_CONSTANT,
            )}
            {...tooltip(
              unused ? t.variables.unusedTitle(key) : key,
              TooltipVariant.CODE,
            )}
          >
            {key || t.variables.keyPlaceholder}
          </div>

          {overridden && (
            <button
              className="btn btn-flat-icon embedded-variable-reset"
              onClick={() => onChange(variable, variable.value)}
              aria-label={t.runbookBlock.resetOverride}
              {...tooltip(t.runbookBlock.resetOverride)}
            >
              <ArrowCounterclockwise className={CssClass.ICON_MD} />
            </button>
          )}
        </>
      }
    />
  );
}
