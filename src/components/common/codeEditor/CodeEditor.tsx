import { CssClass } from "@/common/constants/css";
import { MonacoSelector } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import {
  CodeEditorProperty,
  CodeModelConfig,
  MonacoLayout,
} from "@/common/editorConfig";
import { CodeLanguage, CodeRendering } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import type { ScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { getCodeMetrics } from "@/monaco/metrics";
import { boundedEditorOptions, flowingEditorOptions } from "@/monaco/options";
import { ensureMonacoTheme, monacoThemeName } from "@/monaco/theme";
import { useStore } from "@/store/store";
import { classNames, countLines } from "@/utils/string";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import "./CodeEditor.css";
import { useCodeRendering } from "./codeRendering";
import { monacoScrollTarget } from "./monacoScrollTarget";
import { StaticCodeView } from "./StaticCodeView";

export interface CodeEditorHandle {
  focus(): void;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  modelId: string;
  language?: CodeLanguage;
  placeholder?: string;
  className?: string;
  promptPrefix?: string;
  bounded?: boolean;
  hasError?: boolean;
  clamped?: boolean;
  folding?: boolean;
  footer?: ReactNode;
  autoFocus?: boolean;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FULL_HEIGHT = "100%";

function estimateContentHeight(value: string): number {
  return countLines(value) * getCodeMetrics().lineHeightBase;
}

function modelPath(modelId: string, language: CodeLanguage): string {
  const suffix =
    language === CodeLanguage.JSON
      ? CodeModelConfig.RUNBOOK_SUFFIX
      : CodeModelConfig.PLAIN_SUFFIX;

  return `${CodeModelConfig.SCHEME}://${modelId}${suffix}`;
}

export const CodeEditor = forwardRef<CodeEditorHandle, Props>(
  function CodeEditor(props, forwardedRef) {
    const rendering = useCodeRendering();
    if (rendering === CodeRendering.STATIC) {
      return <StaticCodeView {...props} />;
    }

    return <MonacoCodeEditor {...props} ref={forwardedRef} />;
  },
);

const MonacoCodeEditor = forwardRef<CodeEditorHandle, Props>(
  function MonacoCodeEditor(
    {
      value,
      onChange,
      modelId,
      language = CodeLanguage.PLAIN,
      placeholder,
      className,
      promptPrefix,
      bounded = false,
      hasError = false,
      clamped = false,
      folding = false,
      footer,
      autoFocus = false,
      onSubmit,
      onFocus,
      onBlur,
    },
    forwardedRef,
  ) {
    const theme = useStore((state) => state.theme);
    const themeName = monacoThemeName(theme);

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const pendingFocusRef = useRef(false);
    const [scrollTarget, setScrollTarget] = useState<ScrollTarget | null>(null);
    const [contentHeight, setContentHeight] = useState<number>(() =>
      estimateContentHeight(value),
    );

    const callbacks = useRef({ onSubmit, onFocus, onBlur });
    callbacks.current = { onSubmit, onFocus, onBlur };

    const inputElement = useCallback(
      () =>
        editorRef.current
          ?.getDomNode()
          ?.querySelector<HTMLTextAreaElement>(MonacoSelector.INPUT) ?? null,
      [],
    );

    const focus = useCallback(() => {
      const input = inputElement();
      if (input) {
        input.focus({ preventScroll: true });
      } else {
        pendingFocusRef.current = true;
      }
    }, [inputElement]);

    useImperativeHandle(forwardedRef, () => ({ focus }), [focus]);

    const handleMount: OnMount = (instance, api) => {
      editorRef.current = instance;
      ensureMonacoTheme(theme);

      if (promptPrefix) {
        const promptDecoration = () => ({
          range: new api.Range(
            MonacoLayout.FIRST_LINE,
            MonacoLayout.FIRST_COLUMN,
            MonacoLayout.FIRST_LINE,
            MonacoLayout.FIRST_COLUMN,
          ),
          options: { lineNumberClassName: CssClass.CODE_EDITOR_PROMPT },
        });

        const prompt = instance.createDecorationsCollection([
          promptDecoration(),
        ]);

        instance.onDidChangeModelContent(() =>
          prompt.set([promptDecoration()]),
        );
      }

      const publishGutterWidth = () => {
        const { contentLeft } = instance.getLayoutInfo();
        const { gutterPadStart, gutterGapAfter } = getCodeMetrics();

        rootRef.current?.style.setProperty(
          CodeEditorProperty.GUTTER_WIDTH,
          `${gutterPadStart + contentLeft - gutterGapAfter}px`,
        );
      };

      publishGutterWidth();
      instance.onDidLayoutChange(publishGutterWidth);

      if (!bounded) {
        const applyHeight = () => setContentHeight(instance.getContentHeight());

        applyHeight();
        instance.onDidContentSizeChange(applyHeight);
        instance.onDidLayoutChange(applyHeight);
        setScrollTarget(monacoScrollTarget(instance));
      }

      instance.onKeyDown((event) => {
        if (
          !callbacks.current.onSubmit ||
          !matchesKeybinding(event.browserEvent, KeyBinding.SUBMIT_EDITOR)
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        callbacks.current.onSubmit();
      });

      instance.onDidFocusEditorText(() => callbacks.current.onFocus?.());
      instance.onDidBlurEditorText(() => {
        instance.setPosition({
          lineNumber: MonacoLayout.FIRST_LINE,
          column: MonacoLayout.FIRST_COLUMN,
        });
        callbacks.current.onBlur?.();
      });

      if (autoFocus || pendingFocusRef.current) {
        pendingFocusRef.current = false;
        inputElement()?.focus({ preventScroll: true });
      }
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === Key.ESCAPE) {
        inputElement()?.blur();
      }
    };

    const editor = (
      <div
        className={classNames(
          "code-editor",
          "code-editor-live",
          !bounded && className,
          clamped && CssClass.CLAMPED,
        )}
        onKeyDown={handleKeyDown}
        ref={rootRef}
      >
        <div className="code-editor-surface" data-value={value}>
          <Editor
            path={modelPath(modelId, language)}
            language={language}
            theme={themeName}
            value={value}
            onChange={(next) => onChange(next ?? "")}
            height={bounded ? FULL_HEIGHT : contentHeight}
            options={{
              ...(bounded
                ? boundedEditorOptions(folding)
                : flowingEditorOptions(folding)),
              placeholder,
              lineNumbers: promptPrefix
                ? (line) =>
                    line === MonacoLayout.FIRST_LINE
                      ? promptPrefix
                      : String(line)
                : "on",
            }}
            onMount={handleMount}
            loading={null}
            wrapperProps={{ className: "code-editor-monaco" }}
          />
        </div>

        {footer}

        <StickyScrollbar target={scrollTarget} deps={[value]} />
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
