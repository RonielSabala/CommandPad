import {
  COMMAND_PROMPT_PREFIX,
  CommandClampConfig,
  COPY_FEEDBACK_TIMEOUT_MS,
} from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { CommandSurface } from "@/common/enums";
import type { CommandBlock as CommandBlockData } from "@/common/types";
import { CodeEditor } from "@/components/common/CodeEditor";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import {
  CheckIcon,
  CopyIcon,
  EditorToggleChevronIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./CommandBlock.css";
import { CommandClampToggle } from "./CommandClampToggle";

const CLAMP_STYLE = {
  [CommandClampConfig.MAX_LINES_PROPERTY]: CommandClampConfig.MAX_LINES,
} as CSSProperties;

const SECRET_MASK = "******";

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

  const mode = useStore((state) => state.mode);
  const isSidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const updateBlockText = useStore((state) => state.updateBlockText);
  const toggleCommandEditor = useStore((state) => state.toggleCommandEditor);
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const segments = useMemo(
    () => resolveCommandText(blockText, variableMap),
    [blockText, variableMap],
  );
  const unresolved = useMemo(
    () => hasUnresolvedTokens(blockText, variableMap),
    [blockText, variableMap],
  );

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
    (value: string) => updateBlockText(blockId, value),
    [updateBlockText, blockId],
  );

  useEffect(() => {
    if (pendingFocus) {
      textareaRef.current?.focus({ preventScroll: true });
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
    <div className="command-block" style={CLAMP_STYLE}>
      <div className="command-preview">
        <div className="command-preview-scroll">
          <span
            ref={previewRef}
            className={classNames(
              "command-preview-text",
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
                    {seg.text}
                  </span>
                ),
              )
            ) : (
              <span className="command-preview-placeholder">
                {t.command.emptyPreview}
              </span>
            )}
          </span>

          {previewOverflows && (
            <CommandClampToggle
              expanded={previewExpanded}
              onToggle={() => toggleExpanded(blockId, CommandSurface.PREVIEW)}
            />
          )}

          <StickyScrollbar targetRef={previewRef} deps={[segments]} />
        </div>

        <div className="command-preview-actions">
          <button
            className={`btn btn-icon toggle-editor-btn${isEditorCollapsed ? " editor-collapsed" : ""}`}
            onClick={() => toggleCommandEditor(blockId)}
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
      </div>

      <CodeEditor
        ref={textareaRef}
        className={classNames(
          "command-block-editor",
          isEditorCollapsed && CssClass.COLLAPSED,
        )}
        value={blockText}
        onChange={handleChange}
        placeholder={t.command.placeholder}
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
        resizeDeps={[isEditorCollapsed, mode, isSidebarCollapsed]}
      />
    </div>
  );
}
