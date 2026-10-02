import { CssClass } from "@/common/constants/css";
import {
  CodeModelScope,
  DEFAULT_VARIABLE_LANGUAGE,
  MonacoLayout,
} from "@/common/editorConfig";
import {
  BlockType,
  ClampSurface,
  TooltipVariant,
  VariableEntryKind,
} from "@/common/enums";
import type { RunbookBlock, Variable, VariableSection } from "@/common/types";
import { ClampToggle } from "@/components/common/codeEditor/ClampToggle";
import { CodeEditor } from "@/components/common/codeEditor/CodeEditor";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { VariableOptionsSelect } from "@/components/variables/VariableOptionsSelect";
import { VariableSectionHeader } from "@/components/variables/VariableSectionHeader";
import { CLAMP_SURFACE_STYLE, useClampSurface } from "@/hooks/useClampSurface";
import { useTranslation } from "@/i18n";
import {
  buildVariableCompletions,
  type VariableCompletion,
} from "@/monaco/completions";
import { useStore } from "@/store/store";
import { embedScopeId } from "@/utils/embeddedRunbook";
import {
  getVariableKey,
  withOverride,
  type OverrideHost,
} from "@/utils/resolution";
import { classNames, countLines } from "@/utils/string";
import { buildVariableLayout } from "@/utils/variableSections";
import { useCallback, useMemo, useRef } from "react";
import { ArrowCounterclockwise } from "react-bootstrap-icons";

import { NoteText } from "../note/NoteText";
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
  const updateBlock = useStore((state) => state.updateBlock);
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
      updateBlock(blockId, BlockType.RUNBOOK, {
        overrides: withOverride(
          overrides,
          getVariableKey(variable),
          value,
          variable.value,
        ),
      }),
    [updateBlock, blockId, overrides],
  );

  if (rows.length === 0) {
    return <EmbedNotice>{t.runbookBlock.noVariables}</EmbedNotice>;
  }

  return (
    <div className="runbook-embed-variables">
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
        "variable-section",
        "embedded-section",
        collapsed && CssClass.COLLAPSED,
      )}
    >
      <VariableSectionHeader
        collapsed={collapsed}
        count={count}
        onToggle={onToggle}
      >
        <div
          className={classNames(
            "variable-section-name",
            "embedded-section-name",
            !section.name && "is-placeholder",
          )}
        >
          <NoteText text={section.name || t.variables.sectionPlaceholder} />
        </div>
      </VariableSectionHeader>
    </div>
  );
}

interface VariableProps {
  variable: Variable;
  override: string | undefined;
  scopedId: string;
  hostCompletions: VariableCompletion[];
  embeddedCompletions: VariableCompletion[];
  onChange: (variable: Variable, value: string) => void;
}

function EmbeddedVariable({
  variable,
  override,
  scopedId,
  hostCompletions,
  embeddedCompletions,
  onChange,
}: VariableProps) {
  const t = useTranslation();
  const key = getVariableKey(variable);
  const value = override ?? variable.value;
  const overridden = override !== undefined;
  const isSecret = !!variable.secret;

  const rootRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => countLines(value), [value]);
  const clamp = useClampSurface(scopedId, ClampSurface.VALUE, lines, rootRef);

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
    <div
      ref={rootRef}
      className={classNames(
        "variable-editor",
        "embedded-variable",
        CssClass.CLAMP_SURFACE,
        isSecret && "is-secret",
        overridden && "is-overridden",
      )}
      style={CLAMP_SURFACE_STYLE}
    >
      <div className="variable-editor-key-row">
        <div
          className="variable-editor-key embedded-variable-key no-ligatures"
          {...tooltip(key, TooltipVariant.CODE)}
        >
          {key}
        </div>

        {overridden && (
          <button
            className="btn btn-flat-icon embedded-variable-reset"
            onClick={() => onChange(variable, variable.value)}
            aria-label={t.runbookBlock.resetOverride}
            {...tooltip(t.runbookBlock.resetOverride)}
          >
            <ArrowCounterclockwise className="icon-md" />
          </button>
        )}
      </div>

      {variable.options ? (
        <VariableOptionsSelect
          variableId={variable.id}
          value={value}
          options={variable.options}
          triggerClassName="variable-editor-options"
          onChange={handleChange}
        />
      ) : (
        <CodeEditor
          modelId={`${CodeModelScope.RUNBOOK_OVERRIDE}/${scopedId}`}
          className="variable-editor-value"
          value={value}
          language={variable.language ?? DEFAULT_VARIABLE_LANGUAGE}
          onChange={handleChange}
          onFocus={clamp.onFocus}
          onBlur={clamp.onBlur}
          placeholder={t.variables.valuePlaceholder}
          completions={completions}
          masked={isSecret}
          gutter={lines > MonacoLayout.FIRST_LINE}
          clamped={clamp.clamped}
          footer={
            clamp.overflows && (
              <ClampToggle expanded={clamp.expanded} onToggle={clamp.toggle} />
            )
          }
        />
      )}
    </div>
  );
}
