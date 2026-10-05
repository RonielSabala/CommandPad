import { RunbookBlockConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import { CodeModelScope, EditorLanguage } from "@/common/editorConfig";
import {
  AppMode,
  BlockType,
  CodeRendering,
  EmbeddedRunbookStatus,
  RunbookEmbedView,
  SyncDestination,
} from "@/common/enums";
import type { RunbookBlock as RunbookBlockData } from "@/common/types";
import {
  CodeEditor,
  type CodeEditorHandle,
} from "@/components/common/codeEditor/CodeEditor";
import { useCodeRendering } from "@/components/common/codeEditor/codeRendering";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { RunbookIcon } from "@/components/icons";
import { ProviderSelect } from "@/components/modals/cloud/ProviderSelect";
import { useKeepInView } from "@/hooks/useKeepInView";
import { useTranslation } from "@/i18n";
import type { ChoiceSource, EditorChoice } from "@/monaco/completions";
import type { CloudEntry } from "@/services/cloud";
import { getActiveTab, getRunbookEmbedView, useStore } from "@/store/store";
import { cloudPathSegments, localSourceKey } from "@/utils/embeddedRunbook";
import { formatFileSize } from "@/utils/format";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { useEffect, useMemo, useRef, useState } from "react";
import { BodyText, Braces } from "react-bootstrap-icons";

import type { BlockViewProps } from "../blockViews";
import { EditorToggle } from "../EditorToggle";
import { EmbeddedVariables } from "./EmbeddedVariables";
import "./RunbookBlock.css";
import { EmbedActions, EmbedBody, EmbeddedBlocks } from "./RunbookEmbed";
import { useEmbeddedRunbook } from "./useEmbeddedRunbook";

const NO_TRAIL: readonly string[] = [];

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
  const hostRunbookId = useStore(
    (state) => getActiveTab(state)?.runbookId ?? null,
  );

  const library = useStore((state) => state.runbookLibrary);
  const readRunbookStats = useStore((state) => state.readRunbookStats);
  const language = useStore((state) => state.language);
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const isMirror = useCodeRendering() === CodeRendering.STATIC;

  const setRunbookEmbedView = useStore((state) => state.setRunbookEmbedView);
  const view = useStore((state) =>
    getRunbookEmbedView(getActiveTab(state), blockId),
  );

  const updateBlock = useStore((state) => state.updateBlock);
  const listEmbeddableCloudFolder = useStore(
    (state) => state.listEmbeddableCloudFolder,
  );
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const host = useMemo(
    () => ({ variableMap, secretKeys }),
    [variableMap, secretKeys],
  );
  const trail = useMemo(
    () => (hostRunbookId ? [localSourceKey(hostRunbookId)] : NO_TRAIL),
    [hostRunbookId],
  );

  const embed = useEmbeddedRunbook(block, host, trail);
  const local = embed.source?.local ?? null;

  // A path is only looked up once it's committed
  const [pathDraft, setPathDraft] = useState(cloudPath);
  useEffect(() => setPathDraft(cloudPath), [cloudPath]);

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

  // Every library runbook except the current one
  const choices = useMemo(() => {
    const byLabel = new Map<string, EditorChoice>();

    for (const { id, label } of library) {
      if (id === hostRunbookId || !label.trim() || byLabel.has(label)) {
        continue;
      }

      byLabel.set(label, {
        label: displayLabel(label, t),
        value: label,
        describe: async () => {
          const stats = await readRunbookStats(id);
          return stats
            ? t.runbookBlock.choiceStats(
                formatFileSize(stats.bytes, language),
                stats.blocks,
                stats.variables,
              )
            : undefined;
        },
      });
    }

    return [...byLabel.values()];
  }, [library, hostRunbookId, readRunbookStats, language, t]);

  // The folder typed so far, one level at a time
  const provider = cloud?.provider ?? null;
  const pathChoices = useMemo<ChoiceSource | undefined>(() => {
    if (!provider) {
      return undefined;
    }

    const separator = RunbookBlockConfig.PATH_SEPARATOR;
    const describe = (entry: CloudEntry) =>
      entry.isFolder
        ? entry.itemCount === null
          ? undefined
          : t.cloudModal.folderItemCount(entry.itemCount)
        : entry.size === null
          ? undefined
          : formatFileSize(entry.size, language);

    return async (text) => {
      const folder = text.slice(0, text.lastIndexOf(separator) + 1);
      const entries = await listEmbeddableCloudFolder(provider, folder);
      if (!entries) {
        return [];
      }

      const choices = entries.map((entry): EditorChoice => {
        const value = folder + entry.name;
        return entry.isFolder
          ? {
              label: entry.name,
              value: value + separator,
              describe: () => describe(entry),
              folder: true,
            }
          : {
              label: entry.name,
              value,
              describe: () => describe(entry),
              onPick: () =>
                updateBlock(blockId, BlockType.RUNBOOK, {
                  cloud: { provider, path: value },
                }),
            };
      });

      const segments = cloudPathSegments(folder);
      if (segments.length > 0) {
        const parent = segments.slice(0, -1);
        choices.push({
          label: RunbookBlockConfig.PARENT_FOLDER_LABEL,
          value: parent.map((segment) => segment + separator).join(""),
          describe: () => t.runbookBlock.parentFolder,
          folder: true,
          pinned: true,
        });
      }

      return choices;
    };
  }, [provider, listEmbeddableCloudFolder, updateBlock, blockId, language, t]);

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
    setPathDraft(path);
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

  const canSwitchView =
    !collapsed && !!embed.content && !embed.circular && !embed.tooDeep;

  const unresolved = cloud
    ? embed.status === EmbeddedRunbookStatus.MISSING
    : !local && !!label.trim();

  // Labels

  const dragImageLabel = cloud
    ? pathDraft || t.runbookBlock.pathPlaceholder
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
      <div
        className="runbook-block-drag-image"
        aria-hidden
        {...{ [DataAttr.DRAG_IMAGE]: "" }}
      >
        <RunbookIcon className="icon-md icon-bold" />
        {dragImageLabel}
      </div>

      {(!readMode || canSwitchView || !!local) && (
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
              value={cloud ? pathDraft : label}
              language={EditorLanguage.CHOICE}
              choices={cloud ? pathChoices : choices}
              singleLine
              gutter={false}
              placeholder={
                cloud
                  ? t.runbookBlock.pathPlaceholder
                  : t.runbookBlock.labelPlaceholder
              }
              onChange={(text) =>
                cloud
                  ? changePath(text)
                  : updateBlock(blockId, BlockType.RUNBOOK, {
                      label: text,
                      runbookId: undefined,
                    })
              }
              onBlur={() => commitPath(pathDraft)}
              onFocus={() => {
                if (cloud ? !embed.content : !local) {
                  sourceRef.current?.suggest();
                }
              }}
            />
          )}

          <div className={CssClass.RUNBOOK_EMBED_ACTIONS}>
            {canSwitchView && (
              <button
                className="btn btn-flat-icon"
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
                  <BodyText className="icon-md" />
                ) : (
                  <Braces className="icon-md" />
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
