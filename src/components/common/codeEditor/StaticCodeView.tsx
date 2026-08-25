import { SECRET_MASK } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { CodeMetricProperty, MonacoLayout } from "@/common/editorConfig";
import { useDomScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { classNames, countLines } from "@/utils/string";
import { useRef, type CSSProperties, type ReactNode } from "react";

interface Props {
  value: string;
  placeholder?: string;
  className?: string;
  promptPrefix?: string;
  bounded?: boolean;
  hasError?: boolean;
  clamped?: boolean;
  masked?: boolean;
  footer?: ReactNode;
}

const SECOND_LINE = MonacoLayout.FIRST_LINE + 1;

export function StaticCodeView({
  value,
  placeholder,
  className,
  promptPrefix,
  bounded = false,
  hasError = false,
  clamped = false,
  masked = false,
  footer,
}: Props) {
  const textRef = useRef<HTMLPreElement>(null);
  const scrollTarget = useDomScrollTarget(textRef);

  const lineCount = countLines(value);
  const text = masked && value ? SECRET_MASK : value;
  const firstNumbered = promptPrefix ? SECOND_LINE : MonacoLayout.FIRST_LINE;
  const numberChars = Math.max(
    MonacoLayout.LINE_NUMBER_MIN_CHARS,
    String(lineCount).length,
  );

  const view = (
    <div
      className={classNames(
        "code-editor",
        "code-editor-static",
        !bounded && className,
        clamped && CssClass.CLAMPED,
      )}
      style={
        { [CodeMetricProperty.LINE_NUMBER_CHARS]: numberChars } as CSSProperties
      }
    >
      <div className="code-editor-surface">
        <div className="code-editor-static-gutter">
          {promptPrefix && (
            <span className={CssClass.CODE_EDITOR_PROMPT}>{promptPrefix}</span>
          )}

          {Array.from({ length: lineCount - firstNumbered + 1 }, (_, index) => (
            <span key={index} className="code-editor-static-line">
              {firstNumbered + index}
            </span>
          ))}
        </div>

        <pre ref={textRef} className="code-editor-static-text no-ligatures">
          {text || (
            <span className="code-editor-static-placeholder">
              {placeholder}
            </span>
          )}
        </pre>
      </div>

      {footer}

      <StickyScrollbar target={scrollTarget} deps={[value]} />
    </div>
  );

  if (!bounded) {
    return view;
  }

  return (
    <div
      className={classNames(
        "code-editor-bounded",
        hasError && "has-error",
        className,
      )}
    >
      {view}
    </div>
  );
}
