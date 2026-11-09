import { CssClass, STANDARD_ICON_CLASS } from "@/common/constants/css";
import { ScrollIntoView } from "@/common/constants/dom";
import { CodeModelScope, EditorLanguage } from "@/common/editorConfig";
import {
  AppMode,
  BlockType,
  CodeRendering,
  RunbookEmbedView,
  SyncDestination,
} from "@/common/enums";
import type {
  CloudRunbookRef,
  LibraryRunbook,
  RunbookBlock as RunbookBlockData,
} from "@/common/types";
import {
  CodeEditor,
  type CodeEditorHandle,
} from "@/components/common/codeEditor/CodeEditor";
import { useCodeRendering } from "@/components/common/codeEditor/codeRendering";
import { DragImage } from "@/components/common/DragImage";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { RunbookIcon } from "@/components/icons";
import { ProviderSelect } from "@/components/modals/cloud/ProviderSelect";
import { useKeepInView } from "@/hooks/useKeepInView";
import { useTranslation } from "@/i18n";
import {
  getActiveTab,
  getRunbookEmbedView,
  useStore,
  useStoreApi,
} from "@/store/store";
import { cloudPathSegments, isEmbedUnresolved } from "@/utils/embeddedRunbook";
import { libraryPathTrail } from "@/utils/libraryTree";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { useCallback, useEffect, useRef, useState } from "react";
import { BodyText, Braces } from "react-bootstrap-icons";

import type { BlockViewProps } from "../blockViews";
import { EditorToggle } from "../EditorToggle";
import { EmbeddedVariables } from "./EmbeddedVariables";
import "./RunbookBlock.css";
import {
  EmbedActions,
  EmbedBody,
  EmbeddedBlocks,
  EmbedUnlock,
} from "./RunbookEmbed";
import { useTabEmbed } from "./useEmbeddedRunbook";
import { useCloudChoices, useLibraryChoices } from "./useRunbookChoices";

