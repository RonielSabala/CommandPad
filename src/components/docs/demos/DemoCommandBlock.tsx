import { COPY_FEEDBACK_TIMEOUT_MS } from "@/common/config";
import { CommandSegmentType } from "@/common/enums";
import {
  CheckIcon,
  CopyIcon,
  EditorToggleChevronIcon,
} from "@/components/icons";
import { useAutoResize } from "@/hooks/useAutoResize";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { useTranslation } from "@/i18n";
import {
  hasUnresolvedTokens,
  resolveCommandText,
  resolveCommandToString,
  type VariableMap,
} from "@/utils/resolution";
import { useMemo, useRef, useState } from "react";
import "@/components/blocks/command/CommandBlock.css";

interface Props {
  text: string;
  onTextChange: (value: string) => void;
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

// Store-free replica of CommandBlock: same markup, CSS, and resolution
// logic as the real component, with state owned by the docs demo
export function DemoCommandBlock({
  text,
  onTextChange,
  variableMap,
  secretKeys,
}: Props) {
  const t = useTranslation();
  const [copied, setCopied] = useState(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = useMemo(() => text.split("\n").length, [text]);
  const segments = useMemo(
    () => resolveCommandText(text, variableMap),
    [text, variableMap],
  );
  const unresolved = useMemo(
    () => hasUnresolvedTokens(text, variableMap),
    [text, variableMap],
  );

  useAutoResize(textareaRef, [text, editorCollapsed]);
  const handleTabKey = useTabInsertion(onTextChange);

  const copy = () => {
    const resolved = resolveCommandToString(text, variableMap);
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
          {text ? (
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
          className={`btn btn-icon toggle-editor-btn${editorCollapsed ? " editor-collapsed" : ""}`}
          onClick={() => setEditorCollapsed((collapsed) => !collapsed)}
          title={editorCollapsed ? t.command.showEditor : t.command.hideEditor}
        >
          <EditorToggleChevronIcon className="toggle-editor-icon icon-md icon-bold" />
        </button>

        <button
          className="btn"
          onClick={copy}
          disabled={!text}
          title={t.command.copy}
        >
          {copied ? (
            <CheckIcon className="icon-md icon-bold" />
          ) : (
            <CopyIcon className="icon-md icon-bold" />
          )}
        </button>
      </div>

      {!editorCollapsed && (
        <div className="command-block-editor">
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
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            onKeyDown={handleTabKey}
          />
        </div>
      )}
    </div>
  );
}
