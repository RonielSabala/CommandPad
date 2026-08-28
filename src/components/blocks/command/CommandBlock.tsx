import { COPY_FEEDBACK_TIMEOUT_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import {
  CodeModelScope,
  COMMAND_PROMPT_PREFIX,
  CommandClampConfig,
} from "@/common/editorConfig";
import { BlockType, CommandSurface } from "@/common/enums";
import type {
  CommandBlock as CommandBlockData,
  CommandSegment,
} from "@/common/types";
import {
  CodeEditor,
  type CodeEditorHandle,
} from "@/components/common/codeEditor/CodeEditor";
import { useDomScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import {
  CheckIcon,
  CopyIcon,
  EditorToggleChevronIcon,
} from "@/components/icons";
import { useExtractVariableAction } from "@/hooks/useExtractVariableAction";
import { useTranslation } from "@/i18n";
import { buildVariableCompletions } from "@/monaco/completions";
import { useStore } from "@/store/store";
import {
  countCommandLines,
  hasUnresolvedTokens,
  isMaskedSegment,
  resolveCommandText,
  resolveCommandToString,
  type VariableMap,
} from "@/utils/resolution";
import { classNames, countLines } from "@/utils/string";
import type { CSSProperties } from "react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./CommandBlock.css";
import { CommandClampToggle } from "./CommandClampToggle";

const CLAMP_STYLE = {
  [CommandClampConfig.MAX_LINES_PROPERTY]: CommandClampConfig.MAX_LINES,
} as CSSProperties;

const SECRET_MASK = "******";

const BASE_NESTING_DEPTH = 1;

function NestedText({ segment }: { segment: CommandSegment }) {
  const spans = segment.spans;
  if (!spans || spans.length < 2) {
    return segment.text;
  }

  return spans.map((span, i) =>
    span.depth > BASE_NESTING_DEPTH ? (
      <span key={i} className={`token-nesting-${span.depth}`}>
        {span.text}
      </span>
    ) : (
      <Fragment key={i}>{span.text}</Fragment>
    ),
  );
}

interface Props {
  block: CommandBlockData;
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

export function CommandBlock({ block, variableMap, secretKeys }: Props) {
  const t = useTranslation();
  const blockId = block.id;
  const blockText = block.text;
  const isEditorCollapsed = block.editorCollapsed === true;

  const updateBlock = useStore((state) => state.updateBlock);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const previewExpanded = useStore((state) =>
    state.expandedCommandSurfaces[CommandSurface.PREVIEW].has(blockId),
  );
  const editorExpanded = useStore((state) =>
    state.expandedCommandSurfaces[CommandSurface.EDITOR].has(blockId),
  );
  const toggleExpanded = useStore(
    (state) => state.toggleCommandSurfaceExpanded,
  );

  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLSpanElement>(null);
  const previewScrollTarget = useDomScrollTarget(previewRef);
  const editorRef = useRef<CodeEditorHandle>(null);
  const autoExpandedEditorRef = useRef(false);

  const segments = useMemo(
    () => resolveCommandText(blockText, variableMap),
    [blockText, variableMap],
  );
  const unresolved = useMemo(
    () => hasUnresolvedTokens(blockText, variableMap),
    [blockText, variableMap],
  );

  const completions = useMemo(
    () => buildVariableCompletions(variableMap, secretKeys),
    [variableMap, secretKeys],
  );

  const actions = useExtractVariableAction();

  const previewOverflows = useMemo(
    () =>
      countCommandLines(segments, secretKeys) > CommandClampConfig.MAX_LINES,
    [segments, secretKeys],
  );
  const editorOverflows = useMemo(
    () => countLines(blockText) > CommandClampConfig.MAX_LINES,
    [blockText],
  );

  const previewClamped = previewOverflows && !previewExpanded;
  const editorClamped = editorOverflows && !editorExpanded;

  const handleChange = useCallback(
    (value: string) => updateBlock(blockId, BlockType.COMMAND, { text: value }),
    [updateBlock, blockId],
  );

  const handleEditorFocus = useCallback(() => {
    if (editorOverflows && !editorExpanded) {
      autoExpandedEditorRef.current = true;
      toggleExpanded(blockId, CommandSurface.EDITOR);
    }
  }, [editorOverflows, editorExpanded, toggleExpanded, blockId]);

  const handleEditorBlur = useCallback(() => {
    if (autoExpandedEditorRef.current) {
      autoExpandedEditorRef.current = false;
      toggleExpanded(blockId, CommandSurface.EDITOR);
    }
  }, [toggleExpanded, blockId]);

  useEffect(() => {
    if (pendingFocus) {
      editorRef.current?.focus();
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  const copy = () => {
    const resolved = resolveCommandToString(blockText, variableMap);
    void navigator.clipboard.writeText(resolved).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT_MS);
    });
  };

  return (
    <div
      className={classNames("command-block", CssClass.BLOCK_SURFACE)}
      style={CLAMP_STYLE}
    >
      <div className="command-preview" {...{ [DataAttr.DRAG_IMAGE]: "" }}>
        <span
          ref={previewRef}
          className={classNames(
            "command-preview-text",
            "no-ligatures",
            unresolved && "has-unresolved",
            previewClamped && CssClass.CLAMPED,
          )}
        >
          {blockText ? (
            segments.map((seg, i) =>
              isMaskedSegment(seg, secretKeys) ? (
                <span key={i} className="token-secret">
                  {SECRET_MASK}
                </span>
              ) : (
                <span key={i} className={`token-${seg.type}`}>
                  <NestedText segment={seg} />
                </span>
              ),
            )
          ) : (
            <span className="command-preview-placeholder">
              {t.command.emptyPreview}
            </span>
          )}
        </span>

        <div className="command-preview-actions">
          <button
            className={`btn toggle-editor-btn${isEditorCollapsed ? " editor-collapsed" : ""}`}
            onClick={() =>
              updateBlock(blockId, BlockType.COMMAND, {
                editorCollapsed: !isEditorCollapsed,
              })
            }
            title={
              isEditorCollapsed ? t.command.showEditor : t.command.hideEditor
            }
          >
            <EditorToggleChevronIcon className="toggle-editor-icon icon-md icon-bold" />
          </button>

          <button
            className="btn"
            onClick={copy}
            disabled={!blockText}
            title={t.command.copy}
          >
            {copied ? (
              <CheckIcon className="icon-md icon-bold copy-check-icon" />
            ) : (
              <CopyIcon className="icon-md icon-bold" />
            )}
          </button>
        </div>

        {previewOverflows && (
          <CommandClampToggle
            expanded={previewExpanded}
            onToggle={() => toggleExpanded(blockId, CommandSurface.PREVIEW)}
          />
        )}

        <StickyScrollbar target={previewScrollTarget} deps={[segments]} />
      </div>

      <CodeEditor
        ref={editorRef}
        modelId={`${CodeModelScope.COMMAND}/${blockId}`}
        className={classNames(
          "command-block-editor",
          isEditorCollapsed && CssClass.COLLAPSED,
        )}
        value={blockText}
        onChange={handleChange}
        onFocus={handleEditorFocus}
        onBlur={handleEditorBlur}
        placeholder={t.command.placeholder}
        completions={completions}
        actions={actions}
        promptPrefix={COMMAND_PROMPT_PREFIX}
        clamped={editorClamped}
        footer={
          editorOverflows && (
            <CommandClampToggle
              expanded={editorExpanded}
              onToggle={() => toggleExpanded(blockId, CommandSurface.EDITOR)}
            />
          )
        }
      />
    </div>
  );
}
