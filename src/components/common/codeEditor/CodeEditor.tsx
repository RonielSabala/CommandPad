import { CssClass } from "@/common/constants/css";
import { MonacoSelector } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import {
  CodeEditorProperty,
  CodeModelConfig,
  MonacoLayout,
} from "@/common/editorConfig";
import { CodeLanguage, CodeRendering, PanelSide } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import type { ScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { registerEditorActions, type EditorAction } from "@/monaco/actions";
import {
  clearModelCompletions,
  completionModelKey,
  setModelCompletions,
  type VariableCompletion,
} from "@/monaco/completions";
import {
  bindContextMenuChord,
  isContextMenuOpen,
  whenContextMenuCloses,
} from "@/monaco/contextMenu";
import { bindDragScrolling } from "@/monaco/dragScroll";
import { getCodeMetrics } from "@/monaco/metrics";
import { boundedEditorOptions, flowingEditorOptions } from "@/monaco/options";
import { ensureMonacoTheme, monacoThemeName } from "@/monaco/theme";
import { useStore } from "@/store/store";
import { classNames, countLines } from "@/utils/string";
import Editor, {
  type BeforeMount,
  type Monaco,
  type OnMount,
} from "@monaco-editor/react";
import type { Selection, editor } from "monaco-editor";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
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
  readOnly?: boolean;
  minimapSide?: PanelSide | null;
  footer?: ReactNode;
  completions?: VariableCompletion[];
  actions?: EditorAction[];
  autoFocus?: boolean;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FULL_HEIGHT = "100%";

function estimateContentHeight(value: string): number {
  return countLines(value) * getCodeMetrics().lineHeightBase;
}

/** Nothing else claimed focus while the menu was up. */
function focusIsAdrift(): boolean {
  return !document.activeElement || document.activeElement === document.body;
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
      readOnly = false,
      minimapSide = null,
      footer,
      completions,
      actions,
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
    const [mounted, setMounted] = useState<editor.IStandaloneCodeEditor | null>(
      null,
    );
    const rootRef = useRef<HTMLDivElement>(null);
    const pendingFocusRef = useRef(false);
    const openingContextMenuRef = useRef(false);
    const menuSelectionRef = useRef<{
      selection: Selection;
      version: number;
    } | null>(null);
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

    useLayoutEffect(() => editorRef.current?.layout(), [contentHeight]);

    const measuredLength = useRef(value.length);
    useLayoutEffect(() => {
      const grew = value.length > measuredLength.current;
      measuredLength.current = value.length;

      if (grew && !bounded) {
        editorRef.current?.layout();
      }
    }, [bounded, value]);

    useEffect(() => {
      if (!completions) {
        return;
      }

      const key = completionModelKey(modelPath(modelId, language));
      setModelCompletions(key, completions);

      return () => clearModelCompletions(key);
    }, [completions, modelId, language]);

    // A label is fixed at registration and has to follow the UI language
    useEffect(() => {
      if (!mounted || !actions) {
        return;
      }

      const registered = registerEditorActions(mounted, actions);
      return () => registered.forEach((action) => action.dispose());
    }, [mounted, actions]);

    const publishGutterWidth = (instance: editor.ICodeEditor) => {
      const { contentLeft } = instance.getLayoutInfo();
      const { gutterPadStart, gutterGapAfter } = getCodeMetrics();

      rootRef.current?.style.setProperty(
        CodeEditorProperty.GUTTER_WIDTH,
        `${gutterPadStart + contentLeft - gutterGapAfter}px`,
      );
    };

    const pinPrompt = (instance: editor.ICodeEditor, api: Monaco) => {
      const prompt = instance.createDecorationsCollection();
      const mark = () =>
        prompt.set([
          {
            range: new api.Range(
              MonacoLayout.FIRST_LINE,
              MonacoLayout.FIRST_COLUMN,
              MonacoLayout.FIRST_LINE,
              MonacoLayout.FIRST_COLUMN,
            ),
            options: { lineNumberClassName: CssClass.CODE_EDITOR_PROMPT },
          },
        ]);

      instance.onDidChangeModel(mark);
      instance.onDidChangeModelContent(mark);
    };

    const handleBeforeMount: BeforeMount = (api) => {
      const created = api.editor.onDidCreateEditor(
        (instance: editor.ICodeEditor) => {
          created.dispose();

          publishGutterWidth(instance);
          instance.onDidLayoutChange(() => publishGutterWidth(instance));

          if (promptPrefix) {
            pinPrompt(instance, api);
          }
        },
      );
    };

    const handleMount: OnMount = (instance) => {
      editorRef.current = instance;
      setMounted(instance);
      ensureMonacoTheme(theme);

      if (!bounded) {
        const applyHeight = () => setContentHeight(instance.getContentHeight());

        applyHeight();
        instance.onDidContentSizeChange(applyHeight);
        instance.onDidLayoutChange(applyHeight);
        setScrollTarget(monacoScrollTarget(instance));
        bindDragScrolling(instance);
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

      bindContextMenuChord(instance);

      instance.onMouseDown((event) => {
        openingContextMenuRef.current = event.event.rightButton;
      });

      const restoreAfterContextMenu = () => {
        const before = menuSelectionRef.current;
        const model = instance.getModel();
        menuSelectionRef.current = null;

        if (!before || !model || !focusIsAdrift()) {
          return;
        }

        focus();
        if (model.getVersionId() === before.version) {
          instance.setSelection(before.selection);
        }
      };

      instance.onDidFocusEditorText(() => callbacks.current.onFocus?.());
      instance.onDidBlurEditorText(() =>
        requestAnimationFrame(() => {
          const model = instance.getModel();
          if (!model || instance.hasTextFocus()) {
            return;
          }

          const selection = instance.getSelection();
          if (
            selection &&
            (openingContextMenuRef.current || isContextMenuOpen())
          ) {
            openingContextMenuRef.current = false;

            // Closing fires a blur of its own
            if (!menuSelectionRef.current) {
              menuSelectionRef.current = {
                selection,
                version: model.getVersionId(),
              };
              whenContextMenuCloses(() =>
                requestAnimationFrame(restoreAfterContextMenu),
              );
            }

            return;
          }

          if (selection && !selection.isEmpty()) {
            instance.setPosition(selection.getStartPosition());
          }

          callbacks.current.onBlur?.();
        }),
      );

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
                ? boundedEditorOptions(folding, minimapSide)
                : flowingEditorOptions(folding)),
              placeholder,
              readOnly,
              lineNumbers: promptPrefix
                ? (line) =>
                    line === MonacoLayout.FIRST_LINE
                      ? promptPrefix
                      : String(line)
                : "on",
            }}
            beforeMount={handleBeforeMount}
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