export function RunbookBlock({
  block,
  variableMap,
  secretKeys,
}: BlockViewProps<RunbookBlockData>) {
  const t = useTranslation();
  const {
    id: blockId,
    label,
    runbookId,
    cloud,
    collapsed: blockCollapsed,
  } = block;

  const cloudPath = cloud?.path ?? "";
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const isMirror = useCodeRendering() === CodeRendering.STATIC;
  const setRunbookEmbedView = useStore((state) => state.setRunbookEmbedView);
  const view = useStore((state) =>
    getRunbookEmbedView(getActiveTab(state), blockId),
  );

  const updateBlock = useStore((state) => state.updateBlock);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const { host, embed } = useTabEmbed(block, variableMap, secretKeys);
  const local = embed.source?.local ?? null;

  // Browsing folders stays out of the block, which keeps its runbook
  const committed = cloud ? cloudPath : label;
  const [draft, setDraft] = useState(committed);
  useEffect(() => setDraft(committed), [committed]);

  const sourceRef = useRef<CodeEditorHandle>(null);

  useEffect(() => {
    if (!pendingFocus) {
      return;
    }

    sourceRef.current?.focus();
    consumeBlockFocus();
  }, [pendingFocus, consumeBlockFocus]);

  // Once a label matches, remember the runbook
  useEffect(() => {
    if (isMirror || !local) {
      return;
    }

    const relabeled = label.trim() !== local.label.trim();
    if (!relabeled && runbookId === local.id) {
      return;
    }

    updateBlock(blockId, BlockType.RUNBOOK, {
      runbookId: local.id,
      ...(relabeled ? { label: local.label } : {}),
    });
  }, [isMirror, local, runbookId, label, blockId, updateBlock]);

  const store = useStoreApi();

  const changeLabel = (text: string) => {
    setDraft(text);
    if (libraryPathTrail(store.getState().libraryFolders, text).length > 0) {
      return;
    }

    updateBlock(blockId, BlockType.RUNBOOK, {
      label: text,
      runbookId: undefined,
    });
  };

  const pickRunbook = useCallback(
    ({ id, label }: LibraryRunbook) => {
      setDraft(label);
      updateBlock(blockId, BlockType.RUNBOOK, { label, runbookId: id });
    },
    [blockId, updateBlock],
  );

  const pickCloudFile = useCallback(
    (file: CloudRunbookRef) =>
      updateBlock(blockId, BlockType.RUNBOOK, { cloud: file }),
    [blockId, updateBlock],
  );

  const libraryChoices = useLibraryChoices(pickRunbook);
  const cloudChoices = useCloudChoices(cloud?.provider ?? null, pickCloudFile);

  const changeSource = (destination: SyncDestination) =>
    updateBlock(blockId, BlockType.RUNBOOK, {
      cloud:
        destination === SyncDestination.LOCAL
          ? undefined
          : { provider: destination, path: cloudPath },
    });

  const commitPath = (path: string) => {
    if (!cloud || cloudPath === path) {
      return;
    }

    updateBlock(blockId, BlockType.RUNBOOK, {
      cloud: { ...cloud, path },
    });
  };

  const changePath = (path: string) => {
    setDraft(path);
    if (cloudPathSegments(path).length) {
      return;
    }

    commitPath(path);
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const collapsed = !readMode && !!embed.source && blockCollapsed === true;
  const showingVariables = view === RunbookEmbedView.VARIABLES;

  const keepInViewOnCollapse = useKeepInView(rootRef, collapsed);
  const keepInViewOnSwitch = useKeepInView(
    rootRef,
    showingVariables,
    ScrollIntoView.BLOCK_START,
  );

  const unresolved = isEmbedUnresolved(block, embed.source, embed.status);
  const canSwitchView =
    !collapsed && !!embed.content && !embed.circular && !embed.tooDeep;

  // Labels

  const dragImageLabel = cloud
    ? draft || t.runbookBlock.pathPlaceholder
    : displayLabel(label, t) || t.runbookBlock.labelPlaceholder;

  const viewLabel = showingVariables
    ? t.runbookBlock.showBlocks
    : t.runbookBlock.showVariables;

  const collapseLabel = collapsed
    ? t.runbookBlock.expand
    : t.runbookBlock.collapse;

  return (
    <div
      ref={rootRef}
      className={classNames(
        "runbook-block",
        CssClass.BLOCK_CARD,
        CssClass.BLOCK_SURFACE,
      )}
    >
      <DragImage icon={<RunbookIcon className={STANDARD_ICON_CLASS} />}>
        {dragImageLabel}
      </DragImage>

      {(!readMode || canSwitchView || !!local || embed.locked) && (
        <div
          className={classNames(
            "runbook-block-header",
            CssClass.SELECT_KEY_INERT_CHILDREN,
          )}
        >
          {!readMode && (
            <ProviderSelect
              provider={cloud?.provider ?? SyncDestination.LOCAL}
              onChange={changeSource}
              title={t.runbookBlock.changeSource}
              portal
            />
          )}

          {!readMode && (
            <CodeEditor
              ref={sourceRef}
              modelId={`${CodeModelScope.RUNBOOK_LABEL}/${blockId}`}
              className={classNames(
                "runbook-block-source",
                unresolved && CssClass.IS_UNRESOLVED,
              )}
              value={draft}
              language={EditorLanguage.CHOICE}
              choices={cloud ? cloudChoices : libraryChoices}
              singleLine
              gutter={false}
              placeholder={
                cloud
                  ? t.runbookBlock.pathPlaceholder
                  : t.runbookBlock.labelPlaceholder
              }
              onChange={cloud ? changePath : changeLabel}
              onBlur={() => (cloud ? commitPath(draft) : setDraft(label))}
              onFocus={() => {
                if (cloud ? !embed.content : !local) {
                  sourceRef.current?.suggest();
                }
              }}
            />
          )}

          <div className={CssClass.RUNBOOK_EMBED_ACTIONS}>
            <EmbedUnlock embed={embed} />

            {canSwitchView && (
              <button
                className={classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON)}
                onClick={() => {
                  keepInViewOnSwitch();
                  setRunbookEmbedView(
                    blockId,
                    showingVariables
                      ? RunbookEmbedView.BLOCKS
                      : RunbookEmbedView.VARIABLES,
                  );
                }}
                aria-label={viewLabel}
                {...tooltip(viewLabel)}
              >
                {showingVariables ? (
                  <BodyText className={CssClass.ICON_MD} />
                ) : (
                  <Braces className={CssClass.ICON_MD} />
                )}
              </button>
            )}

            <EmbedActions embed={embed} />

            {!readMode && embed.source && (
              <EditorToggle
                collapsed={collapsed}
                label={collapseLabel}
                onToggle={() => {
                  keepInViewOnCollapse();
                  updateBlock(blockId, BlockType.RUNBOOK, {
                    collapsed: !collapsed,
                  });
                }}
              />
            )}
          </div>
        </div>
      )}

      {!collapsed && (
        <EmbedBody block={block} embed={embed}>
          {showingVariables ? (
            <EmbeddedVariables block={block} embed={embed} host={host} />
          ) : (
            <EmbeddedBlocks embed={embed} scopeId={blockId} />
          )}
        </EmbedBody>
      )}
    </div>
  );
}
