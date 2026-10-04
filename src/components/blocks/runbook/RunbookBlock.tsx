import { RunbookBlockConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
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
import { ProviderSelect } from "@/components/modals/cloud/ProviderSelect";
import { useKeepInView } from "@/hooks/useKeepInView";
import { useTranslation } from "@/i18n";
import type { EditorChoice } from "@/monaco/completions";
import { getActiveTab, getRunbookEmbedView, useStore } from "@/store/store";
import { localSourceKey } from "@/utils/embeddedRunbook";
import { formatFileSize } from "@/utils/format";
import { displayLabel } from "@/utils/runbook";
import { classNames, countCharacters } from "@/utils/string";
import type { CSSProperties } from "react";
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

  const pathRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<CodeEditorHandle>(null);

  useEffect(() => {
    if (!pendingFocus) {
      return;
    }

    if (cloud) {
      pathRef.current?.focus({ preventScroll: true });
    } else {
      labelRef.current?.focus();
    }

    consumeBlockFocus();
  }, [pendingFocus, consumeBlockFocus, cloud]);

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

  const changeSource = (destination: SyncDestination) =>
    updateBlock(blockId, BlockType.RUNBOOK, {
      cloud:
        destination === SyncDestination.LOCAL
          ? undefined
          : { provider: destination, path: cloudPath },
    });

  const commitPath = () => {
    if (!cloud || cloudPath === pathDraft) {
      return;
    }

    updateBlock(blockId, BlockType.RUNBOOK, {
      cloud: { ...cloud, path: pathDraft },
    });
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
      {(!readMode || canSwitchView || !!local) && (
        <div
          className={classNames(
            "runbook-block-header",
            CssClass.SELECT_KEY_INERT_CHILDREN,
          )}
          {...{ [DataAttr.DRAG_IMAGE]: "" }}
        >
          {!readMode && (
            <ProviderSelect
              provider={cloud?.provider ?? SyncDestination.LOCAL}
              onChange={changeSource}
              title={t.runbookBlock.changeSource}
              portal
            />
          )}

          {readMode ? null : cloud ? (
            <input
              ref={pathRef}
              className={classNames(
                "runbook-block-input",
                unresolved && "is-unresolved",
              )}
              style={
                {
                  [RunbookBlockConfig.PATH_COLUMNS_PROPERTY]:
                    countCharacters(pathDraft) + 1,
                } as CSSProperties
              }
              value={pathDraft}
              placeholder={t.runbookBlock.pathPlaceholder}
              spellCheck={false}
              onChange={(event) => setPathDraft(event.target.value)}
              onBlur={commitPath}
              onKeyDown={(event) => {
                if (event.key === Key.ENTER) {
                  commitPath();
                }
              }}
            />
          ) : (
            <CodeEditor
              ref={labelRef}
              modelId={`${CodeModelScope.RUNBOOK_LABEL}/${blockId}`}
              className={classNames(
                "runbook-block-label",
                unresolved && "is-unresolved",
              )}
              value={label}
              language={EditorLanguage.CHOICE}
              choices={choices}
              singleLine
              gutter={false}
              placeholder={t.runbookBlock.labelPlaceholder}
              onChange={(label) =>
                updateBlock(blockId, BlockType.RUNBOOK, {
                  label,
                  runbookId: undefined,
                })
              }
              onFocus={() => {
                if (!local) {
                  labelRef.current?.suggest();
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
