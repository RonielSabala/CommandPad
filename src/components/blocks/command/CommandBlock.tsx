import {
  CARRIAGE_RETURN,
  COPY_FEEDBACK_TIMEOUT_MS,
  LINE_BREAK,
  NON_BREAKING_SPACE,
} from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import {
  CodeModelScope,
  COMMAND_PROMPT_PREFIX,
  DEFAULT_COMMAND_LANGUAGE,
} from "@/common/editorConfig";
import {
  BlockType,
  ClampSurface,
  CodeLanguage,
  TooltipVariant,
} from "@/common/enums";
import type {
  CommandBlock as CommandBlockData,
  CommandSegment,
} from "@/common/types";
import { ClampToggle } from "@/components/common/codeEditor/ClampToggle";
import {
  CodeEditor,
  type CodeEditorHandle,
} from "@/components/common/codeEditor/CodeEditor";
import { CodeLanguageSelect } from "@/components/common/codeEditor/CodeLanguageSelect";
import { useDomScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  CheckIcon,
  CopyIcon,
  EditorToggleChevronIcon,
} from "@/components/icons";
import { CLAMP_SURFACE_STYLE, useClampSurface } from "@/hooks/useClampSurface";
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
import { classNames, countLines, splitLines, stripEnd } from "@/utils/string";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./CommandBlock.css";

const SECRET_MASK = "******";

function HighlightedLines({
  text,
  className,
  title,
}: {
  text: string;
  className: string;
  title?: string;
}) {
  return splitLines(text).map((line, i) => {
    const content = stripEnd(line, CARRIAGE_RETURN);
    const isBlank = content === "";

    return (
      <Fragment key={i}>
        {i > 0 && LINE_BREAK}
        <span
          className={classNames(className, isBlank && "token-nesting-blank")}
          {...tooltip(title, TooltipVariant.CODE)}
        >
          {isBlank ? NON_BREAKING_SPACE : content}
        </span>
      </Fragment>
    );
  });
}

function NestedText({ segment }: { segment: CommandSegment }) {
  const spans = segment.spans;
  if (!spans) {
    return segment.text;
  }

  return spans.map((span, i) => (
    <HighlightedLines
      key={i}
      text={span.text}
      className={`token-nesting-${span.depth}`}
      title={span.source}
    />
  ));
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
  const toggleEditorLabel = isEditorCollapsed
    ? t.command.showEditor
    : t.command.hideEditor;

  const updateBlock = useStore((state) => state.updateBlock);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLSpanElement>(null);
  const previewScrollTarget = useDomScrollTarget(previewRef);
  const editorRef = useRef<CodeEditorHandle>(null);

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

  const previewLines = useMemo(
    () => countCommandLines(segments, secretKeys),
    [segments, secretKeys],
  );
  const editorLines = useMemo(() => countLines(blockText), [blockText]);

  const preview = useClampSurface(blockId, ClampSurface.PREVIEW, previewLines);
  const editor = useClampSurface(blockId, ClampSurface.EDITOR, editorLines);

  const handleChange = useCallback(
    (value: string) => updateBlock(blockId, BlockType.COMMAND, { text: value }),
    [updateBlock, blockId],
  );

  const handleLanguageChange = useCallback(
    (language: CodeLanguage) =>
      updateBlock(blockId, BlockType.COMMAND, { language }),
    [updateBlock, blockId],
  );

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
      className={classNames(
        "command-block",
        CssClass.BLOCK_SURFACE,
        CssClass.CLAMP_SURFACE,
      )}
      style={CLAMP_SURFACE_STYLE}
    >
      <div className="command-preview" {...{ [DataAttr.DRAG_IMAGE]: "" }}>
        <span
          ref={previewRef}
          className={classNames(
            "command-preview-text",
            "no-ligatures",
            unresolved && "has-unresolved",
            preview.clamped && CssClass.CLAMPED,
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
            aria-label={toggleEditorLabel}
            {...tooltip(toggleEditorLabel)}
          >
            <EditorToggleChevronIcon className="toggle-editor-icon icon-md icon-bold" />
          </button>

          <button
            className="btn"
            onClick={copy}
            disabled={!blockText}
            aria-label={t.command.copy}
            {...tooltip(t.command.copy)}
          >
            {copied ? (
              <CheckIcon className="icon-md icon-bold copy-check-icon" />
            ) : (
              <CopyIcon className="icon-md icon-bold" />
            )}
          </button>
        </div>

        {preview.overflows && (
          <ClampToggle expanded={preview.expanded} onToggle={preview.toggle} />
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
        language={block.language}
        onChange={handleChange}
        onFocus={editor.onFocus}
        onBlur={editor.onBlur}
        placeholder={t.command.placeholder}
        completions={completions}
        actions={actions}
        promptPrefix={COMMAND_PROMPT_PREFIX}
        clamped={editor.clamped}
        header={
          <CodeLanguageSelect
            language={block.language ?? DEFAULT_COMMAND_LANGUAGE}
            onChange={handleLanguageChange}
          />
        }
        footer={
          editor.overflows && (
            <ClampToggle expanded={editor.expanded} onToggle={editor.toggle} />
          )
        }
      />
    </div>
  );
}
