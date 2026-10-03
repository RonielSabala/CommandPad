import { CssClass } from "@/common/constants/css";
import {
  CodeModelScope,
  COMMAND_PROMPT_PREFIX,
  DEFAULT_COMMAND_LANGUAGE,
} from "@/common/editorConfig";
import { BlockType, ClampSurface, CodeLanguage } from "@/common/enums";
import type { CommandBlock as CommandBlockData } from "@/common/types";
import { ClampToggle } from "@/components/common/codeEditor/ClampToggle";
import {
  CodeEditor,
  type CodeEditorHandle,
} from "@/components/common/codeEditor/CodeEditor";
import { CodeLanguageSelect } from "@/components/common/codeEditor/CodeLanguageSelect";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { EditorToggleChevronIcon } from "@/components/icons";
import { CLAMP_SURFACE_STYLE, useClampSurface } from "@/hooks/useClampSurface";
import { useEditorActions } from "@/hooks/useEditorActions";
import { useTranslation } from "@/i18n";
import { buildVariableCompletions } from "@/monaco/completions";
import { useStore } from "@/store/store";
import type { VariableMap } from "@/utils/resolution";
import { classNames, countLines } from "@/utils/string";
import { useCallback, useEffect, useMemo, useRef } from "react";

import "./CommandBlock.css";
import { CommandPreview } from "./CommandPreview";

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
  const toggleEditorLabel = isEditorCollapsed
    ? t.command.showEditor
    : t.command.hideEditor;

  const updateBlock = useStore((state) => state.updateBlock);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<CodeEditorHandle>(null);

  const completions = useMemo(
    () => buildVariableCompletions(variableMap, secretKeys),
    [variableMap, secretKeys],
  );

  const actions = useEditorActions();

  const editorLines = useMemo(() => countLines(blockText), [blockText]);

  const editor = useClampSurface(
    blockId,
    ClampSurface.EDITOR,
    editorLines,
    rootRef,
  );

  const handleChange = useCallback(
    (value: string) => updateBlock(blockId, BlockType.COMMAND, { text: value }),
    [updateBlock, blockId],
  );

  const handleLanguageChange = useCallback(
    (language: CodeLanguage) =>
      updateBlock(blockId, BlockType.COMMAND, { language }),
    [updateBlock, blockId],
  );

  useEffect(() => {
    if (pendingFocus) {
      editorRef.current?.focus();
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  return (
    <div
      ref={rootRef}
      className={classNames(
        "command-card",
        "command-block",
        CssClass.BLOCK_SURFACE,
        CssClass.CLAMP_SURFACE,
      )}
      style={CLAMP_SURFACE_STYLE}
    >
      <CommandPreview
        clampId={blockId}
        text={blockText}
        variableMap={variableMap}
        secretKeys={secretKeys}
        surfaceRef={rootRef}
        actions={
          <button
            className={`btn toggle-editor-btn${isEditorCollapsed ? " editor-collapsed" : ""}`}
            onClick={() =>
              updateBlock(blockId, BlockType.COMMAND, {
                editorCollapsed: !isEditorCollapsed,
              })
            }
            aria-label={toggleEditorLabel}
            {...tooltip(toggleEditorLabel)}
          >
            <EditorToggleChevronIcon className="toggle-editor-icon icon-md icon-bold" />
          </button>
        }
      />

      <CodeEditor
        ref={editorRef}
        modelId={`${CodeModelScope.COMMAND}/${blockId}`}
        className={classNames(
          "command-block-editor",
          isEditorCollapsed && CssClass.COLLAPSED,
        )}
        value={blockText}
        language={block.language}
        onChange={handleChange}
        onFocus={editor.onFocus}
        onBlur={editor.onBlur}
        placeholder={t.command.placeholder}
        completions={completions}
        actions={actions}
        promptPrefix={COMMAND_PROMPT_PREFIX}
        clamped={editor.clamped}
        header={
          <CodeLanguageSelect
            language={block.language ?? DEFAULT_COMMAND_LANGUAGE}
            onChange={handleLanguageChange}
          />
        }
        footer={
          editor.overflows && (
            <ClampToggle expanded={editor.expanded} onToggle={editor.toggle} />
          )
        }
      />
    </div>
  );
}
