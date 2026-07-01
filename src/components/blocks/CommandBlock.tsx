import './CommandBlock.css';

import { useEffect, useMemo, useRef, useState } from 'react';

import { COPY_FEEDBACK_TIMEOUT_MS, UI } from '@/common/config';
import { CssClass } from '@/common/constants/css';
import { SegmentType } from '@/common/enums';
import type { CommandBlock as CommandBlockData } from '@/common/types';
import { useStore } from '@/store/store';
import { useAutoResize } from '@/hooks/useAutoResize';
import {
  hasUnresolvedTokens,
  resolveCommandText,
  resolveCommandToString,
  type VariableMap,
} from '@/utils/resolution';

interface Props {
  block: CommandBlockData;
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

export function CommandBlock({ block, variableMap, secretKeys }: Props) {
  const mode = useStore((s) => s.mode);
  const updateBlockText = useStore((s) => s.updateBlockText);
  const toggleCommandEditor = useStore((s) => s.toggleCommandEditor);
  const pendingFocus = useStore((s) => s.pendingFocusBlockId === block.id);
  const consumeBlockFocus = useStore((s) => s.consumeBlockFocus);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const collapsed = block.editorCollapsed === true;
  const segments = useMemo(() => resolveCommandText(block.text, variableMap), [block.text, variableMap]);
  const unresolved = useMemo(() => hasUnresolvedTokens(block.text, variableMap), [block.text, variableMap]);

  useAutoResize(textareaRef, [block.text, collapsed, mode]);

  useEffect(() => {
    if (pendingFocus) {
      textareaRef.current?.focus();
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  const copy = () => {
    const resolved = resolveCommandToString(block.text, variableMap);
    void navigator.clipboard.writeText(resolved).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT_MS);
    });
  };

  return (
    <div className="command-block">
      <div className="command-preview">
        <span className={`command-preview-text${unresolved ? ` ${CssClass.HAS_UNRESOLVED}` : ''}`}>
          {block.text ? (
            segments.map((seg, i) =>
              seg.type === SegmentType.RESOLVED && seg.key && secretKeys.has(seg.key) ? (
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
          className={`btn btn-icon toggle-editor-btn${collapsed ? ` ${CssClass.EDITOR_COLLAPSED}` : ''}`}
          onClick={() => toggleCommandEditor(block.id)}
          title={`${collapsed ? 'Show' : 'Hide'} editor`}
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
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="9" height="9" rx="1" />
              <path d="M3 11V2h9" />
            </svg>
          )}
        </button>
      </div>

      <div className={`command-block-editor${collapsed ? ` ${CssClass.COLLAPSED}` : ''}`}>
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
          value={block.text}
          onChange={(e) => updateBlockText(block.id, e.target.value)}
        />
      </div>
    </div>
  );
}
