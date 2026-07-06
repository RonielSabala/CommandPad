import { COPY_FEEDBACK_TIMEOUT_MS, UI } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { CommandSegmentType } from "@/common/enums";
import type { CommandBlock as CommandBlockData } from "@/common/types";
import { useAutoResize } from "@/hooks/useAutoResize";
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
  const blockId = block.id;
  const blockText = block.text;
  const isEditorCollapsed = block.editorCollapsed === true;

  const mode = useStore((state) => state.mode);
  const updateBlockText = useStore((state) => state.updateBlockText);
  const toggleCommandEditor = useStore((state) => state.toggleCommandEditor);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const segments = useMemo(
    () => resolveCommandText(blockText, variableMap),
    [blockText, variableMap],
  );
  const unresolved = useMemo(
    () => hasUnresolvedTokens(blockText, variableMap),
    [blockText, variableMap],
  );

  useAutoResize(textareaRef, [blockText, isEditorCollapsed, mode]);

  useEffect(() => {
    if (pendingFocus) {
      textareaRef.current?.focus();
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
                  {UI.SECRET_MASK}
                </span>
              ) : (
                <span key={i} className={`token-${seg.type}`}>
                  {seg.text}
                </span>
              ),
            )
          ) : (
            <span className="command-preview-placeholder">empty command</span>
          )}
        </span>

        <button
          className={`btn btn-icon toggle-editor-btn${isEditorCollapsed ? " editor-collapsed" : ""}`}
          onClick={() => toggleCommandEditor(blockId)}
          title={isEditorCollapsed ? "Show editor" : "Hide editor"}
        >
          <svg viewBox="0 0 12 12">
            <polyline points="2,4 6,8 10,4" />
          </svg>
        </button>

        <button className="btn" onClick={copy} title="Copy command">
          {copied ? (
            <svg viewBox="0 0 16 16" width="13" height="13">
              <polyline
                points="2,8 6,12 14,4"
                stroke="var(--success)"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 16 16"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="5" width="9" height="9" rx="1" />
              <path d="M3 11V2h9" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`command-block-editor${isEditorCollapsed ? ` ${CssClass.COLLAPSED}` : ""}`}
      >
        <div className="command-gutter">
          <span className="command-gutter-prefix">$</span>
        </div>
        <textarea
          ref={textareaRef}
          className="command-textarea"
          placeholder="ssh {USER}@{HOST}"
          spellCheck={false}
          autoComplete="off"
          rows={1}
          value={blockText}
          onChange={(event) => updateBlockText(blockId, event.target.value)}
        />
      </div>
    </div>
  );
}
