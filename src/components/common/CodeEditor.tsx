import { Key } from "@/common/constants/events";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { useAutoResize } from "@/hooks/useAutoResize";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { classNames } from "@/utils/string";
import type { KeyboardEvent } from "react";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import "./CodeEditor.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  promptPrefix?: string;
  bounded?: boolean;
  hasError?: boolean;
  resizeDeps?: unknown[];
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

const NO_RESIZE_DEPS: unknown[] = [];

export const CodeEditor = forwardRef<HTMLTextAreaElement, Props>(
  function CodeEditor(
    {
      value,
      onChange,
      placeholder,
      className,
      promptPrefix,
      bounded = false,
      hasError = false,
      resizeDeps = NO_RESIZE_DEPS,
      onKeyDown,
    },
    forwardedRef,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(forwardedRef, () => textareaRef.current!, []);

    const lineCount = useMemo(() => value.split("\n").length, [value]);
    const handleTabKey = useTabInsertion(onChange);
    const handlePairWrap = usePairWrapping(onChange);
    const firstNumberedLine = promptPrefix ? 2 : 1;

    useAutoResize(textareaRef, [value, ...resizeDeps]);

    const row = (
      <div className={classNames("code-editor", !bounded && className)}>
        <div className="code-editor-gutter">
          {promptPrefix && (
            <span className="code-editor-gutter-prefix">{promptPrefix}</span>
          )}

          {Array.from({ length: lineCount - firstNumberedLine + 1 }, (_, i) => (
            <span key={i} className="code-editor-gutter-line">
              {firstNumberedLine + i}
            </span>
          ))}
        </div>

        <div className="code-editor-scroll" data-value={value}>
          <textarea
            ref={textareaRef}
            className="code-editor-textarea"
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === Key.ESCAPE) {
                event.currentTarget.blur();
                return;
              }

              handlePairWrap(event);
              handleTabKey(event);
              onKeyDown?.(event);
            }}
          />

          <StickyScrollbar targetRef={textareaRef} deps={[value]} />
        </div>
      </div>
    );

    if (!bounded) {
      return row;
    }

    return (
      <div
        className={classNames(
          "code-editor-bounded",
          hasError && "has-error",
          className,
        )}
      >
        {row}
      </div>
    );
  },
);
