import { CARRIAGE_RETURN, LINE_BREAK, SECRET_MASK } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { MonacoSelector } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import {
  CodeEditorProperty,
  CodeModelConfig,
  EditorLanguage,
  MonacoLayout,
  RUNBOOK_JSON_SCOPES,
} from "@/common/editorConfig";
import { CodeLanguage, CodeRendering, PanelSide } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import type { ScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { registerEditorActions, type EditorAction } from "@/monaco/actions";
import {
  completionModelKey,
  modelChoices,
  modelCompletions,
  type EditorChoice,
  type VariableCompletion,
} from "@/monaco/completions";
import {
  bindContextMenuChord,
  isContextMenuOpen,
  whenContextMenuCloses,
} from "@/monaco/contextMenu";
import { bindDragScrolling } from "@/monaco/dragScroll";
import { getFindController, isFindRevealed } from "@/monaco/findWidget";
import { getCodeMetrics } from "@/monaco/metrics";
import { boundedEditorOptions, flowingEditorOptions } from "@/monaco/options";
import { bindRevealScrolling } from "@/monaco/revealScroll";
import { bindStickyWidgets } from "@/monaco/stickyWidgets";
import { isSuggesting, triggerSuggest } from "@/monaco/suggest";
import { ensureMonacoTheme, monacoThemeName } from "@/monaco/theme";
import { validateModel } from "@/monaco/validation";
import { useStore } from "@/store/store";
import { whenElementSettles } from "@/utils/dom";
import { classNames, countLines, joinLines } from "@/utils/string";
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
  useMemo,
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
  setScrollTop(value: number): void;
  suggest(): void;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  modelId: string;
  language?: CodeLanguage | EditorLanguage;
  placeholder?: string;
  className?: string;
  promptPrefix?: string;
  bounded?: boolean;
  hasError?: boolean;
  clamped?: boolean;
  folding?: boolean;
  gutter?: boolean;
  readOnly?: boolean;
  masked?: boolean;
  minimapSide?: PanelSide | null;
  header?: ReactNode;
  footer?: ReactNode;
  completions?: VariableCompletion[];
  choices?: EditorChoice[];
  /** Enter commits instead of breaking the line. */
  singleLine?: boolean;
  actions?: EditorAction[];
  autoFocus?: boolean;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onScrollChange?: (scrollTop: number) => void;
}

const FULL_HEIGHT = "100%";

function estimateContentHeight(value: string, compact: boolean): number {
  const { lineHeightBase, lineHeightMedium } = getCodeMetrics();
  return countLines(value) * (compact ? lineHeightMedium : lineHeightBase);
}

/** Nothing else claimed focus while the menu was up. */
function focusIsAdrift(): boolean {
  return !document.activeElement || document.activeElement === document.body;
}

/** Whether the editor is still being worked in, having lost its *text* focus. */
function editorIsInUse(instance: editor.IStandaloneCodeEditor): boolean {
  const node = instance.getDomNode();
  if (node?.contains(document.activeElement)) {
    return true;
  }

  return isFindRevealed(instance) && focusIsAdrift();
}

function gutterOptions(
  gutter: boolean,
  promptPrefix?: string,
): editor.IStandaloneEditorConstructionOptions {
  if (!gutter) {
    return { lineNumbers: "off", lineDecorationsWidth: 0 };
  }

  return {
    lineNumbers: promptPrefix
      ? (line) =>
          line === MonacoLayout.FIRST_LINE ? promptPrefix : String(line)
      : "on",
  };
}

function toSingleLine(text: string): string {
  return text.replaceAll(CARRIAGE_RETURN, "").replaceAll(LINE_BREAK, "");
}

function modelPath(modelId: string): string {
  const suffix = RUNBOOK_JSON_SCOPES.some((scope) => modelId.startsWith(scope))
    ? CodeModelConfig.RUNBOOK_SUFFIX
    : CodeModelConfig.PLAIN_SUFFIX;

  return `${CodeModelConfig.SCHEME}://${modelId}${suffix}`;
}

