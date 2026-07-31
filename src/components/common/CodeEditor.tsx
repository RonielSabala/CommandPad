import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { useAutoResize } from "@/hooks/useAutoResize";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { classNames, countLines } from "@/utils/string";
import type { KeyboardEvent, ReactNode } from "react";
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
  clamped?: boolean;
  footer?: ReactNode;
  resizeDeps?: unknown[];
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
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
      clamped = false,
      footer,
      resizeDeps = NO_RESIZE_DEPS,
      onKeyDown,
      onFocus,
      onBlur,
    },
    forwardedRef,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(forwardedRef, () => textareaRef.current!, []);

    const lineCount = useMemo(() => countLines(value), [value]);
    const handleTabKey = useTabInsertion(onChange);
    const handlePairWrap = usePairWrapping(onChange);
    const firstNumberedLine = promptPrefix ? 2 : 1;

    useAutoResize(textareaRef, [value, ...resizeDeps]);

    const editor = (
      <div
        className={classNames(
          "code-editor",
          !bounded && className,
          clamped && CssClass.CLAMPED,
        )}
      >
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

        <div
          className="code-editor-field"
          data-value={value}
          onClick={() => textareaRef.current?.focus()}
        >
          <textarea
            ref={textareaRef}
            className="code-editor-textarea"
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
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
        </div>

        {footer}

        <StickyScrollbar targetRef={textareaRef} deps={[value]} />
      </div>
    );

    if (!bounded) {
      return editor;
    }

    return (
      <div
        className={classNames(
          "code-editor-bounded",
          hasError && "has-error",
          className,
        )}
      >
        {editor}
      </div>
    );
  },
);
