import {
  COMMAND_PROMPT_PREFIX,
  COPY_FEEDBACK_TIMEOUT_MS,
} from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { CommandSegmentType } from "@/common/enums";
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
  hasUnresolvedTokens,
  resolveCommandText,
  resolveCommandToString,
  type VariableMap,
} from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    <div className="command-block">
      <div className="command-preview">
        <div className="command-preview-scroll">
          <span
            ref={previewRef}
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
        resizeDeps={[isEditorCollapsed, mode, isSidebarCollapsed]}
      />
    </div>
  );
}