/** Files `entries` under the editor's model for as long as it is mounted. */
function useModelEntries<T>(
  registry: Map<string, T>,
  modelId: string,
  entries: T | undefined,
): void {
  useEffect(() => {
    if (!entries) {
      return;
    }

    const key = completionModelKey(modelPath(modelId));
    registry.set(key, entries);

    return () => void registry.delete(key);
  }, [registry, modelId, entries]);
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
      gutter = true,
      readOnly = false,
      masked = false,
      minimapSide = null,
      header,
      footer,
      completions,
      choices,
      singleLine = false,
      actions,
      autoFocus = false,
      onSubmit,
      onFocus,
      onBlur,
      onScrollChange,
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
    const pendingScrollTopRef = useRef<number | null>(null);
    const cancelSuggestRef = useRef<(() => void) | null>(null);
    const openingContextMenuRef = useRef(false);
    const menuSelectionRef = useRef<{
      selection: Selection;
      version: number;
    } | null>(null);
    const [scrollTarget, setScrollTarget] = useState<ScrollTarget | null>(null);
    const [contentHeight, setContentHeight] = useState<number>(() =>
      estimateContentHeight(value, singleLine),
    );

    const callbacks = useRef({ onSubmit, onFocus, onBlur, onScrollChange });
    callbacks.current = { onSubmit, onFocus, onBlur, onScrollChange };

    const gutterRef = useRef(gutter);
    gutterRef.current = gutter;

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

    const setScrollTop = useCallback((next: number) => {
      if (editorRef.current) {
        editorRef.current.setScrollTop(next);
      } else {
        pendingScrollTopRef.current = next;
      }
    }, []);

    const suggest = useCallback(() => {
      const instance = editorRef.current;
      const node = instance?.getDomNode();
      if (!instance || !node) {
        return;
      }

      cancelSuggestRef.current?.();
      cancelSuggestRef.current = whenElementSettles(node, () => {
        cancelSuggestRef.current = null;

        if (instance.hasTextFocus()) {
          triggerSuggest(instance);
        }
      });
    }, []);

    useEffect(() => () => cancelSuggestRef.current?.(), []);

    useImperativeHandle(
      forwardedRef,
      () => ({ focus, setScrollTop, suggest }),
      [focus, setScrollTop, suggest],
    );

    useLayoutEffect(() => editorRef.current?.layout(), [contentHeight]);

    const measuredLength = useRef(value.length);
    useLayoutEffect(() => {
      const grew = value.length > measuredLength.current;
      measuredLength.current = value.length;

      if (grew && !bounded) {
        editorRef.current?.layout();
      }
    }, [bounded, value]);

    useModelEntries(modelCompletions, modelId, completions);
    useModelEntries(modelChoices, modelId, choices);

    useEffect(() => {
      const model = mounted?.getModel();
      if (model) {
        validateModel(model);
      }
    }, [mounted, value, language]);

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
      const width = gutterRef.current
        ? gutterPadStart + contentLeft - gutterGapAfter
        : 0;

      rootRef.current?.style.setProperty(
        CodeEditorProperty.GUTTER_WIDTH,
        `${width}px`,
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

        // Bindings
        if (!singleLine) {
          bindDragScrolling(instance);
          bindRevealScrolling(instance);
          bindStickyWidgets(instance);
        }
      } else {
        instance.onDidScrollChange((event) =>
          callbacks.current.onScrollChange?.(event.scrollTop),
        );
      }

      instance.onKeyDown((event) => {
        if (
          singleLine &&
          event.browserEvent.key === Key.ENTER &&
          !isSuggesting(instance)
        ) {
          event.preventDefault();
          event.stopPropagation();
          inputElement()?.blur();
          return;
        }

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

      const maybeBlur = () =>
        requestAnimationFrame(() => {
          const model = instance.getModel();
          if (!model || instance.hasTextFocus() || editorIsInUse(instance)) {
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
        });

      instance.onDidFocusEditorText(() => callbacks.current.onFocus?.());
      instance.onDidBlurEditorText(maybeBlur);
      instance.onDidBlurEditorWidget(maybeBlur);

      const findState = getFindController(instance)?.getState();
      findState?.onFindReplaceStateChange(() => {
        if (!findState.isRevealed) {
          maybeBlur();
        }
      });

      if (autoFocus || pendingFocusRef.current) {
        pendingFocusRef.current = false;
        inputElement()?.focus({ preventScroll: true });
      }

      if (pendingScrollTopRef.current !== null) {
        const pending = pendingScrollTopRef.current;
        pendingScrollTopRef.current = null;
        requestAnimationFrame(() => instance.setScrollTop(pending));
      }
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === Key.ESCAPE) {
        inputElement()?.blur();
      }
    };

    const showMask = masked && value.length > 0;
    const shownPlaceholder = value ? undefined : placeholder;

    const options = useMemo<editor.IStandaloneEditorConstructionOptions>(
      () => ({
        ...(bounded
          ? boundedEditorOptions(folding, minimapSide)
          : flowingEditorOptions(folding, singleLine)),
        placeholder: shownPlaceholder,
        readOnly,
        ...gutterOptions(gutter, promptPrefix),
      }),
      [
        bounded,
        folding,
        singleLine,
        minimapSide,
        shownPlaceholder,
        readOnly,
        gutter,
        promptPrefix,
      ],
    );

    const editor = (
      <div
        className={classNames(
          "code-editor",
          "code-editor-live",
          !gutter && "no-gutter",
          singleLine && "code-editor-single-line",
          !bounded && className,
          clamped && CssClass.CLAMPED,
          showMask && "is-masked",
        )}
        onKeyDown={handleKeyDown}
        ref={rootRef}
      >
        {header && (
          <div
            className={`code-editor-header ${CssClass.SELECT_KEY_INERT_CHILDREN}`}
          >
            {header}
          </div>
        )}

        <div
          className={`code-editor-surface ${CssClass.SELECT_KEY_INERT}`}
          data-value={value}
        >
          <Editor
            path={modelPath(modelId)}
            language={language}
            theme={themeName}
            value={value}
            onChange={(next) =>
              onChange(singleLine ? toSingleLine(next ?? "") : (next ?? ""))
            }
            height={bounded ? FULL_HEIGHT : contentHeight}
            options={options}
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            loading={null}
            wrapperProps={{ className: "code-editor-monaco" }}
          />

          {showMask && (
            <div className="code-editor-mask" aria-hidden="true">
              {joinLines(
                Array.from({ length: countLines(value) }, () => SECRET_MASK),
              )}
            </div>
          )}
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
