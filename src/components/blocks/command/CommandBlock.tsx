import { COPY_FEEDBACK_TIMEOUT_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { CommandSegmentType } from "@/common/enums";
import type { CommandBlock as CommandBlockData } from "@/common/types";
import {
  CheckIcon,
  CopyIcon,
  EditorToggleChevronIcon,
} from "@/components/icons";
import { useAutoResize } from "@/hooks/useAutoResize";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import {
  hasUnresolvedTokens,
  resolveCommandText,
  resolveCommandToString,
  type VariableMap,
} from "@/utils/resolution";
import { useEffect, useMemo, useRef, useState } from "react";
import "./CommandBlock.css";

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

  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = useMemo(() => blockText.split("\n").length, [blockText]);
  const segments = useMemo(
    () => resolveCommandText(blockText, variableMap),
    [blockText, variableMap],
  );
  const unresolved = useMemo(
    () => hasUnresolvedTokens(blockText, variableMap),
    [blockText, variableMap],
  );

  useAutoResize(textareaRef, [
    blockText,
    isEditorCollapsed,
    mode,
    isSidebarCollapsed,
  ]);
  const handleTabKey = useTabInsertion((value) =>
    updateBlockText(blockId, value),
  );
  const handlePairWrap = usePairWrapping((value) =>
    updateBlockText(blockId, value),
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
    <div className="command-block">
      <div className="command-preview">
        <span
          className={`command-preview-text${unresolved ? " has-unresolved" : ""}`}
        >
          {blockText ? (
            segments.map((seg, i) =>
              seg.type === CommandSegmentType.RESOLVED &&
              seg.key &&
              secretKeys.has(seg.key) ? (
                <span key={i} className="token-secret">
                  ******
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

      <div
        className={`command-block-editor${isEditorCollapsed ? ` ${CssClass.COLLAPSED}` : ""}`}
      >
        <div className="command-gutter">
          <span className="command-gutter-prefix">$</span>
          {Array.from({ length: lineCount - 1 }, (_, i) => (
            <span key={i} className="command-gutter-line">
              {i + 2}
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="command-textarea"
          placeholder={t.command.placeholder}
          spellCheck={false}
          autoComplete="off"
          rows={1}
          value={blockText}
          onChange={(event) => updateBlockText(blockId, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === Key.ESCAPE) {
              event.currentTarget.blur();
              return;
            }

            handlePairWrap(event);
            handleTabKey(event);
          }}
        />
      </div>
    </div>
  );
}
